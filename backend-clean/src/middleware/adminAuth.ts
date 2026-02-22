/**
 * Admin Authentication Middleware - Advancia Pay Ledger
 * 
 * Middleware for admin key authentication and authorization
 */

import { Request, Response, NextFunction } from 'express';
import { adminKeyService } from '../services/adminKey.service';

export interface AdminRequest extends Request {
  admin?: {
    level: 'ADMIN' | 'SUPER_ADMIN' | 'SYSTEM_ADMIN';
    permissions: string[];
    key: string;
    authenticated: boolean;
  };
  adminToken?: string;
}

/**
 * Admin Key Authentication Middleware
 */
export const authenticateAdminKey = (req: AdminRequest, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'] as string || 
                   req.headers['authorization']?.replace('Bearer ', '') as string;

  if (!adminKey) {
    return res.status(401).json({ 
      error: 'Admin key required',
      message: 'Missing X-Admin-Key header or Authorization Bearer token'
    });
  }

  if (!adminKeyService.hasAdminPrivileges(adminKey)) {
    return res.status(401).json({ 
      error: 'Invalid admin key',
      message: 'The provided admin key is invalid or lacks privileges'
    });
  }

  const level = adminKeyService.getAdminLevel(adminKey);
  if (level === 'INVALID') {
    return res.status(401).json({
      error: 'Invalid admin key',
      message: 'The provided admin key is invalid or lacks privileges'
    });
  }
  const permissions = adminKeyService.getPermissions(level);

  req.admin = {
    level,
    permissions,
    key: adminKey,
    authenticated: true
  };

  // Log admin access
  adminKeyService.logAdminAction(adminKey, 'API_ACCESS', req.path, {
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  next();
};

/**
 * Super Admin Required Middleware
 */
export const requireSuperAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
  if (!req.admin || !adminKeyService.hasSuperAdminPrivileges(req.admin.key)) {
    return res.status(403).json({ 
      error: 'Super admin access required',
      message: 'This endpoint requires super admin privileges'
    });
  }

  next();
};

/**
 * System Admin Required Middleware
 */
export const requireSystemAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
  if (!req.admin || !adminKeyService.hasSystemAdminPrivileges(req.admin.key)) {
    return res.status(403).json({ 
      error: 'System admin access required',
      message: 'This endpoint requires system admin privileges'
    });
  }

  next();
};

/**
 * Permission Required Middleware
 */
export const requirePermission = (permission: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin || !adminKeyService.hasPermission(req.admin.key, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Requires permission: ${permission}`,
        currentLevel: req.admin?.level,
        currentPermissions: req.admin?.permissions
      });
    }

    next();
  };
};

/**
 * Admin Level Required Middleware
 */
export const requireAdminLevel = (level: 'ADMIN' | 'SUPER_ADMIN' | 'SYSTEM_ADMIN') => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin || req.admin.level !== level) {
      return res.status(403).json({ 
        error: `${level} access required`,
        message: `This endpoint requires ${level} level access`,
        currentLevel: req.admin?.level
      });
    }

    next();
  };
};

/**
 * Admin Token Generation Middleware
 */
export const generateAdminToken = (req: AdminRequest, res: Response, next: NextFunction) => {
  if (!req.admin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const token = adminKeyService.generateAdminToken(req.admin.key);
    req.adminToken = token;
    next();
  } catch (error: any) {
    res.status(500).json({ error: 'Token generation failed', message: error.message });
  }
};

/**
 * Admin Token Verification Middleware
 */
export const verifyAdminToken = (req: AdminRequest, res: Response, next: NextFunction) => {
  const token = req.headers['x-admin-token'] as string || 
               req.headers['authorization']?.replace('Bearer ', '') as string;

  if (!token) {
    return res.status(401).json({ 
      error: 'Admin token required',
      message: 'Missing X-Admin-Token header or Authorization Bearer token'
    });
  }

  try {
    const payload = adminKeyService.verifyAdminToken(token);
    
    if (payload.type !== 'admin_token') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    req.admin = {
      level: payload.adminLevel,
      permissions: payload.permissions,
      key: 'token_verified',
      authenticated: true
    };

    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Token verification failed', message: error.message });
  }
};

/**
 * Admin Action Logger Middleware
 */
export const logAdminAction = (action: string, resource: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (req.admin) {
      adminKeyService.logAdminAction(req.admin.key, action, resource, {
        method: req.method,
        path: req.path,
        body: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    next();
  };
};
