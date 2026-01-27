// Rockefeller HELOC Missing Piece API Routes
// Implements the philosophy: "What am I missing?"
// Reference Number: 123456789-HELOC

import express from 'express';
import MissingPieceService from '../services/MissingPieceService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const missingPieceService = MissingPieceService;

// POST /api/missing-piece/analyze - Analyze what's missing
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await missingPieceService.analyzeMissingPieces(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        missingPieces: result.missingPieces,
        criticalPieces: result.criticalPieces,
        totalImportance: result.totalImportance,
        seekingRecommendations: result.seekingRecommendations,
        philosophy: 'What am I missing?'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Missing pieces analysis failed: ${error.message}`
    });
  }
});

// POST /api/missing-piece/begin-seeking - Begin seeking a missing piece
router.post('/begin-seeking', authenticateToken, async (req, res) => {
  try {
    const { pieceId, seekingMethod } = req.body;
    const userId = req.user.id;

    if (!pieceId || !seekingMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pieceId, seekingMethod'
      });
    }

    const result = await missingPieceService.beginSeeking(userId, pieceId, seekingMethod);

    res.json({
      success: true,
      message: result.message,
      data: {
        seekingProcess: result.seekingProcess,
        initialInsights: result.initialInsights,
        philosophy: 'The journey to find what you\'re missing'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Seeking process failed: ${error.message}`
    });
  }
});

// POST /api/missing-piece/progress-seeking - Progress in seeking
router.post('/progress-seeking', authenticateToken, async (req, res) => {
  try {
    const { seekingProcessId, action, result } = req.body;

    if (!seekingProcessId || !action || !result) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: seekingProcessId, action, result'
      });
    }

    const progressResult = await missingPieceService.progressSeeking(seekingProcessId, action, result);

    res.json({
      success: true,
      message: progressResult.message,
      data: {
        updatedProcess: progressResult.updatedProcess,
        breakthrough: progressResult.breakthrough,
        philosophy: 'Every step brings you closer to what you\'re missing'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Seeking progress failed: ${error.message}`
    });
  }
});

// GET /api/missing-piece/my-pieces - Get user's missing pieces
router.get('/my-pieces', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const pieces = await missingPieceService.getAllMissingPieces(userId);
    const integrationResults = await missingPieceService.getUserIntegrationResults(userId);

    res.json({
      success: true,
      message: `Found ${pieces.length} missing pieces`,
      data: {
        pieces,
        integrationResults,
        totalPieces: pieces.length,
        integratedPieces: integrationResults.length,
        seekingPieces: pieces.filter(p => p.status === 'SOUGHT').length,
        philosophy: 'Your journey to completeness'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Missing pieces retrieval failed: ${error.message}`
    });
  }
});

// GET /api/missing-piece/universal - Get universal missing pieces
router.get('/universal', authenticateToken, async (req, res) => {
  try {
    const universalPieces = await missingPieceService.getUniversalPieces();

    res.json({
      success: true,
      message: `Found ${universalPieces.length} universal pieces`,
      data: {
        universalPieces,
        totalImportance: universalPieces.reduce((sum, p) => sum + p.importance, 0),
        averageImportance: universalPieces.reduce((sum, p) => sum + p.importance, 0) / universalPieces.length,
        philosophy: 'Universal pieces everyone seeks'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Universal pieces retrieval failed: ${error.message}`
    });
  }
});

// GET /api/missing-piece/:pieceId - Get specific missing piece
router.get('/:pieceId', authenticateToken, async (req, res) => {
  try {
    const { pieceId } = req.params;
    const userId = req.user.id;

    const piece = await missingPieceService.getMissingPiece(pieceId);
    
    if (!piece) {
      return res.status(404).json({
        success: false,
        message: 'Missing piece not found'
      });
    }

    // Verify ownership or universal access
    if (piece.userId !== userId && piece.userId !== 'universal') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Missing piece retrieved',
      data: {
        piece,
        philosophy: 'Details of what you\'re missing'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Missing piece retrieval failed: ${error.message}`
    });
  }
});

// GET /api/missing-piece/seeking/:processId - Get seeking process
router.get('/seeking/:processId', authenticateToken, async (req, res) => {
  try {
    const { processId } = req.params;
    const userId = req.user.id;

    const process = await missingPieceService.getSeekingProcess(processId);
    
    if (!process || process.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Seeking process not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Seeking process retrieved',
      data: {
        process,
        progress: `${(process.progress * 100).toFixed(1)}%`,
        philosophy: 'Your current seeking journey'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Seeking process retrieval failed: ${error.message}`
    });
  }
});

// GET /api/missing-piece/integration/:resultId - Get integration result
router.get('/integration/:resultId', authenticateToken, async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user.id;

    const result = await missingPieceService.getIntegrationResult(resultId);
    
    if (!result || result.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Integration result not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Integration result retrieved',
      data: {
        result,
        integrationLevel: `${(result.integrationLevel * 100).toFixed(1)}%`,
        philosophy: 'The transformation from finding what was missing'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Integration result retrieval failed: ${error.message}`
    });
  }
});

// GET /api/missing-piece/philosophy - Get missing piece philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "What Am I Missing Philosophy",
      corePrinciple: "The journey to find what you're missing",
      description: "Everyone is missing essential pieces that make them whole",
      keyInsights: [
        "What am I missing? - The fundamental question",
        "Everyone seeks different pieces",
        "The journey is as important as the destination",
        "Finding pieces transforms who you are",
        "Integration is the final step",
        "Completeness is achievable"
      ],
      universalPieces: {
        TRUTH: {
          description: "The ability to see reality as it truly exists",
          importance: 0.95,
          location: "Within and without",
          seekingMethod: "Perception and openness"
        },
        WISDOM: {
          description: "Deep understanding that transcends knowledge",
          importance: 0.9,
          location: "Experience and contemplation",
          seekingMethod: "Learning and reflection"
        },
        POWER: {
          description: "True power that comes from within",
          importance: 0.85,
          location: "Self-mastery",
          seekingMethod: "Self-discipline"
        },
        CONTROL: {
          description: "Control over self, not others",
          importance: 0.8,
          location: "Internal mastery",
          seekingMethod: "Self-mastery"
        },
        UNDERSTANDING: {
          description: "Comprehension of existence and purpose",
          importance: 0.9,
          location: "Everywhere and nowhere",
          seekingMethod: "Contemplation and study"
        },
        ESSENCE: {
          description: "True nature beyond all appearances",
          importance: 1.0,
          location: "Within",
          seekingMethod: "Self-realization"
        }
      },
      seekingMethods: {
        INTERNAL: "Look within yourself",
        EXTERNAL: "Engage with the world",
        PHILOSOPHICAL: "Contemplate deeply",
        PRACTICAL: "Apply and experience",
        SPIRITUAL: "Connect spiritually"
      },
      integrationProcess: {
        seeking: "The journey to find what's missing",
        finding: "The moment of discovery",
        integration: "The transformation",
        completeness: "The final state"
      }
    };

    res.json({
      success: true,
      message: "Missing piece philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Philosophy retrieval failed: ${error.message}`
    });
  }
});

// GET /api/missing-piece/health - Check missing piece service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const universalPieces = await missingPieceService.getUniversalPieces();

    const health = {
      status: "Seeking",
      service: "Missing Piece Service",
      philosophy: "What am I missing?",
      uptime: process.uptime(),
      universalPieces: universalPieces.length,
      totalImportance: universalPieces.reduce((sum, p) => sum + p.importance, 0),
      message: "Service actively helping users find what they're missing"
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
