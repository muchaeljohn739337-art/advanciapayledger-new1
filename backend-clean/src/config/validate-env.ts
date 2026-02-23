import { logger } from "../lib/logger";

export function validateEnvironment() {
  const required = [
    "DATABASE_URL",
    "JWT_SECRET",
    "FRONTEND_URL",
    "BACKEND_URL",
  ];

  // Critical production checks
  if (process.env.NODE_ENV === "production") {
    required.push(
      "POSTMARK_API_KEY",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "NOWPAYMENTS_API_KEY",
      "NOWPAYMENTS_IPN_SECRET",
      "ETH_PROVIDER_URL",
      "ADMIN_KEY"
    );

    // Security validation
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      logger.error(
        "❌ JWT_SECRET must be at least 32 characters in production"
      );
      process.exit(1);
    }

    if (jwtSecret && jwtSecret.includes("your-super-secure")) {
      logger.error(
        "❌ JWT_SECRET must be changed from default value in production"
      );
      process.exit(1);
    }

    // URL security: enforce HTTPS in production
    const frontendUrl = process.env.FRONTEND_URL;
    const backendUrl = process.env.BACKEND_URL;
    if (frontendUrl && !frontendUrl.startsWith("https://")) {
      logger.error("❌ FRONTEND_URL must use HTTPS in production");
      process.exit(1);
    }
    if (backendUrl && !backendUrl.startsWith("https://")) {
      logger.error("❌ BACKEND_URL must use HTTPS in production");
      process.exit(1);
    }
  }

  const missing = required.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    logger.error("❌ Missing required environment variables:", missing);
    process.exit(1);
  }

  logger.info("✅ Environment validation passed");
}
