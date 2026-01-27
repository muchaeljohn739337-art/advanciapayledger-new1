import { Router, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";

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
      console.error("Create payment intent error:", error);
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
      console.error("Create subscription error:", error);
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
      console.error("Cancel subscription error:", error);
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
      console.error("Get subscriptions error:", error);
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
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("PaymentIntent succeeded:", paymentIntent.id);
        // TODO: Update database with successful payment
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("PaymentIntent failed:", failedPayment.id);
        // TODO: Handle failed payment
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        console.log("Subscription updated:", subscription.id);
        // TODO: Update user subscription status
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        console.log("Subscription deleted:", deletedSubscription.id);
        // TODO: Remove user subscription
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        console.log("Invoice paid:", invoice.id);
        // TODO: Record payment in database
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        console.log("Invoice payment failed:", failedInvoice.id);
        // TODO: Notify user of failed payment
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
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
      console.error("Invalid NOWPayments webhook signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const event = req.body;
    console.log("NOWPayments webhook received:", {
      payment_id: event.payment_id,
      status: event.payment_status,
      order_id: event.order_id,
    });

    // Import and use the same logic as the crypto webhook
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    try {
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
          console.log("✅ Payment completed:", payment_id);
          
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
              console.log(`Deposit ${payment_id} already processed`);
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

            console.log(
              `✅ Balance credited: ${depositAmount} ${depositCurrency} to user ${order_id}`
            );
          });
          break;

        case "failed":
        case "expired":
          console.log("❌ Payment failed/expired:", payment_id);
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
          console.log("⏳ Payment confirming:", payment_id);
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
          console.log("ℹ️ Payment status update:", payment_status);
      }
    } finally {
      await prisma.$disconnect();
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("NOWPayments webhook error:", error);
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
      console.error("Get payment history error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to get payment history" });
    }
  }
);

export default router;
