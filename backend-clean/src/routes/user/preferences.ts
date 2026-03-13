import { Router } from "express";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";

const router = Router();

const defaultPreferences = {
  preferredPaymentMethod: "STRIPE_CARD",
  currency: "USD",
  language: "en",
  timezone: "UTC",
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  twoFactorEnabled: false,
  biometricEnabled: false,
  autoBackup: false,
  darkMode: false,
};

function paramToString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value ?? "");
}

// Get user preferences
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const preferences = {
      userId,
      ...defaultPreferences,
    };

    res.json({
      success: true,
      preferences,
    });
  } catch (error) {
    logger.error("Error fetching user preferences:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update user preferences
router.put("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      preferredPaymentMethod,
      currency,
      language,
      timezone,
      emailNotifications,
      smsNotifications,
      pushNotifications,
      twoFactorEnabled,
      biometricEnabled,
      autoBackup,
      darkMode,
    } = req.body;

    const preferences = {
      userId,
      ...defaultPreferences,
      ...(preferredPaymentMethod !== undefined && { preferredPaymentMethod }),
      ...(currency !== undefined && { currency }),
      ...(language !== undefined && { language }),
      ...(timezone !== undefined && { timezone }),
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(smsNotifications !== undefined && { smsNotifications }),
      ...(pushNotifications !== undefined && { pushNotifications }),
      ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
      ...(biometricEnabled !== undefined && { biometricEnabled }),
      ...(autoBackup !== undefined && { autoBackup }),
      ...(darkMode !== undefined && { darkMode }),
    };

    res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences,
    });
  } catch (error) {
    logger.error("Error updating user preferences:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update specific preference
router.patch("/:field", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const field = paramToString((req.params as any).field);
    const { value } = req.body;

    // Validate field name
    const allowedFields = [
      "preferredPaymentMethod",
      "currency",
      "language",
      "timezone",
      "emailNotifications",
      "smsNotifications",
      "pushNotifications",
      "twoFactorEnabled",
      "biometricEnabled",
      "autoBackup",
      "darkMode",
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        error: "Invalid field name",
      });
    }

    const preferences = {
      userId,
      ...defaultPreferences,
      [field]: value,
    };

    res.json({
      success: true,
      message: `${field} updated successfully`,
      preferences,
    });
  } catch (error) {
    logger.error(`Error updating ${paramToString((req.params as any).field)}:`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get available payment methods
router.get("/payment-methods", authenticate, async (req: AuthRequest, res) => {
  try {
    const paymentMethods = [
      { value: "STRIPE_CARD", label: "Credit/Debit Card", icon: "💳" },
      { value: "STRIPE_ACH", label: "Bank Transfer (ACH)", icon: "🏦" },
      { value: "CRYPTO_USDC", label: "USDC (Crypto)", icon: "🪙" },
      { value: "CRYPTO_ETH", label: "Ethereum", icon: "🔷" },
      { value: "BANK_WIRE", label: "Wire Transfer", icon: "🏛️" },
      { value: "PAYPAL", label: "PayPal", icon: "💰" },
      { value: "APPLE_PAY", label: "Apple Pay", icon: "🍎" },
      { value: "GOOGLE_PAY", label: "Google Pay", icon: "🤖" },
    ];

    res.json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    logger.error("Error fetching payment methods:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
