// Rockefeller HELOC Reality Trap API Routes
// Implements the philosophy: "I created another reality that you dumb didn't want, so every time you try to play me, you dumb fool, you just played yourself"
// Reference Number: 123456789-HELOC

import express from 'express';
import RealityTrapService from '../services/RealityTrapService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const realityTrapService = RealityTrapService;

// POST /api/reality-trap/create - Create reality trap
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { targetId, trapName, originalReality, unwantedReality, complexity } = req.body;
    const creatorId = req.user.id;

    if (!targetId || !trapName || !originalReality || !unwantedReality || !complexity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: targetId, trapName, originalReality, unwantedReality, complexity'
      });
    }

    const result = await realityTrapService.createRealityTrap(creatorId, targetId, trapName, originalReality, unwantedReality, complexity);

    res.json({
      success: true,
      message: result.message,
      data: {
        realityTrap: result.realityTrap,
        foolishnessLevel: result.foolishnessLevel,
        selfPlayProbability: result.selfPlayProbability,
        philosophy: 'I created another reality that you dumb didn\'t want'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Reality trap creation failed: ${error.message}`
    });
  }
});

// POST /api/reality-trap/trigger - Trigger reality trap
router.post('/trigger', authenticateToken, async (req, res) => {
  try {
    const { trapId, attemptedAction } = req.body;

    if (!trapId || !attemptedAction) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: trapId, attemptedAction'
      });
    }

    const result = await realityTrapService.triggerRealityTrap(trapId, attemptedAction);

    res.json({
      success: true,
      message: result.message,
      data: {
        selfPlayEvent: result.selfPlayEvent,
        actualAction: result.actualAction,
        foolishnessMultiplier: result.foolishnessMultiplier,
        philosophy: 'Every time you try to play me, you dumb fool, you just played yourself'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Reality trap trigger failed: ${error.message}`
    });
  }
});

// GET /api/reality-trap/analyze-foolishness/:playerId - Analyze foolishness
router.get('/analyze-foolishness/:playerId', authenticateToken, async (req, res) => {
  try {
    const { playerId } = req.params;

    const result = await realityTrapService.analyzeFoolishness(playerId);

    res.json({
      success: true,
      message: result.message,
      data: {
        analysis: result.analysis,
        trapSusceptibility: result.trapSusceptibility,
        selfPlayHistory: result.selfPlayHistory,
        philosophy: 'Analysis of foolishness and trap susceptibility'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Foolishness analysis failed: ${error.message}`
    });
  }
});

// GET /api/reality-trap/my-traps - Get all traps created by user
router.get('/my-traps', authenticateToken, async (req, res) => {
  try {
    const creatorId = req.user.id;
    const traps = await realityTrapService.getAllRealityTraps(creatorId);

    res.json({
      success: true,
      message: `Found ${traps.length} reality traps`,
      data: {
        traps,
        totalTraps: traps.length,
        averageComplexity: traps.reduce((sum, t) => sum + t.trapComplexity, 0) / Math.max(traps.length, 1),
        averageFoolishness: traps.reduce((sum, t) => sum + t.foolishnessLevel, 0) / Math.max(traps.length, 1),
        philosophy: 'Your created reality traps'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Trap retrieval failed: ${error.message}`
    });
  }
});

// GET /api/reality-trap/target-traps - Get all traps targeting user
router.get('/target-traps', authenticateToken, async (req, res) => {
  try {
    const targetId = req.user.id;
    const traps = await realityTrapService.getTargetTraps(targetId);

    res.json({
      success: true,
      message: `Found ${traps.length} traps targeting you`,
      data: {
        traps,
        totalTraps: traps.length,
        activeTraps: traps.filter(t => t.trapStatus === 'SET' || t.trapStatus === 'TRIGGERED').length,
        sprungTraps: traps.filter(t => t.trapStatus === 'SPRING').length,
        collapsedTraps: traps.filter(t => t.trapStatus === 'COLLAPSED').length,
        philosophy: 'Reality traps targeting you'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Target traps retrieval failed: ${error.message}`
    });
  }
});

// GET /api/reality-trap/:trapId - Get specific trap
router.get('/:trapId', authenticateToken, async (req, res) => {
  try {
    const { trapId } = req.params;
    const userId = req.user.id;

    const trap = await realityTrapService.getRealityTrap(trapId);
    
    if (!trap) {
      return res.status(404).json({
        success: false,
        message: 'Trap not found'
      });
    }

    // Verify ownership or targeting
    if (trap.creatorId !== userId && trap.targetId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const selfPlayEvents = await realityTrapService.getSelfPlayEvents(trapId);
    const mirror = await realityTrapService.getRealityMirror(trapId);

    res.json({
      success: true,
      message: 'Trap retrieved',
      data: {
        trap,
        selfPlayEvents,
        mirror,
        philosophy: 'Reality trap details'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Trap retrieval failed: ${error.message}`
    });
  }
});

// GET /api/reality-trap/:trapId/events - Get self-play events
router.get('/:trapId/events', authenticateToken, async (req, res) => {
  try {
    const { trapId } = req.params;
    const userId = req.user.id;

    const trap = await realityTrapService.getRealityTrap(trapId);
    
    if (!trap) {
      return res.status(404).json({
        success: false,
        message: 'Trap not found'
      });
    }

    // Verify ownership or targeting
    if (trap.creatorId !== userId && trap.targetId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const events = await realityTrapService.getSelfPlayEvents(trapId);

    res.json({
      success: true,
      message: `Found ${events.length} self-play events`,
      data: {
        events,
        totalEvents: events.length,
        averageFoolishnessMultiplier: events.reduce((sum, e) => sum + e.foolishnessMultiplier, 0) / Math.max(events.length, 1),
        selfPlayTypes: events.reduce((acc, e) => {
          acc[e.selfPlayType] = (acc[e.selfPlayType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        philosophy: 'History of self-play events'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Events retrieval failed: ${error.message}`
    });
  }
});

// GET /api/reality-trap/philosophy - Get reality trap philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "Reality Trap Philosophy",
      corePrinciple: "I created another reality that you dumb didn't want, so every time you try to play me, you dumb fool, you just played yourself",
      description: "Create alternative realities that trap opponents in their own foolishness",
      keyInsights: [
        "I created another reality that you dumb didn't want",
        "Every time you try to play me, you dumb fool, you just played yourself",
        "The trap appears desirable but is actually unwanted",
        "Foolishness amplifies the trap effectiveness",
        "Self-play is inevitable when trapped",
        "Reality mirrors reflect the trap back at the target"
      ],
      trapMechanics: {
        complexityLevels: {
          SIMPLE: '30% complexity, basic self-play',
          MODERATE: '60% complexity, moderate self-play',
          COMPLEX: '80% complexity, advanced self-play',
          INFINITE: '95% complexity, infinite self-play'
        },
        selfPlayTypes: {
          DIRECT: 'You try to X, but you X against yourself',
          INDIRECT: 'You try to X, but it backfires and you X yourself',
          RECURSIVE: 'You try to X, which makes you X, which makes you X again',
          INFINITE: 'You try to X, now you\'re trapped in infinite loop of X against yourself'
        },
        foolishnessImpact: {
          calculation: 'Foolishness Level × Trap Complexity = Self-Play Probability',
          amplification: 'More foolish = more likely to play yourself',
          blindness: 'Foolishness creates reality blindness',
          detection: 'More foolish = less trap detection'
        }
      },
      realityMirrors: {
        types: {
          PERFECT: 'Perfect reflection of trap reality',
          DISTORTED: 'Distorted reflection, twisted reality',
          INVERTED: 'Inverted reflection, opposite reality',
          FRACTAL: 'Fractal reflection, infinitely complex reality'
        },
        function: 'Mirrors reflect the trap reality back at the target',
        amplification: 'Mirrors amplify foolishness and trap strength'
      },
      trapEvolution: {
        states: ['SET', 'TRIGGERED', 'SPRING', 'COLLAPSED'],
        triggers: 'Target attempts action in trap reality',
        spring: 'Too many self-play events',
        collapse: 'Time-based expiration or understanding'
      }
    };

    res.json({
      success: true,
      message: "Reality trap philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Philosophy retrieval failed: ${error.message}`
    });
  }
});

// GET /api/reality-trap/health - Check reality trap service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const complexityThreshold = await realityTrapService.getTrapComplexityThreshold();
    const foolishnessThreshold = await realityTrapService.getFoolishnessThreshold();

    const health = {
      status: "Trapping",
      service: "Reality Trap Service",
      philosophy: "I created another reality that you dumb didn't want",
      uptime: process.uptime(),
      complexityThreshold,
      foolishnessThreshold,
      activeTraps: (await realityTrapService.getAllRealityTraps(req.user.id)).length,
      message: "Service actively creating and monitoring reality traps"
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Health check failed: ${error.message}`
    });
  }
});

export default router;
