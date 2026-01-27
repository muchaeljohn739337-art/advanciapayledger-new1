import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Internal system configuration
const INTERNAL_CONFIG = {
  secretKey: process.env.ROCKEFELLER_INTERNAL_SECRET || 'rockefeller-internal-123456789',
  allowedIPs: [
    '127.0.0.1',     // Localhost
    '::1',           // IPv6 localhost
    '10.0.0.0/8',    // Private network
    '172.16.0.0/12', // Private network
    '192.168.0.0/16' // Private network
  ],
  internalServices: [
    'rockefeller-admin',
    'rockefeller-underwriting',
    'rockefeller-claims',
    'rockefeller-trust',
    'internal-api-gateway'
  ]
};

interface InternalAuthPayload {
  service: string;
  accessLevel: 'admin' | 'underwriter' | 'claims' | 'trust' | 'readonly';
  permissions: string[];
  referenceNumber: string;
}

// Check if IP is allowed
const isAllowedIP = (ip: string): boolean => {
  // Check exact matches first
  if (INTERNAL_CONFIG.allowedIPs.includes(ip)) {
    return true;
  }
  
  // Check CIDR ranges (simplified)
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^::1$/,
    /^127\./
  ];
  
  return privateRanges.some(range => range.test(ip));
};

// Validate internal service token
const validateInternalToken = (token: string): InternalAuthPayload | null => {
  try {
    const decoded = jwt.verify(token, INTERNAL_CONFIG.secretKey) as any;
    
    // Verify it's an internal service
    if (!INTERNAL_CONFIG.internalServices.includes(decoded.service)) {
      return null;
    }
    
    // Verify reference number
    if (decoded.referenceNumber !== '123456789') {
      return null;
    }
    
    return {
      service: decoded.service,
      accessLevel: decoded.accessLevel,
      permissions: decoded.permissions || [],
      referenceNumber: decoded.referenceNumber
    };
  } catch (error) {
    return null;
  }
};

// Check permission for specific action
const hasPermission = (payload: InternalAuthPayload, requiredPermission: string): boolean => {
  if (payload.accessLevel === 'admin') {
    return true;
  }
  
  return payload.permissions.includes(requiredPermission);
};

// Main internal authentication middleware
export const internalAuth = (requiredPermission?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check IP address
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    if (!isAllowedIP(clientIP!)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Invalid IP address',
        error: 'INTERNAL_IP_REQUIRED'
      });
    }
    
    // Check for internal token
    const token = req.headers['x-internal-token'] as string || 
                  req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Internal token required',
        error: 'INTERNAL_TOKEN_REQUIRED'
      });
    }
    
    // Validate token
    const payload = validateInternalToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Invalid internal token',
        error: 'INVALID_INTERNAL_TOKEN'
      });
    }
    
    // Check specific permission if required
    if (requiredPermission && !hasPermission(payload, requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        required: requiredPermission
      });
    }
    
    // Add internal context to request
    (req as any).internal = {
      authenticated: true,
      service: payload.service,
      accessLevel: payload.accessLevel,
      permissions: payload.permissions,
      referenceNumber: payload.referenceNumber
    };
    
    next();
  };
};

// Generate internal service token
export const generateInternalToken = (service: string, accessLevel: string, permissions: string[] = []): string => {
  const payload = {
    service,
    accessLevel,
    permissions,
    referenceNumber: '123456789',
    issuedAt: Date.now(),
    expiresIn: '24h'
  };
  
  return jwt.sign(payload, INTERNAL_CONFIG.secretKey, { expiresIn: '24h' });
};

// Middleware for admin-only access
export const adminOnly = internalAuth('admin_access');

// Middleware for underwriting access
export const underwritingAccess = internalAuth('underwriting_access');

// Middleware for claims access
export const claimsAccess = internalAuth('claims_access');

// Middleware for trust access
export const trustAccess = internalAuth('trust_access');

// Middleware for readonly access
export const readonlyAccess = internalAuth('readonly_access');

// Rate limiting for internal services
const internalRateLimits = new Map<string, { count: number; resetTime: number }>();

export const internalRateLimit = (maxRequests: number = 1000, windowMs: number = 3600000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const service = (req as any).internal?.service;
    if (!service) {
      return next();
    }
    
    const now = Date.now();
    const key = `${service}:${Math.floor(now / windowMs)}`;
    const limit = internalRateLimits.get(key);
    
    if (!limit || now > limit.resetTime) {
      internalRateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (limit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        error: 'INTERNAL_RATE_LIMIT_EXCEEDED',
        resetTime: limit.resetTime
      });
    }
    
    limit.count++;
    next();
  };
};

// Audit logging for internal access
export const internalAuditLog = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const internal = (req as any).internal;
  
  // Log request
  console.log(`[INTERNAL_ACCESS] ${new Date().toISOString()} - ${internal.service} - ${req.method} ${req.path}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - startTime;
    
    console.log(`[INTERNAL_RESPONSE] ${new Date().toISOString()} - ${internal.service} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Log sensitive operations
    const sensitiveOperations = ['create', 'delete', 'update', 'approve', 'deny'];
    const isSensitive = sensitiveOperations.some(op => req.path.toLowerCase().includes(op));
    
    if (isSensitive) {
      console.log(`[SENSITIVE_OPERATION] ${new Date().toISOString()} - ${internal.service} - ${req.method} ${req.path} - User: ${internal.accessLevel}`);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Validate internal service registration
export const validateServiceRegistration = (req: Request, res: Response, next: NextFunction) => {
  const service = (req as any).internal?.service;
  
  if (!service) {
    return res.status(401).json({
      success: false,
      message: 'Service registration required',
      error: 'SERVICE_NOT_REGISTERED'
    });
  }
  
  // Log service activity
  console.log(`[SERVICE_ACTIVITY] ${new Date().toISOString()} - ${service} - ${req.method} ${req.path}`);
  
  next();
};
