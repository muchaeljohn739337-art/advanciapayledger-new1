import Stripe from 'stripe';
import { logger } from "../lib/logger";
import prismaClient from "../lib/prisma";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    })
  : null;

export class StripeService {

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return stripe !== null;
  }

  /**
   * Create virtual card for user
   */
  async createVirtualCard(
    userId: string,
    amount: number,
    userDetails: {
      name: string;
      email: string;
      phoneNumber: string;
      address?: {
        line1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
    }
  ) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to .env');
    }

    const billingAddress = userDetails.address ?? {
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94111',
      country: 'US',
    };

    try {
      // Create Stripe Issuing cardholder first
      const cardholder = await stripe.issuing.cardholders.create({
        name: userDetails.name,
        email: userDetails.email,
        phone_number: userDetails.phoneNumber,
        billing: {
          address: {
            line1: billingAddress.line1,
            city: billingAddress.city,
            state: billingAddress.state,
            postal_code: billingAddress.postalCode,
            country: billingAddress.country,
          },
        },
        type: 'individual',
      });

      // Create virtual card
      const card = await stripe.issuing.cards.create({
        cardholder: cardholder.id,
        type: 'virtual',
        currency: 'usd',
        status: 'active',
        spending_controls: {
          spending_limits: [{
            amount: Math.round(amount * 100), // Convert to cents
            interval: 'all_time',
          }],
        },
        metadata: {
          userId,
        },
      });

      return {
        id: card.id,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        brand: card.brand,
        status: card.status,
        cardholderId: cardholder.id,
      };
    } catch (error: any) {
      logger.error('Stripe card creation error:', error);
      throw new Error(`Failed to create virtual card: ${error.message}`);
    }
  }

  /**
   * Get card details
   */
  async getCard(cardId: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const card = await stripe.issuing.cards.retrieve(cardId);

      return {
        id: card.id,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        brand: card.brand,
        status: card.status,
        spendingLimit: card.spending_controls?.spending_limits?.[0]?.amount || 0,
      };
    } catch (error: any) {
      logger.error('Stripe card retrieval error:', error);
      throw new Error(`Failed to retrieve card: ${error.message}`);
    }
  }

  /**
   * Update card spending limit (fund card)
   */
  async updateCardLimit(cardId: string, newAmount: number) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const card = await stripe.issuing.cards.update(cardId, {
        spending_controls: {
          spending_limits: [{
            amount: Math.round(newAmount * 100),
            interval: 'all_time',
          }],
        },
      });

      return {
        success: true,
        cardId: card.id,
        newLimit: card.spending_controls?.spending_limits?.[0]?.amount || 0,
      };
    } catch (error: any) {
      logger.error('Stripe card update error:', error);
      throw new Error(`Failed to update card limit: ${error.message}`);
    }
  }

  /**
   * Freeze/unfreeze card
   */
  async setCardStatus(cardId: string, active: boolean) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const card = await stripe.issuing.cards.update(cardId, {
        status: active ? 'active' : 'inactive',
      });

      return {
        success: true,
        cardId: card.id,
        status: card.status,
      };
    } catch (error: any) {
      logger.error('Stripe card status update error:', error);
      throw new Error(`Failed to update card status: ${error.message}`);
    }
  }

  /**
   * Get card transactions
   */
  async getCardTransactions(cardId: string, limit: number = 10) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    // Stripe Issuing transactions.list maximum is 100
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);

    try {
      const transactions = await stripe.issuing.transactions.list({
        card: cardId,
        limit: safeLimit,
      });

      return transactions.data.map(tx => ({
        id: tx.id,
        amount: tx.amount / 100,
        currency: tx.currency,
        merchant: tx.merchant_data.name,
        status: tx.type,
        created: new Date(tx.created * 1000).toISOString(),
      }));
    } catch (error: any) {
      logger.error('Stripe transactions retrieval error:', error);
      throw new Error(`Failed to retrieve transactions: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(payload: any, signature: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      switch (event.type) {
        case 'issuing_authorization.created': {
          const auth = event.data.object as Stripe.Issuing.Authorization;
          logger.info('[Stripe] issuing_authorization.created — id:', auth.id);
          try {
            const card = await prismaClient.virtualCard.findFirst({
              where: { stripeCardId: auth.card.id },
            });
            if (card) {
              await prismaClient.cardTransaction.create({
                data: {
                  cardId: card.id,
                  amount: auth.amount / 100,
                  currency: auth.currency.toUpperCase(),
                  merchant: auth.merchant_data?.name ?? null,
                  status: auth.approved ? 'APPROVED' : 'DECLINED',
                  stripeId: auth.id,
                },
              });
            }
          } catch (err: any) {
            logger.error('[Stripe] Failed to record authorization:', err.message);
          }
          break;
        }
        case 'issuing_authorization.updated': {
          const auth = event.data.object as Stripe.Issuing.Authorization;
          logger.info('[Stripe] issuing_authorization.updated — id:', auth.id);
          try {
            await prismaClient.cardTransaction.updateMany({
              where: { stripeId: auth.id },
              data: { status: auth.approved ? 'APPROVED' : 'DECLINED' },
            });
          } catch (err: any) {
            logger.error('[Stripe] Failed to update authorization:', err.message);
          }
          break;
        }
        case 'issuing_transaction.created': {
          const tx = event.data.object as Stripe.Issuing.Transaction;
          logger.info('[Stripe] issuing_transaction.created — id:', tx.id);
          try {
            const card = await prismaClient.virtualCard.findFirst({
              where: { stripeCardId: tx.card as string },
            });
            if (card) {
              // Upsert: authorization may already exist with same stripeId suffix
              const existing = await prismaClient.cardTransaction.findFirst({
                where: { stripeId: tx.authorization ?? tx.id },
              });
              if (existing) {
                await prismaClient.cardTransaction.updateMany({
                  where: { stripeId: tx.authorization ?? tx.id },
                  data: { status: 'COMPLETED', stripeId: tx.id },
                });
              } else {
                await prismaClient.cardTransaction.create({
                  data: {
                    cardId: card.id,
                    amount: Math.abs(tx.amount) / 100,
                    currency: tx.currency.toUpperCase(),
                    merchant: tx.merchant_data?.name ?? null,
                    status: 'COMPLETED',
                    stripeId: tx.id,
                  },
                });
              }
            }
          } catch (err: any) {
            logger.error('[Stripe] Failed to record issuing transaction:', err.message);
          }
          break;
        }
        case 'issuing_card.created':
          logger.info('[Stripe] issuing_card.created — id:', (event.data.object as any).id);
          break;
        case 'issuing_card.updated':
          logger.info('[Stripe] issuing_card.updated — id:', (event.data.object as any).id);
          break;
        default:
          logger.info('[Stripe] Unhandled event type:', event.type);
      }

      return { received: true, type: event.type };
    } catch (error: any) {
      logger.error('Stripe webhook error:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
