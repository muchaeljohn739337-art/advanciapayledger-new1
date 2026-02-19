/**
 * Server IP Configuration - Advancia Pay Ledger
 * 
 * Whitelisted and configured server IPs
 */

export const SERVER_IPS = {
  // Production servers
  PRODUCTION: [
    '134.199.243.224', // Added server IP
    '216.198.79.1',    // DigitalOcean backend
    // Add more production IPs as needed
  ],

  // Development servers
  DEVELOPMENT: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    // Add development IPs as needed
  ],

  // API endpoints
  API_ENDPOINTS: [
    'https://advanciapayledger.com',
    'https://api.advanciapayledger.com',
    'http://localhost:4000',
    'http://134.199.243.224:4000', // Server IP with port
  ],

  // Webhook endpoints
  WEBHOOK_ENDPOINTS: [
    'https://advanciapayledger.com/api/payments/stripe/webhook',
    'https://advanciapayledger.com/api/payments/nowpayments/webhook',
    'http://134.199.243.224:4000/api/webhooks', // Server webhook endpoint
  ],

  // Database connections
  DATABASE_ENDPOINTS: [
    'postgresql://postgres@localhost:5432/advancia_payledger',
    'postgresql://postgres@134.199.243.224:5432/advancia_payledger', // Server database
  ],

  // Redis connections
  REDIS_ENDPOINTS: [
    'redis://localhost:6379',
    'redis://134.199.243.224:6379', // Server Redis
  ],
};

/**
 * Check if IP is whitelisted
 */
export function isIPWhitelisted(ip: string, environment: 'production' | 'development' = 'production'): boolean {
  const whitelist = environment === 'production' ? SERVER_IPS.PRODUCTION : SERVER_IPS.DEVELOPMENT;
  return whitelist.includes(ip);
}

/**
 * Get server URL by IP
 */
export function getServerURL(ip: string): string | null {
  if (ip === '134.199.243.224') {
    return `http://${ip}:4000`;
  }
  if (ip === 'localhost' || ip === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  return null;
}

/**
 * Get all server URLs
 */
export function getAllServerURLs(): string[] {
  return [
    'https://advanciapayledger.com',
    'https://api.advanciapayledger.com',
    'http://localhost:4000',
    'http://134.199.243.224:4000',
  ];
}

export default SERVER_IPS;
