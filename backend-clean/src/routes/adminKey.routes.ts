/**
 * Admin Key Routes - Advancia Pay Ledger
 * 
 * Admin key authentication and management endpoints
 */

import { Router, Response } from 'express';
import { adminKeyService } from '../services/adminKey.service';
import { 
  authenticateAdminKey, 
  requireSuperAdmin, 
  requireSystemAdmin,
  requirePermission,
  requireAdminLevel,
  generateAdminToken,
  verifyAdminToken,
  logAdminAction
} from '../middleware/adminAuth';

const router = Router();

/**
 * Admin Key Status
 * GET /api/admin-key/status
 */
router.get('/status', (req, res) => {
  const keyInfo = adminKeyService.getAdminKeyInfo();
  
  res.json({
    success: true,
    adminKeyService: {
      configured: keyInfo.configured,
      adminKeyLength: keyInfo.adminKeyLength,
      superAdminKeyLength: keyInfo.superAdminKeyLength,
      systemAdminKeyLength: keyInfo.systemAdminKeyLength,
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Admin Authentication
 * POST /api/admin-key/authenticate
 */
router.post('/authenticate', authenticateAdminKey, (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    admin: {
      level: req.admin?.level,
      permissions: req.admin?.permissions,
    },
    message: 'Admin authentication successful',
    timestamp: new Date().toISOString()
  });
});

/**
 * Generate Admin Token
 * POST /api/admin-key/generate-token
 */
router.post('/generate-token', authenticateAdminKey, generateAdminToken, (req: res) => {
  res.json({
    success: true,
    token: req.adminToken,
    admin: {
      level: req.admin?.level,
      permissions: req.admin?.permissions,
    },
    expiresIn: 3600,
    message: 'Admin token generated successfully',
    timestamp: new Date().toISOString()
  });
});

/**
 * Verify Admin Token
 * POST /api/admin-key/verify-token
 */
router.post('/verify-token', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    valid: true,
    admin: {
      level: req.admin?.level,
      permissions: req.admin?.permissions,
    },
    message: 'Admin token is valid',
    timestamp: new Date().toISOString()
  });
});

/**
 * Admin Dashboard (Admin Level)
 * GET /api/admin-key/dashboard
 */
router.get('/dashboard', authenticateAdminKey, requireAdminLevel('ADMIN'), logAdminAction('VIEW_DASHBOARD', 'ADMIN_DASHBOARD'), (req, res) => {
  res.json({
    success: true,
    dashboard: {
      adminLevel: req.admin?.level,
      permissions: req.admin?.permissions,
      accessibleEndpoints: [
        '/api/admin-key/dashboard',
        '/api/admin-key/profile',
        '/api/users/read',
        '/api/transactions/read',
        '/api/reports/read'
      ],
      message: 'Admin dashboard access granted'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Super Admin Dashboard (Super Admin Level)
 * GET /api/admin-key/super-dashboard
 */
router.get('/super-dashboard', authenticateAdminKey, requireSuperAdmin, logAdminAction('VIEW_DASHBOARD', 'SUPER_ADMIN_DASHBOARD'), (req, res) => {
  res.json({
    success: true,
    dashboard: {
      adminLevel: req.admin?.level,
      permissions: req.admin?.permissions,
      accessibleEndpoints: [
        '/api/admin-key/dashboard',
        '/api/admin-key/super-dashboard',
        '/api/users/*',
        '/api/transactions/*',
        '/api/reports/*',
        '/api/payments/manage',
        '/api/security/manage',
        '/api/system/settings'
      ],
      message: 'Super admin dashboard access granted'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * System Admin Dashboard (System Admin Level)
 * GET /api/admin-key/system-dashboard
 */
router.get('/system-dashboard', authenticateAdminKey, requireSystemAdmin, logAdminAction('VIEW_DASHBOARD', 'SYSTEM_ADMIN_DASHBOARD'), (req, res) => {
  res.json({
    success: true,
    dashboard: {
      adminLevel: req.admin?.level,
      permissions: req.admin?.permissions,
      accessibleEndpoints: [
        'ALL_ENDPOINTS' // Complete system access
      ],
      systemControl: {
        database: 'FULL_CONTROL',
        users: 'FULL_CONTROL',
        payments: 'FULL_CONTROL',
        security: 'FULL_CONTROL',
        system: 'FULL_CONTROL'
      },
      message: 'System admin dashboard access granted - Full system control'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * User Management (Super Admin+)
 * GET /api/admin-key/users
 */
router.get('/users', authenticateAdminKey, requireSuperAdmin, requirePermission('read_users'), logAdminAction('READ', 'USERS'), (req, res) => {
  // This would typically fetch users from database
  res.json({
    success: true,
    message: 'User management access granted',
    adminLevel: req.admin?.level,
    permissions: req.admin?.permissions,
    timestamp: new Date().toISOString()
  });
});

/**
 * Payment Management (Super Admin+)
 * GET /api/admin-key/payments
 */
router.get('/payments', authenticateAdminKey, requireSuperAdmin, requirePermission('manage_payments'), logAdminAction('MANAGE', 'PAYMENTS'), (req, res) => {
  res.json({
    success: true,
    message: 'Payment management access granted',
    adminLevel: req.admin?.level,
    permissions: req.admin?.permissions,
    timestamp: new Date().toISOString()
  });
});

/**
 * Security Management (Super Admin+)
 * GET /api/admin-key/security
 */
router.get('/security', authenticateAdminKey, requireSuperAdmin, requirePermission('manage_security'), logAdminAction('MANAGE', 'SECURITY'), (req, res) => {
  res.json({
    success: true,
    message: 'Security management access granted',
    adminLevel: req.admin?.level,
    permissions: req.admin?.permissions,
    timestamp: new Date().toISOString()
  });
});

/**
 * System Settings (Super Admin+)
 * GET /api/admin-key/system-settings
 */
router.get('/system-settings', authenticateAdminKey, requireSuperAdmin, requirePermission('manage_system_settings'), logAdminAction('MANAGE', 'SYSTEM_SETTINGS'), (req, res) => {
  res.json({
    success: true,
    message: 'System settings access granted',
    adminLevel: req.admin?.level,
    permissions: req.admin?.permissions,
    timestamp: new Date().toISOString()
  });
});

/**
 * System Control (System Admin Only)
 * GET /api/admin-key/system-control
 */
router.get('/system-control', authenticateAdminKey, requireSystemAdmin, logAdminAction('SYSTEM_CONTROL', 'FULL_SYSTEM'), (req, res) => {
  res.json({
    success: true,
    message: '🔥 SYSTEM ADMIN - Full System Control Granted',
    adminLevel: req.admin?.level,
    permissions: req.admin?.permissions,
    systemControl: {
      database: 'FULL_CONTROL',
      users: 'FULL_CONTROL',
      payments: 'FULL_CONTROL',
      security: 'FULL_CONTROL',
      blockchain: 'FULL_CONTROL',
      ai: 'FULL_CONTROL',
      deployment: 'FULL_CONTROL',
      monitoring: 'FULL_CONTROL'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Admin Profile
 * GET /api/admin-key/profile
 */
router.get('/profile', authenticateAdminKey, logAdminAction('VIEW', 'PROFILE'), (req, res) => {
  res.json({
    success: true,
    profile: {
      adminLevel: req.admin?.level,
      permissions: req.admin?.permissions,
      authenticated: req.admin?.authenticated,
      keyLength: req.admin?.key.length,
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Test Permission
 * POST /api/admin-key/test-permission
 */
router.post('/test-permission', authenticateAdminKey, (req, res) => {
  const { permission } = req.body;
  
  if (!permission) {
    return res.status(400).json({ error: 'Permission parameter required' });
  }

  const hasPermission = adminKeyService.hasPermission(req.admin!.key, permission);

  res.json({
    success: true,
    permission,
    hasPermission,
    adminLevel: req.admin?.level,
    allPermissions: req.admin?.permissions,
    timestamp: new Date().toISOString()
  });
});

export default router;
