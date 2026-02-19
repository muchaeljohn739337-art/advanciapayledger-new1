/**
 * Centralized API configuration
 * All API URLs should use this config instead of hardcoded values
 */

// Get API URL - CREATOR CONTROL: Localhost only
export const API_URL = "http://localhost:4000";

// Ensure no trailing slash
export const API_BASE_URL = API_URL.replace(/\/$/, "");

// Common API endpoints
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  USERS: `${API_BASE_URL}/api/users`,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  CRYPTO: `${API_BASE_URL}/api/crypto`,
  REWARDS: `${API_BASE_URL}/api/rewards`,
  SUPPORT: `${API_BASE_URL}/api/support`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  AI: `${API_BASE_URL}/api/ai`,
  COMPLIANCE: `${API_BASE_URL}/api/compliance`,
} as const;

// External service URLs (these are intentionally hardcoded as they're external)
export const EXTERNAL_URLS = {
  TWITTER: "https://twitter.com",
  FACEBOOK: "https://facebook.com",
  LINKEDIN: "https://linkedin.com",
  DISCORD: "https://discord.com",
  TELEGRAM: "https://t.me",
  WHATSAPP: "https://wa.me",
} as const;

// App URLs
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "https://advanciapayledger.com");

export const APP_URLS = {
  HOME: APP_URL,
  FINANCE: `${APP_URL}/finance`,
  DASHBOARD: `${APP_URL}/dashboard`,
  UNSUBSCRIBE: `${APP_URL}/unsubscribe`,
  PRIVACY: `${APP_URL}/privacy`,
} as const;
