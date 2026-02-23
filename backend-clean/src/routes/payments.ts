import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import { logger } from "../lib/logger";

const router = Router();

// Stripe will be initialized when API key is provided
let stripe: any = null;

const initializeStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// Create payment intent
router.post(
  "/create-intent",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const stripeClient = initializeStripe();
      if (!stripeClient) {
        res.status(503).json({ error: "Stripe not configured" });
        return;
      }

      const { amount, currency, description } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ error: "Valid amount is required" });
        return;
      }

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || "usd",
        description: description || "Payment",
        metadata: {
          userId: req.user?.userId,
          email: req.user?.email,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
    } catch (error: any) {
      logger.error("Create payment intent error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create payment intent" });
    }
  }
);

// Create subscription
router.post(
  "/subscribe",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const stripeClient = initializeStripe();
      if (!stripeClient) {
        res.status(503).json({ error: "Stripe not configured" });
        return;
      }

      const { priceId, paymentMethodId } = req.body;

      if (!priceId) {
        res.status(400).json({ error: "Price ID is required" });
        return;
      }

      // Create or retrieve customer
      let customer;
      const existingCustomers = await stripeClient.customers.list({
        email: req.user?.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripeClient.customers.create({
          email: req.user?.email,
          metadata: {
            userId: req.user?.userId,
          },
        });
      }

      // Attach payment method if provided
      if (paymentMethodId) {
        await stripeClient.paymentMethods.attach(paymentMethodId, {
          customer: customer.id,
        });

        await stripeClient.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Create subscription
      const subscription = await stripeClient.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status,
      });
    } catch (error: any) {
      logger.error("Create subscription error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to create subscription" });
    }
  }
);

// Cancel subscription
router.post(
  "/cancel-subscription",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const stripeClient = initializeStripe();
      if (!stripeClient) {
        res.status(503).json({ error: "Stripe not configured" });
        return;
      }

      const { subscriptionId } = req.body;

      if (!subscriptionId) {
        res.status(400).json({ error: "Subscription ID is required" });
        return;
      }

      const subscription = await stripeClient.subscriptions.cancel(
        subscriptionId
      );

      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        canceledAt: subscription.canceled_at,
      });
    } catch (error: any) {
      logger.error("Cancel subscription error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to cancel subscription" });
    }
  }
);

// Get customer subscriptions
router.get(
  "/subscriptions",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const stripeClient = initializeStripe();
      if (!stripeClient) {
        res.status(503).json({ error: "Stripe not configured" });
        return;
      }

      // Find customer by email
      const customers = await stripeClient.customers.list({
        email: req.user?.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        res.json({ subscriptions: [] });
        return;
      }

      const subscriptions = await stripeClient.subscriptions.list({
        customer: customers.data[0].id,
      });

      res.json({
        subscriptions: subscriptions.data.map((sub: any) => ({
          id: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          items: sub.items.data.map((item: any) => ({
            priceId: item.price.id,
            amount: item.price.unit_amount,
            currency: item.price.currency,
            interval: item.price.recurring?.interval,
          })),
        })),
      });
    } catch (error: any) {
      logger.error("Get subscriptions error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to get subscriptions" });
    }
  }
);

// Webhook handler
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const stripeClient = initializeStripe();
    if (!stripeClient) {
      res.status(503).json({ error: "Stripe not configured" });
      return;
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      res.status(400).json({ error: "Missing signature or webhook secret" });
      return;
    }

    let event;
    try {
      event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      logger.error("Webhook signature verification failed:", err.message);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        logger.info("PaymentIntent succeeded:", paymentIntent.id);
        try {
          const userId = paymentIntent.metadata?.userId;
          if (userId) {
            const wallet = await prisma.wallet.findFirst({ where: { userId } });
            if (wallet) {
              const amount = paymentIntent.amount_received / 100;
              const currency = paymentIntent.currency.toUpperCase();
              await prisma.$transaction(async (tx: any) => {
                // Idempotency: skip if already recorded
                const existing = await tx.transaction.findFirst({
                  where: { txHash: paymentIntent.id },
                });
                if (existing) return;

                await tx.transaction.create({
                  data: {
                    userId,
                    walletId: wallet.id,
                    type: "DEPOSIT",
                    amount,
                    currency,
                    status: "COMPLETED",
                    method: "STRIPE",
                    txHash: paymentIntent.id,
                    description: paymentIntent.description || "Stripe payment",
                    metadata: { stripePaymentIntentId: paymentIntent.id },
                  },
                });
                await tx.wallet.update({
                  where: { id: wallet.id },
                  data: { balance: { increment: amount } },
                });
                await tx.notification.create({
                  data: {
                    userId,
                    type: "transaction",
                    title: "Payment Successful",
                    message: `Your payment of ${amount} ${currency} was successful.`,
                    read: false,
                    metadata: { paymentIntentId: paymentIntent.id },
                  },
                });
              });
            }
          }
        } catch (err: any) {
          logger.error("[Stripe] payment_intent.succeeded DB error:", err.message);
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        logger.info("PaymentIntent failed:", failedPayment.id);
        try {
          const userId = failedPayment.metadata?.userId;
          if (userId) {
            const wallet = await prisma.wallet.findFirst({ where: { userId } });
            if (wallet) {
              await prisma.transaction.create({
                data: {
                  userId,
                  walletId: wallet.id,
                  type: "PAYMENT",
                  amount: failedPayment.amount / 100,
                  currency: failedPayment.currency.toUpperCase(),
                  status: "FAILED",
                  method: "STRIPE",
                  txHash: `failed_${failedPayment.id}`,
                  description: failedPayment.last_payment_error?.message || "Payment failed",
                  metadata: {
                    stripePaymentIntentId: failedPayment.id,
                    failureCode: failedPayment.last_payment_error?.code,
                    failureMessage: failedPayment.last_payment_error?.message,
                  },
                },
              });
              await prisma.notification.create({
                data: {
                  userId,
                  type: "transaction",
                  title: "Payment Failed",
                  message: `Your payment could not be processed. ${failedPayment.last_payment_error?.message || "Please try again."}`,
                  read: false,
                  metadata: { paymentIntentId: failedPayment.id },
                },
              });
            }
          }
        } catch (err: any) {
          logger.error("[Stripe] payment_intent.payment_failed DB error:", err.message);
        }
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        logger.info("Subscription updated:", subscription.id);
        try {
          // Look up userId via existing subscription record or customer metadata
          const existingSub = await prisma.subscription.findUnique({
            where: { stripeId: subscription.id },
          });
          const userId = existingSub?.userId ||
            (subscription.metadata?.userId as string) || null;
          if (userId) {
            await prisma.subscription.upsert({
              where: { stripeId: subscription.id },
              update: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
              create: {
                userId,
                customerId: subscription.customer as string,
                planId: subscription.items.data[0]?.price?.product as string || "unknown",
                stripeId: subscription.id,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            });
          }
        } catch (err: any) {
          logger.error("[Stripe] subscription.updated DB error:", err.message);
        }
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        logger.info("Subscription deleted:", deletedSubscription.id);
        try {
          await prisma.subscription.updateMany({
            where: { stripeId: deletedSubscription.id },
            data: { status: "canceled" },
          });
        } catch (err: any) {
          logger.error("[Stripe] subscription.deleted DB error:", err.message);
        }
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        logger.info("Invoice paid:", invoice.id);
        try {
          const invoiceSub = await prisma.subscription.findFirst({
            where: { customerId: invoice.customer as string },
          });
          if (invoiceSub) {
            const amount = (invoice.amount_paid || 0) / 100;
            const currency = (invoice.currency || "usd").toUpperCase();
            // Ensure period fields exist before using them
            const existing = await prisma.transaction.findFirst({
              where: { txHash: invoice.id },
            });
            if (!existing) {
              await prisma.transaction.create({
                data: {
                  userId: invoiceSub.userId,
                  type: "PAYMENT",
                  amount,
                  currency,
                  status: "COMPLETED",
                  method: "STRIPE_SUBSCRIPTION",
                  txHash: invoice.id,
                  description: `Subscription invoice ${invoice.number || invoice.id}`,
                  metadata: {
                    invoiceId: invoice.id,
                    subscriptionId: invoice.subscription,
                  },
                },
              });
            }
          }
        } catch (err: any) {
          logger.error("[Stripe] invoice.payment_succeeded DB error:", err.message);
        }
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        logger.info("Invoice payment failed:", failedInvoice.id);
        try {
          const failedSub = await prisma.subscription.findFirst({
            where: { customerId: failedInvoice.customer as string },
          });
          if (failedSub) {
            await prisma.notification.create({
              data: {
                userId: failedSub.userId,
                type: "billing",
                title: "Subscription Payment Failed",
                message: "We were unable to charge your payment method for your subscription. Please update your payment details.",
                read: false,
                metadata: {
                  invoiceId: failedInvoice.id,
                  subscriptionId: failedInvoice.subscription,
                  attemptCount: failedInvoice.attempt_count,
                },
              },
            });
            // Mark subscription as past_due
            await prisma.subscription.updateMany({
              where: { stripeId: failedInvoice.subscription as string },
              data: { status: "past_due" },
            });
          }
        } catch (err: any) {
          logger.error("[Stripe] invoice.payment_failed DB error:", err.message);
        }
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// NOWPayments webhook handler
router.post("/nowpayments/webhook", async (req: Request, res: Response) => {
  try {
    const { getNowPaymentsService } = await import("../services/nowPaymentsService");
    const nowPayments = getNowPaymentsService();
    
    if (!nowPayments) {
      res.status(503).json({ error: "NOWPayments service not configured" });
      return;
    }

    const signature = req.headers["x-nowpayments-sig"] as string;
    const payload = JSON.stringify(req.body);

    if (!nowPayments.verifyWebhookSignature(payload, signature)) {
      logger.error("Invalid NOWPayments webhook signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const event = req.body;
    logger.info("NOWPayments webhook received:", {
      payment_id: event.payment_id,
      status: event.payment_status,
      order_id: event.order_id,
    });

    // Handle payment status using shared prisma singleton
    const {
        payment_id,
        payment_status,
        pay_amount,
        pay_currency,
        price_amount,
        price_currency,
        order_id,
        actually_paid,
        outcome_amount,
        outcome_currency,
        pay_address,
      } = event;

      // Handle different payment statuses
      switch (payment_status) {
        case "finished":
          logger.info("✅ Payment completed:", payment_id);
          
          await prisma.$transaction(async (tx: any) => {
            const wallet = await tx.wallet.findFirst({
              where: { userId: order_id },
            });

            if (!wallet) {
              throw new Error(`Wallet not found for user ${order_id}`);
            }

            const existingDeposit = await tx.cryptoDeposit.findUnique({
              where: { txHash: payment_id },
            });

            if (existingDeposit && existingDeposit.status === "CONFIRMED") {
              logger.info(`Deposit ${payment_id} already processed`);
              return;
            }

            const depositAmount = parseFloat(outcome_amount || price_amount);
            const depositCurrency = outcome_currency || price_currency;

            const deposit = await tx.cryptoDeposit.upsert({
              where: { txHash: payment_id },
              update: {
                status: "CONFIRMED",
                confirmations: 999,
                confirmedAt: new Date(),
                amount: depositAmount,
                currency: depositCurrency,
              },
              create: {
                walletId: wallet.id,
                amount: depositAmount,
                currency: depositCurrency,
                payCurrency: pay_currency,
                payAmount: parseFloat(pay_amount),
                txHash: payment_id,
                confirmations: 999,
                status: "CONFIRMED",
                orderId: order_id,
                payAddress: pay_address,
                confirmedAt: new Date(),
                metadata: event,
              },
            });

            const updatedWallet = await tx.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: { increment: depositAmount },
              },
            });

            await tx.transaction.create({
              data: {
                userId: order_id,
                walletId: wallet.id,
                type: "DEPOSIT",
                amount: depositAmount,
                currency: depositCurrency,
                status: "COMPLETED",
                method: "CRYPTO_USDC",
                cryptoTxHash: payment_id,
                metadata: {
                  payment_id,
                  pay_amount,
                  pay_currency,
                  actually_paid,
                  outcome_amount,
                  outcome_currency,
                },
              },
            });

            await tx.notification.create({
              data: {
                userId: order_id,
                type: "transaction",
                title: "Crypto Deposit Received",
                message: `Your deposit of ${depositAmount} ${depositCurrency} has been confirmed and credited to your wallet.`,
                read: false,
                metadata: {
                  depositId: deposit.id,
                  amount: depositAmount,
                  currency: depositCurrency,
                },
              },
            });

            logger.info(
              `✅ Balance credited: ${depositAmount} ${depositCurrency} to user ${order_id}`
            );
          });
          break;

        case "failed":
        case "expired":
          logger.info("❌ Payment failed/expired:", payment_id);
          // Record failed payment
          const wallet = await prisma.wallet.findFirst({
            where: { userId: order_id },
          });

          if (wallet) {
            await prisma.cryptoDeposit.upsert({
              where: { txHash: payment_id },
              update: { status: "FAILED", metadata: event },
              create: {
                walletId: wallet.id,
                amount: parseFloat(price_amount || "0"),
                currency: price_currency || "USD",
                payCurrency: pay_currency,
                payAmount: parseFloat(pay_amount || "0"),
                txHash: payment_id,
                status: "FAILED",
                orderId: order_id,
                metadata: event,
              },
            });
          }
          break;

        case "confirming":
          logger.info("⏳ Payment confirming:", payment_id);
          // Update status to confirming
          const confirmingWallet = await prisma.wallet.findFirst({
            where: { userId: order_id },
          });

          if (confirmingWallet) {
            await prisma.cryptoDeposit.upsert({
              where: { txHash: payment_id },
              update: {
                status: "CONFIRMING",
                confirmations: 1,
                metadata: event,
              },
              create: {
                walletId: confirmingWallet.id,
                amount: parseFloat(price_amount || "0"),
                currency: price_currency || "USD",
                payCurrency: pay_currency,
                payAmount: parseFloat(pay_amount || "0"),
                txHash: payment_id,
                status: "CONFIRMING",
                confirmations: 1,
                orderId: order_id,
                payAddress: pay_address,
                metadata: event,
              },
            });
          }
          break;

        default:
          logger.info("ℹ️ Payment status update:", payment_status);
      }

    res.json({ received: true });
  } catch (error: any) {
    logger.error("NOWPayments webhook error:", error);
    res.status(200).json({ error: "Processing error logged" });
  }
});

// Get payment history
router.get(
  "/history",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const stripeClient = initializeStripe();
      if (!stripeClient) {
        res.status(503).json({ error: "Stripe not configured" });
        return;
      }

      // Find customer by email
      const customers = await stripeClient.customers.list({
        email: req.user?.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        res.json({ payments: [] });
        return;
      }

      const charges = await stripeClient.charges.list({
        customer: customers.data[0].id,
        limit: 10,
      });

      res.json({
        payments: charges.data.map((charge: any) => ({
          id: charge.id,
          amount: charge.amount / 100,
          currency: charge.currency,
          status: charge.status,
          description: charge.description,
          createdAt: new Date(charge.created * 1000).toISOString(),
        })),
      });
    } catch (error: any) {
      logger.error("Get payment history error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to get payment history" });
    }
  }
);

export default router;
