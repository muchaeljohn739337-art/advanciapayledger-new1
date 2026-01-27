/**
 * DigitalOcean Control Configuration - Advancia Pay Ledger
 * 
 * Primary control server configuration
 */

export const DIGITAL_OCEAN_CONTROL = {
  // Primary control server
  PRIMARY_IP: '147.182.193.11',
  PRIMARY_URL: 'https://147.182.193.11',
  PRIMARY_API: 'https://147.182.193.11:4000',
  
  // Control endpoints
  CONTROL_ENDPOINTS: {
    ADMIN: 'https://147.182.193.11:4000/api/admin',
    CEO: 'https://147.182.193.11:4000/api/ceo-admin',
    SECURITY: 'https://147.182.193.11:4000/api/security',
    SYSTEM: 'https://147.182.193.11:4000/api/system',
    FUNDS: 'https://147.182.193.11:4000/api/internal/admin-funds',
  },
  
  // Database control
  DATABASE: {
    HOST: '147.182.193.11',
    PORT: 5432,
    URL: 'postgresql://postgres@147.182.193.11:5432/advancia_payledger',
    BACKUP_URL: 'postgresql://postgres@147.182.193.11:5432/advancia_payledger_backup',
  },
  
  // Redis control
  REDIS: {
    HOST: '147.182.193.11',
    PORT: 6379,
    URL: 'redis://147.182.193.11:6379',
    CLUSTER_URL: 'redis://147.182.193.11:6379,redis://147.182.193.11:6380',
  },
  
  // Security control
  SECURITY: {
    MASTER_KEY_LOCATION: '147.182.193.11',
    VAULT_ENDPOINT: 'https://147.182.193.11:4000/api/security/vault',
    AUTH_ENDPOINT: 'https://147.182.193.11:4000/api/auth/master',
  },
  
  // Monitoring control
  MONITORING: {
    HEALTH_ENDPOINT: 'https://147.182.193.11:4000/api/health',
    METRICS_ENDPOINT: 'https://147.182.193.11:4000/api/monitoring',
    LOGS_ENDPOINT: 'https://147.182.193.11:4000/api/logs',
    ALERTS_ENDPOINT: 'https://147.182.193.11:4000/api/alerts',
  },
  
  // Deployment control
  DEPLOYMENT: {
    WEBHOOK_URL: 'https://147.182.193.11:4000/api/deploy/webhook',
    STATUS_ENDPOINT: 'https://147.182.193.11:4000/api/deploy/status',
    ROLLBACK_ENDPOINT: 'https://147.182.193.11:4000/api/deploy/rollback',
  },
  
  // Payment control
  PAYMENTS: {
    CONTROL_ENDPOINT: 'https://147.182.193.11:4000/api/payments/control',
    WEBHOOK_CONTROL: 'https://147.182.193.11:4000/api/payments/webhooks',
    TRANSACTION_CONTROL: 'https://147.182.193.11:4000/api/payments/transactions',
  },
  
  // User control
  USERS: {
    MANAGEMENT_ENDPOINT: 'https://147.182.193.11:4000/api/admin/users',
    AUTH_CONTROL: 'https://147.182.193.11:4000/api/auth/control',
    PERMISSIONS_ENDPOINT: 'https://147.182.193.11:4000/api/admin/permissions',
  },
  
  // AI control
  AI: {
    CONTROL_ENDPOINT: 'https://147.182.193.11:4000/api/ai/control',
    MODEL_ENDPOINT: 'https://147.182.193.11:4000/api/ai/models',
    TRAINING_ENDPOINT: 'https://147.182.193.11:4000/api/ai/training',
  },
  
  // Blockchain control
  BLOCKCHAIN: {
    CONTROL_ENDPOINT: 'https://147.182.193.11:4000/api/blockchain/control',
    WALLET_CONTROL: 'https://147.182.193.11:4000/api/blockchain/wallets',
    CONTRACT_CONTROL: 'https://147.182.193.11:4000/api/blockchain/contracts',
  },
};

/**
 * Check if request is from DigitalOcean control server
 */
export function isDigitalOceanControl(ip: string): boolean {
  return ip === DIGITAL_OCEAN_CONTROL.PRIMARY_IP;
}

/**
 * Get control server URL
 */
export function getControlURL(service: keyof typeof DIGITAL_OCEAN_CONTROL.CONTROL_ENDPOINTS): string {
  return DIGITAL_OCEAN_CONTROL.CONTROL_ENDPOINTS[service];
}

/**
 * All systems controlled by DigitalOcean
 */
export const CONTROLLED_SYSTEMS = {
  BACKEND: 'https://147.182.193.11:4000',
  FRONTEND: 'https://advancia-payledger.vercel.app',
  DATABASE: 'postgresql://postgres@147.182.193.11:5432/advancia_payledger',
  REDIS: 'redis://147.182.193.11:6379',
  WEBHOOKS: 'https://147.182.193.11:4000/api/webhooks',
  SECURITY: 'https://147.182.193.11:4000/api/security',
  ADMIN: 'https://147.182.193.11:4000/api/admin',
  CEO: 'https://147.182.193.11:4000/api/ceo-admin',
};

export default DIGITAL_OCEAN_CONTROL;
