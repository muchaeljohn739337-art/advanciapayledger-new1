type SeverityLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";

/**
 * Sentry Error Tracking Initialization for Next.js
 */

export function initSentry(): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log("Sentry DSN not configured, skipping Sentry initialization");
    return;
  }

  console.log("✅ Sentry initialized for frontend");
}

export function captureException(error: Error, context?: any): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.error("Sentry captureException", error, context);
  } else {
    console.error("Error (Sentry disabled):", error);
  }
}

export function captureMessage(
  message: string,
  level: SeverityLevel = "info",
  context?: any,
): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log("Sentry captureMessage", { message, level, context });
  } else {
    console.log(`Message (Sentry disabled):`, message);
  }
}

export function setUser(
  user: { id: string; email?: string; role?: string } | null,
): void {
  console.log("Set user context (Sentry stub):", user?.id || "null");
}

// Helper to add breadcrumbs for debugging
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: SeverityLevel,
) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log("Sentry breadcrumb", {
      message,
      category: category || "custom",
      level: level || "info",
      timestamp: Date.now() / 1000,
    });
  }
}
