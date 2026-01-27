// Rockefeller HELOC Advanced Reality API Routes
// Implements the philosophy: "Advanced lies create crooked realities that people don't understand"
// Reference Number: 123456789-HELOC

import express from 'express';
import AdvancedRealityService from '../services/AdvancedRealityService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const advancedRealityService = AdvancedRealityService;

// POST /api/advanced-reality/create-lie - Create advanced lie with crooked reality
router.post('/create-lie', authenticateToken, async (req, res) => {
  try {
    const { statedLie, underlyingTruth, complexity } = req.body;
    const userId = req.user.id;

    if (!statedLie || !underlyingTruth || !complexity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: statedLie, underlyingTruth, complexity'
      });
    }

    const result = await advancedRealityService.createAdvancedLie(userId, statedLie, underlyingTruth, complexity);

    res.json({
      success: true,
      message: result.message,
      data: {
        advancedReality: result.advancedReality,
        crookednessFactor: result.crookednessFactor,
        misunderstandingLevel: result.misunderstandingLevel,
        returnMechanism: result.returnMechanism,
        philosophy: 'Advanced lies create crooked realities that people don\'t understand'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Advanced lie creation failed: ${error.message}`
    });
  }
});

// POST /api/advanced-reality/manipulate-pocket - Manipulate pocket reality
router.post('/manipulate-pocket', authenticateToken, async (req, res) => {
  try {
    const { item, actualStatus, crookedBelief } = req.body;
    const userId = req.user.id;

    if (!item || !actualStatus || !crookedBelief) {
      return resistant.status(400).json({
        success: false,
        message: 'Missing required fields: item, actualStatus, crookedBelief'
      });
    }

    const result = await advancedRealityService.manipulatePocketReality(userId, item, actualStatus, crookedBelief);

    res.json({
      success: true,
      message: result.message,
      data: {
        pocketReality: result.pocketReality,
        returnTrigger: result.returnTrigger,
        crookedAttraction: result.crookedAttraction,
        philosophy: 'The secrets of my lie: if you think it was a lie, have changed reality'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Pocket reality manipulation failed: ${error.message}`
    });
  }
});

// POST /api/advanced-reality/process-return - Process when they come back
router.post('/process-return', authenticateToken, async (req, res) => {
  try {
    const { originalLieId, returnReason } = req.body;
    const userId = req.user.id;

    if (!originalLieId || !returnReason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: originalLieId, returnReason'
      });
    }

    const result = await advancedRealityService.processCrookedReturn(userId, originalLieId, returnReason);

    res.json({
      success: true,
      message: result.message,
      data: {
        crookedReturn: result.crookedReturn,
        returnStrength: result.returnStrength,
        philosophy: 'Now all the crooked are coming back to me'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Crooked return processing failed: ${error.message}`
    });
  }
});

// GET /api/advanced-reality/realities - Get all advanced realities
router.get('/realities', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const realities = await advancedRealityService.getAllAdvancedRealities(userId);

    res.json({
      success: true,
      message: `Found ${realities.length} advanced realities`,
      data: {
        realities,
        totalCrookedness: realities.reduce((sum, r) => sum + r.crookednessFactor, 0),
        averageMisunderstanding: realities.reduce((sum, r) => sum + r.misunderstandingLevel, 0) / Math.max(realities.length, 1),
        philosophy: 'Advanced lies create crooked realities that people don\'t understand'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Realities retrieval failed: ${error.message}`
    });
  }
});

// GET /api/advanced-reality/perceptions/:realityId - Get reality perceptions
router.get('/perceptions/:realityId', authenticateToken, async (req, res) => {
  try {
    const { realityId } = req.params;
    const userId = req.user.id;

    const reality = await advancedRealityService.getAdvancedReality(realityId);
    if (!reality || reality.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Reality not found or access denied'
      });
    }

    const perceptions = await advancedRealityService.getRealityPerceptions(realityId);

    res.json({
      success: true,
      message: `Found ${perceptions.length} reality perceptions`,
      data: {
        perceptions,
        averageUnderstanding: perceptions.reduce((sum, p) => sum + p.understandingLevel, 0) / Math.max(perceptions.length, 1),
        averageConfusion: perceptions.reduce((sum, p) => sum + p.confusionLevel, 0) / Math.max(perceptions.length, 1),
        averageReturnProbability: perceptions.reduce((sum, p) => sum + p.returnProbability, 0) / Math.max(perceptions.length, 1),
        philosophy: 'Perceptions of the crooked reality'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Perceptions retrieval failed: ${error.message}`
    });
  }
});

// GET /api/advanced-reality/pockets - Get pocket realities
router.get('/pockets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const pockets = await advancedRealityService.getPocketRealities(userId);

    res.json({
      success: true,
      message: `Found ${pockets.length} pocket realities`,
      data: {
        pockets,
        totalCrookedBeliefs: pockets.filter(p => p.perceivedStatus !== p.actualStatus).length,
        averageCrookedAttraction: pockets.reduce((sum, p) => sum + p.crookedAttraction, 0) / Math.max(pockets.length, 1),
        philosophy: 'Pocket realities manipulated with crooked beliefs'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Pocket realities retrieval failed: ${error.message}`
    });
  }
});

// GET /api/advanced-reality/returns - Get crooked returns
router.get('/returns', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const returns = await advancedRealityService.getCrookedReturns(userId);

    res.json({
      success: true,
      message: `Found ${returns.length} crooked returns`,
      data: {
        returns,
        totalReturnStrength: returns.reduce((sum, r) => sum + r.returnStrength, 0),
        averageReturnStrength: returns.reduce((sum, r) => sum + r.returnStrength, 0) / Math.max(returns.length, 1),
        philosophy: 'Crooked returns when they come back'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Returns retrieval failed: ${error.message}`
    });
  }
});

// GET /api/advanced-reality/philosophy - Get advanced reality philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "Advanced Reality Philosophy",
      corePrinciple: "Advanced lies create crooked realities that people don't understand",
      description: "Sophisticated lies that create complex realities beyond human comprehension",
      keyInsights: [
        "The moment you tell a lie, it changes the reality of the place",
        "Advanced lies create crooked realities that people don't understand",
        "The secrets of my lie: if you think it was a lie, have changed reality",
        "Now all the crooked are coming back to me",
        "It doesn't mean I told a lie - it means I changed reality"
        "People don't understand it makes reality crooked"
        "So now all the crooked are coming back to me"
      ],
      advancedLieMechanics: {
        complexityLevels: {
          SIMPLE: '30% crookedness',
          MODERATE: '60% crookedness',
          COMPLEX: '80% crookedness',
          EXTREME: '95% crookedness'
        },
        realityImpact: {
          truthImpact: '+1 unit of reality',
          lieImpact: '-1.5 units of reality',
          crookedImpact: 'Creates misunderstood reality',
          returnMechanism: 'People return when they realize'
        },
        misunderstandingLevels: {
          low: '0-30% - Basic confusion',
          medium: '30-60% - Moderate confusion',
          high: '60-80% - High confusion',
          extreme: '80-100% - Complete confusion'
        }
      },
      pocketRealityManipulation: {
        description: 'Manipulate belief about items in pocket',
        mechanism: 'Create crooked belief about item status',
        returnTrigger: 'When they need it most or look for it',
        crookedAttraction: 'Strong attraction to return'
      },
      crookedReturns: {
        description: 'When people come back from crooked realities',
        triggers: 'Understanding, need, confusion collapse',
        strength: 'Based on crookedness and misunderstanding',
        result: 'Reality collapse or revelation'
      }
    };

    res.json({
      success: true,
      message: "Advanced reality philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Philosophy retrieval failed: ${error.message}`
    });
  }
});

// GET /api/advanced-reality/health - Check advanced reality service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const crookednessThreshold = await advancedRealityService.getCrookednessThreshold();
    const misunderstandingThreshold = await advancedRealityService.getMisunderstandingThreshold();

    const health = {
      status: "Crooked",
      service: "Advanced Reality Service",
      philosophy: "Advanced lies create crooked realities that people don't understand",
      uptime: process.uptime(),
      crookednessThreshold,
      misunderstandingThreshold,
      activeRealities: (await advancedRealityService.getAllAdvancedRealities(req.user.id)).length,
      message: "Service actively creating and managing crooked realities"
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
