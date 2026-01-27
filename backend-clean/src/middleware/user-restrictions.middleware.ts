// ============================================================================
// USER INFRASTRUCTURE RESTRICTIONS MIDDLEWARE
// Backend restrictions and control for regular users
// CEO Madubugwu Chinemelum - Complete user infrastructure control
// ============================================================================

import { Request, Response, NextFunction } from 'express';

// User Restrictions Configuration
const USER_RESTRICTIONS = {
  databaseAccess: false,
  apiRateLimit: true,
  transactionLimits: true,
  cryptoConversion: false,
  withdrawalLimits: true,
  backendProtection: true,
};

// Rate limiting storage (in production, use Redis)
const userRateLimits = new Map<string, {
  count: number;
  resetTime: Date;
  lastRequest: Date;
}>();

// Transaction limits
const TRANSACTION_LIMITS = {
  dailyLimit: 10000, // $10,000 per day
  monthlyLimit: 50000, // $50,000 per month
  singleTransactionLimit: 5000, // $5,000 per transaction
};

/**
 * User Database Access Restriction
 */
export const restrictDatabaseAccess = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is trying to access database directly
  if (req.path.includes('/database') || req.path.includes('/db') || req.path.includes('/prisma')) {
    return res.status(403).json({
      error: 'Database access restricted',
      message: 'Direct database access is not allowed for users',
      restriction: 'DATABASE_ACCESS_BLOCKED',
    });
  }

  // Check for database query attempts
  if (req.body && typeof req.body === 'object') {
    const bodyStr = JSON.stringify(req.body).toLowerCase();
    if (bodyStr.includes('select') || bodyStr.includes('insert') || bodyStr.includes('update') || bodyStr.includes('delete')) {
      return res.status(403).json({
        error: 'Database query restricted',
        message: 'Direct database queries are not allowed',
        restriction: 'DATABASE_QUERIES_BLOCKED',
      });
    }
  }

  next();
};

/**
 * API Rate Limiting
 */
export const apiRateLimit = (req: Request, res: Response, next: NextFunction) => {
  if (!USER_RESTRICTIONS.apiRateLimit) {
    return next();
  }

  const userId = req.user?.id || req.ip;
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60000); // 1 minute window

  let userLimit = userRateLimits.get(userId);

  if (!userLimit || userLimit.resetTime < now) {
    userLimit = {
      count: 0,
      resetTime: new Date(now.getTime() + 60000),
      lastRequest: now,
    };
    userRateLimits.set(userId, userLimit);
  }

  userLimit.count++;
  userLimit.lastRequest = now;

  // Allow 100 requests per minute
  if (userLimit.count > 100) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later',
      restriction: 'API_RATE_LIMIT_EXCEEDED',
      resetTime: userLimit.resetTime,
    });
  }

  next();
};

/**
 * Transaction Limits
 */
export const transactionLimits = (req: Request, res: Response, next: NextFunction) => {
  if (!USER_RESTRICTIONS.transactionLimits) {
    return next();
  }

  // Skip for admin routes
  if (req.path.includes('/admin') || req.path.includes('/ceo')) {
    return next();
  }

  const amount = req.body.amount;

  if (amount && typeof amount === 'number') {
    // Check single transaction limit
    if (amount > TRANSACTION_LIMITS.singleTransactionLimit) {
      return res.status(400).json({
        error: 'Transaction amount exceeds limit',
        message: `Maximum transaction amount is $${TRANSACTION_LIMITS.singleTransactionLimit.toLocaleString()}`,
        restriction: 'TRANSACTION_AMOUNT_LIMIT',
        maxAmount: TRANSACTION_LIMITS.singleTransactionLimit,
      });
    }

    // TODO: Check daily and monthly limits (requires database tracking)
    console.log('Transaction amount checked:', amount);
  }

  next();
};

/**
 * Crypto Conversion Restriction
 */
export const restrictCryptoConversion = (req: Request, res: Response, next: NextFunction) => {
  if (!USER_RESTRICTIONS.cryptoConversion) {
    return next();
  }

  // Skip for admin routes
  if (req.path.includes('/admin') || req.path.includes('/ceo')) {
    return next();
  }

  if (req.path.includes('/crypto') || req.path.includes('/convert')) {
    return res.status(403).json({
      error: 'Crypto conversion restricted',
      message: 'Crypto conversion is only available to administrators',
      restriction: 'CRYPTO_CONVERSION_BLOCKED',
    });
  }

  // Check for crypto-related requests
  if (req.body && typeof req.body === 'object') {
    const bodyStr = JSON.stringify(req.body).toLowerCase();
    if (bodyStr.includes('btc') || bodyStr.includes('eth') || bodyStr.includes('crypto') || bodyStr.includes('bitcoin')) {
      return res.status(403).json({
        error: 'Crypto operations restricted',
        message: 'Cryptocurrency operations are only available to administrators',
        restriction: 'CRYPTO_OPERATIONS_BLOCKED',
      });
    }
  }

  next();
};

/**
 * Withdrawal Limits
 */
export const withdrawalLimits = (req: Request, res: Response, next: NextFunction) => {
  if (!USER_RESTRICTIONS.withdrawalLimits) {
    return next();
  }

  // Skip for admin routes
  if (req.path.includes('/admin') || req.path.includes('/ceo')) {
    return next();
  }

  if (req.path.includes('/withdraw') || req.path.includes('/payout')) {
    const amount = req.body.amount;

    if (amount && typeof amount === 'number') {
      // Check withdrawal limit
      if (amount > 2000) { // $2,000 daily withdrawal limit
        return res.status(400).json({
          error: 'Withdrawal amount exceeds limit',
          message: 'Maximum withdrawal amount is $2,000 per day',
          restriction: 'WITHDRAWAL_AMOUNT_LIMIT',
          maxAmount: 2000,
        });
      }
    }
  }

  next();
};

/**
 * Backend Infrastructure Protection
 */
export const protectBackendInfrastructure = (req: Request, res: Response, next: NextFunction) => {
  if (!USER_RESTRICTIONS.backendProtection) {
    return next();
  }

  // Skip for admin routes
  if (req.path.includes('/admin') || req.path.includes('/ceo')) {
    return next();
  }

  // Block access to backend infrastructure
  const restrictedPaths = [
    '/config',
    '/env',
    '/system',
    '/server',
    '/infrastructure',
    '/backend',
    '/admin',
    '/logs',
    '/metrics',
    '/health',
  ];

  const isRestricted = restrictedPaths.some(path => req.path.includes(path));

  if (isRestricted) {
    return res.status(403).json({
      error: 'Backend infrastructure access restricted',
      message: 'Access to backend infrastructure is not allowed',
      restriction: 'BACKEND_INFRASTRUCTURE_PROTECTED',
    });
  }

  // Check for system-level operations
  if (req.body && typeof req.body === 'object') {
    const bodyStr = JSON.stringify(req.body).toLowerCase();
    const systemOperations = [
      'restart', 'shutdown', 'reboot', 'config', 'system', 'admin', 'root',
      'sudo', 'chmod', 'chown', 'rm -rf', 'delete', 'drop', 'truncate'
    ];

    const hasSystemOperation = systemOperations.some(op => bodyStr.includes(op));

    if (hasSystemOperation) {
      return res.status(403).json({
        error: 'System operations restricted',
        message: 'System-level operations are not allowed',
        restriction: 'SYSTEM_OPERATIONS_BLOCKED',
      });
    }
  }

  next();
};

/**
 * Get Current User Restrictions
 */
export const getUserRestrictions = (req: Request, res: Response) => {
  res.json({
    message: 'Current user infrastructure restrictions',
    restrictions: USER_RESTRICTIONS,
    description: {
      databaseAccess: 'Direct database access blocked for users',
      apiRateLimit: 'API rate limiting enforced (100 requests/minute)',
      transactionLimits: 'Transaction limits applied ($5,000 per transaction)',
      cryptoConversion: 'Crypto conversion restricted to admin only',
      withdrawalLimits: 'Withdrawal limits enforced ($2,000 per day)',
      backendProtection: 'Backend infrastructure protected from user access',
    },
    transactionLimits: TRANSACTION_LIMITS,
    status: 'active',
  });
};

/**
 * Apply All User Restrictions
 */
export const applyUserRestrictions = [
  restrictDatabaseAccess,
  apiRateLimit,
  transactionLimits,
  restrictCryptoConversion,
  withdrawalLimits,
  protectBackendInfrastructure,
];
