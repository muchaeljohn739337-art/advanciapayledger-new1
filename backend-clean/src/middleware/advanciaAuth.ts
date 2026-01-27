/**
 * Advancia Pay Ledger Authentication Middleware
 * 
 * Middleware for API authentication using the Advancia Pay Ledger master key
 */

import { Request, Response, NextFunction } from 'express';
import { advanciaSecurityService } from '../services/advanciaSecurity.service';

export interface AuthenticatedRequest extends Request {
  apiClient?: {
    service: string;
    permissions: string[];
    type: string;
  };
}

/**
 * API Key Authentication Middleware
 */
export const authenticateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-advancia-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Missing X-Advancia-API-Key header'
    });
  }

  if (!advanciaSecurityService.verifyApiKey(apiKey)) {
    return res.status(401).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is invalid'
    });
  }

  // Add client info to request
  req.apiClient = {
    service: 'advancia-payledger',
    permissions: ['full_access'],
    type: 'internal'
  };

  next();
};

/**
 * External API Authentication Middleware
 */
export const authenticateExternalApi = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers['authorization']?.replace('Bearer ', '') as string;
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API token required',
        message: 'Missing Authorization header with Bearer token'
      });
    }

    if (!advanciaSecurityService.validateExternalApiKey(apiKey, requiredPermission)) {
      return res.status(401).json({ 
        error: 'Invalid or insufficient permissions',
        message: `Requires permission: ${requiredPermission}`
      });
    }

    try {
      const payload = advanciaSecurityService.verifyApiToken(apiKey);
      req.apiClient = {
        service: payload.service,
        permissions: payload.permissions,
        type: payload.type
      };
    } catch (error) {
      return res.status(401).json({ 
        error: 'Token verification failed',
        message: error.message
      });
    }

    next();
  };
};

/**
 * Webhook Signature Verification Middleware
 */
export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-advancia-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  if (!signature) {
    return res.status(401).json({ 
      error: 'Signature required',
      message: 'Missing X-Advancia-Signature header'
    });
  }

  if (!advanciaSecurityService.verifyWebhookSignature(payload, signature)) {
    return res.status(401).json({ 
      error: 'Invalid signature',
      message: 'Webhook signature verification failed'
    });
  }

  next();
};

/**
 * Admin Authentication Middleware (using master key)
 */
export const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-advancia-admin-key'] as string;
  
  if (!adminKey) {
    return res.status(401).json({ 
      error: 'Admin key required',
      message: 'Missing X-Advancia-Admin-Key header'
    });
  }

  if (!advanciaSecurityService.verifyApiKey(adminKey)) {
    return res.status(401).json({ 
      error: 'Invalid admin key',
      message: 'The provided admin key is invalid'
    });
  }

  req.apiClient = {
    service: 'admin',
    permissions: ['full_admin_access'],
    type: 'admin'
  };

  next();
};

/**
 * Service-to-Service Authentication
 */
export const authenticateService = (serviceName: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const serviceKey = req.headers['x-service-key'] as string;
    
    if (!serviceKey) {
      return res.status(401).json({ 
        error: 'Service key required',
        message: 'Missing X-Service-Key header'
      });
    }

    // Verify service key (you can implement service-specific validation)
    if (!advanciaSecurityService.verifyApiKey(serviceKey)) {
      return res.status(401).json({ 
        error: 'Invalid service key',
        message: `Invalid key for service: ${serviceName}`
      });
    }

    req.apiClient = {
      service: serviceName,
      permissions: ['service_access'],
      type: 'service'
    };

    next();
  };
};
