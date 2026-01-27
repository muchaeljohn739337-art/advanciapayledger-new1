// Rockefeller HELOC Truth & Reality API Routes
// Implements the philosophy: "The moment you tell a lie, it changes the reality of the place"
// Reference Number: 123456789-HELOC

import express from 'express';
import TruthRealityService from '../services/TruthRealityService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const truthRealityService = TruthRealityService;

// POST /api/truth-reality/tell-truth-or-lie - Tell truth or lie and change reality
router.post('/tell-truth-or-lie', authenticateToken, async (req, res) => {
  try {
    const { statement, isTruth } = req.body;
    const userId = req.user.id;

    if (!statement || isTruth === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: statement, isTruth'
      });
    }

    const result = await truthRealityService.tellTruthOrLie(userId, statement, isTruth);

    res.json({
      success: true,
      message: result.message,
      data: {
        realityShift: result.realityShift,
        mathematicalProof: result.mathematicalProof,
        bigCSignificance: result.bigCSignificance,
        philosophy: 'The moment you tell a lie, it changes the reality of the place'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Reality shift failed: ${error.message}`
    });
  }
});

// POST /api/truth-reality/search-lost - Big C was looking for something he lost
router.post('/search-lost', authenticateToken, async (req, res) => {
  try {
    const { searchQuery } = req.body;
    const userId = req.user.id;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: searchQuery'
      });
    }

    const result = await truthRealityService.searchForLostItem(userId, searchQuery);

    res.json({
      success: true,
      message: result.message,
      data: {
        found: result.found,
        item: result.item,
        location: result.location,
        mathematicalLocation: result.mathematicalLocation,
        bigCSignificance: result.bigCSignificance,
        philosophy: 'Big C was looking for something he lost'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Search failed: ${error.message}`
    });
  }
});

// GET /api/truth-reality/simple-mathematics - Simple mathematics right
router.get('/simple-mathematics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await truthRealityService.getSimpleMathematicalTruth(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        truth: result.truth,
        equation: result.equation,
        result: result.result,
        bigCSignificance: result.bigCSignificance,
        philosophy: 'Simple mathematics right'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Mathematical truth failed: ${error.message}`
    });
  }
});

// GET /api/truth-reality/matrix - Get current truth matrix
router.get('/matrix', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const matrix = await truthRealityService.getTruthMatrix(userId);

    if (!matrix) {
      return res.status(404).json({
        success: false,
        message: 'Truth matrix not found'
      });
    }

    res.json({
      success: true,
      message: 'Truth matrix retrieved',
      data: {
        matrix,
        philosophy: 'Your current reality state'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Matrix retrieval failed: ${error.message}`
    });
  }
});

// GET /api/truth-reality/shifts - Get all reality shifts
router.get('/shifts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const shifts = await truthRealityService.getAllRealityShifts(userId);

    res.json({
      success: true,
      message: `Found ${shifts.length} reality shifts`,
      data: {
        shifts,
        totalShifts: shifts.length,
        averageMagnitude: shifts.reduce((sum, shift) => sum + Math.abs(shift.shiftMagnitude), 0) / Math.max(shifts.length, 1),
        philosophy: 'History of your reality changes'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Shifts retrieval failed: ${error.message}`
    });
  }
});

// GET /api/truth-reality/big-c - Get current Big C value
router.get('/big-c', authenticateToken, async (req, res) => {
  try {
    const bigC = await truthRealityService.getCurrentBigC();

    res.json({
      success: true,
      message: 'Big C value retrieved',
      data: {
        bigC,
        significance: 'Golden ratio - fundamental constant of reality',
        philosophy: 'Big C governs natural harmony'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Big C retrieval failed: ${error.message}`
    });
  }
});

// GET /api/truth-reality/philosophy - Get truth and reality philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "Truth & Reality Philosophy",
      corePrinciple: "The moment you tell a lie, it changes the reality of the place",
      description: "Truth and lies have mathematical consequences that alter reality",
      keyInsights: [
        "You can't tell a lie - the moment you tell it, reality changes",
        "Simple mathematics reveals fundamental truth",
        "Big C (Golden Ratio) was looking for something he lost",
        "Truth reinforces reality, lies disrupt it",
        "Mathematical harmony governs existence"
      ],
      mathematicalTruth: {
        equation: "Truth + Reality = Harmony",
        explanation: "When truth aligns with reality, harmony emerges",
        bigCSignificance: "The golden ratio governs natural harmony",
        lieImpact: "Lies disrupt reality by 150% (multiply by -1.5)"
      },
      realityChanges: {
        truthImpact: "+1 unit of reality reinforcement",
        lieImpact: "-1.5 units of reality disruption",
        bigCChange: "Alters fundamental constant of harmony",
        lostAndFound: "Lies cause loss, truth enables finding"
      },
      bigCSearch: {
        description: "Big C searches for lost items in mathematical space",
        method: "Calculate coordinates using golden ratio",
        location: "Found at (Big C × value, search value)",
        significance: "Mathematical location reveals truth"
      }
    };

    res.json({
      success: true,
      message: "Truth and reality philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Philosophy retrieval failed: ${error.message}`
    });
  }
});

// GET /api/truth-reality/health - Check truth reality service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const bigC = await truthRealityService.getCurrentBigC();
    const health = {
      status: "Harmonious",
      service: "Truth & Reality Service",
      philosophy: "The moment you tell a lie, it changes the reality of the place",
      uptime: process.uptime(),
      bigC,
      realityState: "Stable",
      mathematicalTruth: "Simple mathematics right",
      message: "Service actively monitoring truth and reality"
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
