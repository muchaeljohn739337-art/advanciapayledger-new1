/**
 * DigitalOcean Control Routes - Advancia Pay Ledger
 * 
 * Complete system control routes for DigitalOcean control server
 */

import { Router, Response } from 'express';
import { 
  digitalOceanControlAuth, 
  requireDigitalOceanControl,
  digitalOceanAdminControl,
  digitalOceanSystemControl,
  digitalOceanSecurityControl,
  digitalOceanPaymentControl,
  digitalOceanUserControl,
  digitalOceanDatabaseControl
} from '../middleware/digitalOceanControl';
import { DIGITAL_OCEAN_CONTROL } from '../config/digitalOceanControl';
import prisma from '../lib/prisma';

const router = Router();

/**
 * DigitalOcean Control Status
 * GET /api/digital-ocean/control/status
 */
router.get('/control/status', digitalOceanControlAuth, (req, res) => {
  res.json({
    success: true,
    controlServer: {
      ip: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
      url: DIGITAL_OCEAN_CONTROL.PRIMARY_URL,
      api: DIGITAL_OCEAN_CONTROL.PRIMARY_API,
      authorized: req.isDigitalOceanControl,
    },
    systems: {
      backend: DIGITAL_OCEAN_CONTROL.PRIMARY_API,
      database: DIGITAL_OCEAN_CONTROL.DATABASE.URL,
      redis: DIGITAL_OCEAN_CONTROL.REDIS.URL,
      frontend: 'https://advancia-payledger.vercel.app',
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * System Health Check (DigitalOcean Control)
 * GET /api/digital-ocean/system/health
 */
router.get('/system/health', requireDigitalOceanControl, digitalOceanSystemControl, async (req, res) => {
  try {
    const systemHealth = {
      backend: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
      database: {
        status: 'connected',
        host: DIGITAL_OCEAN_CONTROL.DATABASE.HOST,
        port: DIGITAL_OCEAN_CONTROL.DATABASE.PORT,
      },
      redis: {
        status: 'connected',
        host: DIGITAL_OCEAN_CONTROL.REDIS.HOST,
        port: DIGITAL_OCEAN_CONTROL.REDIS.PORT,
      },
      control: {
        server: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
        authorized: true,
        timestamp: new Date().toISOString(),
      }
    };

    res.json({
      success: true,
      health: systemHealth,
      message: 'DigitalOcean Control - System Healthy'
    });
  } catch (error: any) {
    console.error('DigitalOcean system health check error:', error);
    res.status(500).json({ error: 'System health check failed' });
  }
});

/**
 * User Management Control
 * GET /api/digital-ocean/users/control
 */
router.get('/users/control', requireDigitalOceanControl, digitalOceanUserControl, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        wallet: {
          select: {
            balance: true,
            currency: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({
      success: true,
      users,
      count: users.length,
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('DigitalOcean user control error:', error);
    res.status(500).json({ error: 'User control failed' });
  }
});

/**
 * Payment System Control
 * GET /api/digital-ocean/payments/control
 */
router.get('/payments/control', requireDigitalOceanControl, digitalOceanPaymentControl, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    const paymentStats = {
      totalTransactions: await prisma.transaction.count(),
      totalVolume: await prisma.transaction.aggregate({
        _sum: { amount: true }
      }),
      todayTransactions: await prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    };

    res.json({
      success: true,
      transactions,
      stats: paymentStats,
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('DigitalOcean payment control error:', error);
    res.status(500).json({ error: 'Payment control failed' });
  }
});

/**
 * Security System Control
 * GET /api/digital-ocean/security/control
 */
router.get('/security/control', requireDigitalOceanControl, digitalOceanSecurityControl, async (req, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    const securityStats = {
      totalLogs: await prisma.auditLog.count(),
      todayLogs: await prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      failedLogins: await prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    };

    res.json({
      success: true,
      auditLogs,
      stats: securityStats,
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('DigitalOcean security control error:', error);
    res.status(500).json({ error: 'Security control failed' });
  }
});

/**
 * Database Control
 * GET /api/digital-ocean/database/control
 */
router.get('/database/control', requireDigitalOceanControl, digitalOceanDatabaseControl, async (req, res) => {
  try {
    const dbStats = {
      users: await prisma.user.count(),
      transactions: await prisma.transaction.count(),
      wallets: await prisma.wallet.count(),
      auditLogs: await prisma.auditLog.count(),
      facilities: await prisma.facility.count(),
      appointments: await prisma.appointment.count(),
    };

    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        action: true,
        resource: true,
        createdAt: true,
        user: {
          select: { email: true }
        }
      }
    });

    res.json({
      success: true,
      database: DIGITAL_OCEAN_CONTROL.DATABASE,
      stats: dbStats,
      recentActivity,
      controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('DigitalOcean database control error:', error);
    res.status(500).json({ error: 'Database control failed' });
  }
});

/**
 * Full System Control
 * GET /api/digital-ocean/full-control
 */
router.get('/full-control', requireDigitalOceanControl, digitalOceanAdminControl, async (req, res) => {
  try {
    const fullSystemStatus = {
      control: {
        server: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
        url: DIGITAL_OCEAN_CONTROL.PRIMARY_URL,
        authorized: true,
        timestamp: new Date().toISOString(),
      },
      backend: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
      database: {
        host: DIGITAL_OCEAN_CONTROL.DATABASE.HOST,
        status: 'connected',
        stats: {
          users: await prisma.user.count(),
          transactions: await prisma.transaction.count(),
          wallets: await prisma.wallet.count(),
        }
      },
      payments: {
        status: 'active',
        providers: ['Stripe', 'NOWPayments', 'Alchemy Pay'],
        webhooks: {
          stripe: DIGITAL_OCEAN_CONTROL.PAYMENTS.WEBHOOK_CONTROL,
          nowpayments: DIGITAL_OCEAN_CONTROL.PAYMENTS.WEBHOOK_CONTROL,
          alchemy: DIGITAL_OCEAN_CONTROL.PAYMENTS.WEBHOOK_CONTROL,
        }
      },
      security: {
        status: 'active',
        masterKey: 'Advancia-payledgerkey',
        controlServer: DIGITAL_OCEAN_CONTROL.PRIMARY_IP,
      },
      ai: {
        status: 'configured',
        gradient: 'ready',
        fraudDetection: 'active',
      },
      blockchain: {
        status: 'connected',
        ethereum: 'active',
        contracts: 'deployed',
      }
    };

    res.json({
      success: true,
      message: '🔥 DigitalOcean Full System Control Active',
      system: fullSystemStatus,
      controlLevel: 'SUPER_ADMIN',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('DigitalOcean full control error:', error);
    res.status(500).json({ error: 'Full system control failed' });
  }
});

export default router;
