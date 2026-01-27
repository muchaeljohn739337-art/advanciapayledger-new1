/**
 * DigitalOcean Control Middleware - Advancia Pay Ledger
 * 
 * Middleware to ensure DigitalOcean control server has full access
 */

import { Request, Response, NextFunction } from 'express';
import { DIGITAL_OCEAN_CONTROL, isDigitalOceanControl } from '../config/digitalOceanControl';

export interface DigitalOceanRequest extends Request {
  isDigitalOceanControl?: boolean;
  controlServer?: {
    ip: string;
    url: string;
    authorized: boolean;
  };
}

/**
 * DigitalOcean Control Authentication Middleware
 * Grants full access to DigitalOcean control server
 */
export const digitalOceanControlAuth = (req: DigitalOceanRequest, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const isControlServer = isDigitalOceanControl(clientIP as string);
  
  req.isDigitalOceanControl = isControlServer;
  req.controlServer = {
    ip: clientIP as string,
    url: DIGITAL_OCEAN_CONTROL.PRIMARY_URL,
    authorized: isControlServer
  };

  // Log control server access
  if (isControlServer) {
    console.log(`🔥 DigitalOcean Control Server Access: ${clientIP}`);
    console.log(`🔥 Full system control granted to: ${DIGITAL_OCEAN_CONTROL.PRIMARY_IP}`);
  }

  next();
};

/**
 * DigitalOcean Control Required Middleware
 * Only allows requests from DigitalOcean control server
 */
export const requireDigitalOceanControl = (req: DigitalOceanRequest, res: Response, next: NextFunction) => {
  if (!req.isDigitalOceanControl) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'This endpoint requires DigitalOcean control server access',
      required: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
      received: req.ip
    });
  }

  console.log(`🔥 DigitalOcean Control Server Authorized: ${req.controlServer?.ip}`);
  next();
};

/**
 * DigitalOcean Admin Control Middleware
 * Enhanced admin access for DigitalOcean control server
 */
export const digitalOceanAdminControl = (req: DigitalOceanRequest, res: Response, next: NextFunction) => {
  if (req.isDigitalOceanControl) {
    // Grant all admin permissions to DigitalOcean control server
    req.user = {
      userId: 'digital-ocean-control',
      email: 'control@digitalocean.advanciapayledger.com',
      role: 'SUPER_ADMIN',
      permissions: ['ALL'],
      isControlServer: true
    };
    
    console.log(`🔥 DigitalOcean Super Admin Access Granted: ${req.controlServer?.ip}`);
  }

  next();
};

/**
 * DigitalOcean System Control Middleware
 * For system-level operations
 */
export const digitalOceanSystemControl = (req: DigitalOceanRequest, res: Response, next: NextFunction) => {
  if (!req.isDigitalOceanControl) {
    return res.status(403).json({
      error: 'System Control Required',
      message: 'Only DigitalOcean control server can access system endpoints',
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP
    });
  }

  console.log(`🔥 DigitalOcean System Control: ${req.controlServer?.ip}`);
  next();
};

/**
 * DigitalOcean Security Control Middleware
 * For security operations
 */
export const digitalOceanSecurityControl = (req: DigitalOceanRequest, res: Response, next: NextFunction) => {
  if (!req.isDigitalOceanControl) {
    return res.status(403).json({
      error: 'Security Control Required',
      message: 'Only DigitalOcean control server can access security endpoints',
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP
    });
  }

  console.log(`🔥 DigitalOcean Security Control: ${req.controlServer?.ip}`);
  next();
};

/**
 * DigitalOcean Payment Control Middleware
 * For payment system control
 */
export const digitalOceanPaymentControl = (req: DigitalOceanRequest, res: Response, next: NextFunction) => {
  if (!req.isDigitalOceanControl) {
    return res.status(403).json({
      error: 'Payment Control Required',
      message: 'Only DigitalOcean control server can access payment control endpoints',
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP
    });
  }

  console.log(`🔥 DigitalOcean Payment Control: ${req.controlServer?.ip}`);
  next();
};

/**
 * DigitalOcean User Control Middleware
 * For user management control
 */
export const digitalOceanUserControl = (req: DigitalOceanRequest, res: Response, next: NextFunction) => {
  if (!req.isDigitalOceanControl) {
    return res.status(403).json({
      error: 'User Control Required',
      message: 'Only DigitalOcean control server can access user control endpoints',
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP
    });
  }

  console.log(`🔥 DigitalOcean User Control: ${req.controlServer?.ip}`);
  next();
};

/**
 * DigitalOcean Database Control Middleware
 * For database operations
 */
export const digitalOceanDatabaseControl = (req: DigitalOceanRequest, res: Response, next: NextFunction) => {
  if (!req.isDigitalOceanControl) {
    return res.status(403).json({
      error: 'Database Control Required',
      message: 'Only DigitalOcean control server can access database control endpoints',
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP
    });
  }

  console.log(`🔥 DigitalOcean Database Control: ${req.controlServer?.ip}`);
  next();
};
