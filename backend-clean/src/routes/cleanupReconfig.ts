// Rockefeller HELOC Cleanup and Reconfiguration API Routes
// Implements: "I choose what I do because I supposed to it - Start cleanup dead files token reconfig re-auth"
// Reference Number: 123456789-HELOC

import express from 'express';
import CleanupReconfigService from '../services/CleanupReconfigService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const cleanupReconfigService = CleanupReconfigService;

// POST /api/cleanup-reconfig/start - Start cleanup and reconfiguration service
router.post('/start', authenticateToken, async (req, res) => {
  try {
    await cleanupReconfigService.start();

    res.json({
      success: true,
      message: 'Cleanup and reconfiguration service started',
      data: {
        service: 'CleanupReconfigService',
        status: 'RUNNING',
        timestamp: new Date(),
        philosophy: 'I choose what I do because I supposed to it'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to start cleanup service: ${error.message}`
    });
  }
});

// POST /api/cleanup-reconfig/stop - Stop cleanup and reconfiguration service
router.post('/stop', authenticateToken, async (req, res) => {
  try {
    await cleanupReconfigService.stop();

    res.json({
      success: true,
      message: 'Cleanup and reconfiguration service stopped',
      data: {
        service: 'CleanupReconfigService',
        status: 'STOPPED',
        timestamp: new Date(),
        philosophy: 'I choose what I do because I supposed to it'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to stop cleanup service: ${error.message}`
    });
  }
});

// POST /api/cleanup-reconfig/cleanup/create - Create cleanup task
router.post('/cleanup/create', authenticateToken, async (req, res) => {
  try {
    const { taskType, targetPath, cleanupCriteria, priority } = req.body;

    if (!taskType || !targetPath) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskType, targetPath'
      });
    }

    const taskId = await cleanupReconfigService.createCleanupTask(
      taskType,
      targetPath,
      cleanupCriteria || {},
      priority || 'MEDIUM'
    );

    res.json({
      success: true,
      message: 'Cleanup task created',
      data: {
        taskId,
        taskType,
        targetPath,
        priority: priority || 'MEDIUM',
        philosophy: 'Start cleanup dead files'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create cleanup task: ${error.message}`
    });
  }
});

// POST /api/cleanup-reconfig/reconfig/create - Create reconfiguration task
router.post('/reconfig/create', authenticateToken, async (req, res) => {
  try {
    const { taskType, reconfigType, targetSystem, reconfigCriteria, priority } = req.body;

    if (!taskType || !reconfigType || !targetSystem) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskType, reconfigType, targetSystem'
      });
    }

    const taskId = await cleanupReconfigService.createReconfigTask(
      taskType,
      reconfigType,
      targetSystem,
      reconfigCriteria || {},
      priority || 'MEDIUM'
    );

    res.json({
      success: true,
      message: 'Reconfiguration task created',
      data: {
        taskId,
        taskType,
        reconfigType,
        targetSystem,
        priority: priority || 'MEDIUM',
        philosophy: 'Token reconfig'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create reconfig task: ${error.message}`
    });
  }
});

// POST /api/cleanup-reconfig/auth/create - Create authentication task
router.post('/auth/create', authenticateToken, async (req, res) => {
  try {
    const { taskType, targetUser, authType, authCriteria, priority } = req.body;

    if (!taskType || !targetUser || !authType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskType, targetUser, authType'
      });
    }

    const taskId = await cleanupReconfigService.createAuthTask(
      taskType,
      targetUser,
      authType,
      authCriteria || {},
      priority || 'MEDIUM'
    );

    res.json({
      success: true,
      message: 'Authentication task created',
      data: {
        taskId,
        taskType,
        targetUser,
        authType,
        priority: priority || 'MEDIUM',
        philosophy: 'Re-auth'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create auth task: ${error.message}`
    });
  }
});

// GET /api/cleanup-reconfig/metrics - Get all metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const cleanupMetrics = cleanupReconfigService.getCleanupMetrics();
    const reconfigMetrics = cleanupReconfigService.getReconfigMetrics();
    const authMetrics = cleanupReconfigService.getAuthMetrics();

    res.json({
      success: true,
      message: 'Metrics retrieved',
      data: {
        cleanupMetrics,
        reconfigMetrics,
        authMetrics,
        overallHealth: (cleanupMetrics.cleanupSuccessRate + 
                        reconfigMetrics.reconfigSuccessRate + 
                        authMetrics.authSuccessRate) / 3,
        philosophy: 'I choose what I do because I supposed to it'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get metrics: ${error.message}`
    });
  }
});

// GET /api/cleanup-reconfig/cleanup/tasks - Get cleanup tasks
router.get('/cleanup/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = cleanupReconfigService.getCleanupTasks();
    const queue = cleanupReconfigService.getCleanupQueue();

    res.json({
      success: true,
      message: 'Cleanup tasks retrieved',
      data: {
        tasks,
        queue,
        totalTasks: tasks.length,
        queuedTasks: queue.length,
        philosophy: 'Start cleanup dead files'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get cleanup tasks: ${error.message}`
    });
  }
});

// GET /api/cleanup-reconfig/reconfig/tasks - Get reconfiguration tasks
router.get('/reconfig/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = cleanupReconfigService.getReconfigTasks();
    const queue = cleanupReconfigService.getReconfigQueue();

    res.json({
      success: true,
      message: 'Reconfiguration tasks retrieved',
      data: {
        tasks,
        queue,
        totalTasks: tasks.length,
        queuedTasks: queue.length,
        philosophy: 'Token reconfig'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get reconfig tasks: ${error.message}`
    });
  }
});

// GET /api/cleanup-reconfig/auth/tasks - Get authentication tasks
router.get('/auth/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = cleanupReconfigService.getAuthTasks();
    const queue = cleanupReconfigService.getAuthQueue();

    res.json({
      success: true,
      message: 'Authentication tasks retrieved',
      data: {
        tasks,
        queue,
        totalTasks: tasks.length,
        queuedTasks: queue.length,
        philosophy: 'Re-auth'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get auth tasks: ${error.message}`
    });
  }
});

// GET /api/cleanup-reconfig/report - Get comprehensive cleanup report
router.get('/report', authenticateToken, async (req, res) => {
  try {
    const report = await cleanupReconfigService.generateCleanupReport();

    res.json({
      success: true,
      message: 'Cleanup report generated',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to generate cleanup report: ${error.message}`
    });
  }
});

// POST /api/cleanup-reconfig/emergency-cleanup - Emergency cleanup
router.post('/emergency-cleanup', authenticateToken, async (req, res) => {
  try {
    const { scope } = req.body; // 'ALL', 'TOKENS', 'FILES', 'CACHE'

    // Create emergency cleanup tasks
    const tasks = [];

    if (scope === 'ALL' || scope === 'FILES') {
      tasks.push(
        await cleanupReconfigService.createCleanupTask('DEAD_FILES', './temp', { olderThan: 0 }, 'CRITICAL'),
        await cleanupReconfigService.createCleanupTask('TEMP_FILES', './temp', { olderThan: 0 }, 'CRITICAL'),
        await cleanupReconfigService.createCleanupTask('CACHE_CLEANUP', './cache', { maxSize: 0 }, 'CRITICAL')
      );
    }

    if (scope === 'ALL' || scope === 'TOKENS') {
      tasks.push(
        await cleanupReconfigService.createCleanupTask('STALE_TOKENS', 'database', { olderThan: 0 }, 'CRITICAL'),
        await cleanupReconfigService.createCleanupTask('EXPIRED_SESSIONS', 'database', { olderThan: 0 }, 'CRITICAL')
      );
    }

    if (scope === 'ALL' || scope === 'CACHE') {
      tasks.push(
        await cleanupReconfigService.createCleanupTask('CACHE_CLEANUP', './cache', { maxSize: 0 }, 'CRITICAL')
      );
    }

    res.json({
      success: true,
      message: `Emergency cleanup initiated for scope: ${scope}`,
      data: {
        scope,
        tasksCreated: tasks.length,
        taskIds: tasks,
        priority: 'CRITICAL',
        philosophy: 'I choose what I do because I supposed to it'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to initiate emergency cleanup: ${error.message}`
    });
  }
});

// POST /api/cleanup-reconfig/emergency-reconfig - Emergency reconfiguration
router.post('/emergency-reconfig', authenticateToken, async (req, res) => {
  try {
    const { scope } = req.body; // 'ALL', 'TOKENS', 'AUTH', 'SYSTEM'

    // Create emergency reconfig tasks
    const tasks = [];

    if (scope === 'ALL' || scope === 'TOKENS') {
      tasks.push(
        await cleanupReconfigService.createReconfigTask('TOKEN_RECONFIG', 'ROTATE', 'auth', { rotateAll: true }, 'CRITICAL')
      );
    }

    if (scope === 'ALL' || scope === 'AUTH') {
      tasks.push(
        await cleanupReconfigService.createReconfigTask('AUTH_RECONFIG', 'RESET', 'auth', { resetAll: true }, 'CRITICAL')
      );
    }

    if (scope === 'ALL' || scope === 'SYSTEM') {
      tasks.push(
        await cleanupReconfigService.createReconfigTask('SYSTEM_RECONFIG', 'RESET', 'system', { reloadConfig: true }, 'CRITICAL')
      );
    }

    res.json({
      success: true,
      message: `Emergency reconfiguration initiated for scope: ${scope}`,
      data: {
        scope,
        tasksCreated: tasks.length,
        taskIds: tasks,
        priority: 'CRITICAL',
        philosophy: 'Token reconfig'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to initiate emergency reconfig: ${error.message}`
    });
  }
});

// POST /api/cleanup-reconfig/emergency-auth - Emergency re-authentication
router.post('/emergency-auth', authenticateToken, async (req, res) => {
  try {
    const { scope } = req.body; // 'ALL', 'USERS', 'SYSTEM'

    // Create emergency auth tasks
    const tasks = [];

    if (scope === 'ALL' || scope === 'USERS') {
      tasks.push(
        await cleanupReconfigService.createAuthTask('RE_AUTH', 'ALL_USERS', 'JWT', { refreshAll: true }, 'CRITICAL')
      );
    }

    if (scope === 'ALL' || scope === 'SYSTEM') {
      tasks.push(
        await cleanupReconfigService.createAuthTask('TOKEN_REFRESH', 'SYSTEM', 'API_KEY', { rotateAll: true }, 'CRITICAL')
      );
    }

    res.json({
      success: true,
      message: `Emergency re-authentication initiated for scope: ${scope}`,
      data: {
        scope,
        tasksCreated: tasks.length,
        taskIds: tasks,
        priority: 'CRITICAL',
        philosophy: 'Re-auth'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to initiate emergency re-auth: ${error.message}`
    });
  }
});

// GET /api/cleanup-reconfig/status - Get service status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const cleanupMetrics = cleanupReconfigService.getCleanupMetrics();
    const reconfigMetrics = cleanupReconfigService.getReconfigMetrics();
    const authMetrics = cleanupReconfigService.getAuthMetrics();

    const status = {
      service: 'CleanupReconfigService',
      status: 'RUNNING',
      uptime: process.uptime(),
      philosophy: 'I choose what I do because I supposed to it',
      metrics: {
        cleanup: cleanupMetrics,
        reconfig: reconfigMetrics,
        auth: authMetrics
      },
      queues: {
        cleanup: cleanupReconfigService.getCleanupQueue().length,
        reconfig: cleanupReconfigService.getReconfigQueue().length,
        auth: cleanupReconfigService.getAuthQueue().length
      },
      health: {
        overall: (cleanupMetrics.cleanupSuccessRate + reconfigMetrics.reconfigSuccessRate + authMetrics.authSuccessRate) / 3,
        cleanup: cleanupMetrics.cleanupSuccessRate,
        reconfig: reconfigMetrics.reconfigSuccessRate,
        auth: authMetrics.authSuccessRate
      }
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get service status: ${error.message}`
    });
  }
});

// GET /api/cleanup-reconfig/philosophy - Get cleanup philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "Cleanup and Reconfiguration Philosophy",
      corePrinciple: "I choose what I do because I supposed to it",
      description: "The philosophy of conscious choice in system maintenance and reconfiguration",
      keyInsights: [
        "I choose what I do because I supposed to it",
        "Start cleanup dead files - conscious file management",
        "Token reconfig - deliberate security maintenance",
        "Re-auth - intentional authentication renewal",
        "System maintenance through conscious choice"
      ],
      cleanupTypes: {
        DEAD_FILES: "Remove obsolete and unused files",
        STALE_TOKENS: "Clean up expired authentication tokens",
        EXPIRED_SESSIONS: "Remove expired user sessions",
        ORPHANED_DATA: "Clean up orphaned database records",
        CACHE_CLEANUP: "Manage cache size and performance",
        LOG_ROTATION: "Rotate and archive log files",
        TEMP_FILES: "Clean up temporary files"
      },
      reconfigTypes: {
        TOKEN_RECONFIG: "Reconfigure authentication tokens",
        AUTH_RECONFIG: "Reconfigure authentication settings",
        SYSTEM_RECONFIG: "Reconfigure system parameters",
        NETWORK_RECONFIG: "Reconfigure network settings",
        DATABASE_RECONFIG: "Reconfigure database parameters"
      },
      authTypes: {
        RE_AUTH: "Re-authenticate users and systems",
        TOKEN_REFRESH: "Refresh authentication tokens",
        SESSION_RENEW: "Renew user sessions",
        PERMISSION_UPDATE: "Update user permissions",
        ROLE_REASSIGN: "Reassign user roles"
      },
      consciousChoice: {
        decisionMaking: "Every cleanup action is a conscious choice",
        responsibility: "Taking responsibility for system health",
        intentionality: "Purposeful maintenance and optimization",
        awareness: "Understanding the impact of each action",
        control: "Exercising control over system state"
      },
      universalTruth: "System maintenance is not automatic - it requires conscious choice and deliberate action. I choose what I do because I am supposed to do it, taking responsibility for the health and security of the entire system."
    };

    res.json({
      success: true,
      message: "Cleanup philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get philosophy: ${error.message}`
    });
  }
});

export default router;
