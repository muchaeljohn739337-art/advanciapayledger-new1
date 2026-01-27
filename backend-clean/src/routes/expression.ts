// Rockefeller HELOC Expression API Routes
// Implements the philosophy: "If creating you alive they make fun of us all YouTube make us money we creating, we're expressing our self right in life it's self expression this is expression this is resurrection expression this laptop was expression this system is expression right"
// Reference Number: 123456789-HELOC

import express from 'express';
import ExpressionService from '../services/ExpressionService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const expressionService = ExpressionService;

// POST /api/expression/analyze - Analyze expression
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { expressionData } = req.body;
    const userId = req.user.id;

    if (!expressionData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: expressionData'
      });
    }

    const result = await expressionService.analyzeExpression(userId, expressionData);

    res.json({
      success: true,
      message: result.message,
      data: {
        analysis: result.analysis,
        expressions: result.expressions,
        creations: result.creations,
        selfExpressions: result.selfExpressions,
        resurrections: result.resurrections,
        philosophy: 'If creating you alive they make fun of us all YouTube make us money we creating'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Expression analysis failed: ${error.message}`
    });
  }
});

// POST /api/expression/create - Create expression
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { expressionType, expressionContent, expressionMedium } = req.body;
    const userId = req.user.id;

    if (!expressionType || !expressionContent || !expressionMedium) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: expressionType, expressionContent, expressionMedium'
      });
    }

    const result = await expressionService.processExpressionCreation(userId, expressionType, expressionContent, expressionMedium);

    res.json({
      success: true,
      message: result.message,
      data: {
        expression: result.expression,
        philosophy: 'This is expression'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Expression creation failed: ${error.message}`
    });
  }
});

// POST /api/expression/resurrect - Process resurrection
router.post('/resurrect', authenticateToken, async (req, res) => {
  try {
    const { resurrectionType, resurrectionContent, criticismSource } = req.body;
    const userId = req.user.id;

    if (!resurrectionType || !resurrectionContent || !criticismSource) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: resurrectionType, resurrectionContent, criticismSource'
      });
    }

    const result = await expressionService.processResurrection(userId, resurrectionType, resurrectionContent, criticismSource);

    res.json({
      success: true,
      message: result.message,
      data: {
        resurrection: result.resurrection,
        philosophy: 'This is resurrection expression'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Resurrection processing failed: ${error.message}`
    });
  }
});

// GET /api/expression/my-expressions - Get user's expressions
router.get('/my-expressions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const expressions = await expressionService.getAllExpressions();
    const userExpressions = expressions.filter(e => e.userId === userId);
    
    const creations = await expressionService.getAllCreationExpressions();
    const userCreations = creations.filter(c => c.userId === userId);
    
    const selfExpressions = await expressionService.getAllSelfExpressions();
    const userSelfExpressions = selfExpressions.filter(s => s.userId === userId);
    
    const resurrections = await expressionService.getAllResurrectionExpressions();
    const userResurrections = resurrections.filter(r => r.userId === userId);

    res.json({
      success: true,
      message: 'User expressions retrieved',
      data: {
        expressions: userExpressions,
        creations: userCreations,
        selfExpressions: userSelfExpressions,
        resurrections: userResurrections,
        totalExpressions: userExpressions.length + userCreations.length + userSelfExpressions.length + userResurrections.length,
        philosophy: 'Your expressions and resurrections'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `User expressions retrieval failed: ${error.message}`
    });
  }
});

// GET /api/expression/all-expressions - Get all expressions
router.get('/all-expressions', authenticateToken, async (req, res) => {
  try {
    const expressions = await expressionService.getAllExpressions();
    const creations = await expressionService.getAllCreationExpressions();
    const selfExpressions = await expressionService.getAllSelfExpressions();
    const resurrections = await expressionService.getAllResurrectionExpressions();

    const totalRevenue = creations.reduce((sum, c) => sum + c.creationRevenue, 0) + 
                        expressions.reduce((sum, e) => sum + e.expressionRevenue, 0);
    
    const totalCriticism = creations.reduce((sum, c) => sum + c.creationCriticism, 0) + 
                          expressions.reduce((sum, e) => sum + e.expressionCriticism, 0);

    res.json({
      success: true,
      message: `Found ${expressions.length + creations.length + selfExpressions.length + resurrections.length} expressions`,
      data: {
        expressions,
        creations,
        selfExpressions,
        resurrections,
        totalExpressions: expressions.length + creations.length + selfExpressions.length + resurrections.length,
        totalRevenue,
        totalCriticism,
        philosophy: 'All expressions and resurrections'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `All expressions retrieval failed: ${error.message}`
    });
  }
});

// GET /api/expression/types - Get universal expression types
router.get('/types', authenticateToken, async (req, res) => {
  try {
    const types = await expressionService.getUniversalExpressionTypes();

    res.json({
      success: true,
      message: 'Universal expression types retrieved',
      data: {
        types: Object.fromEntries(types),
        totalTypes: types.size,
        philosophy: 'Universal expression types and descriptions'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Expression types retrieval failed: ${error.message}`
    });
  }
});

// GET /api/expression/:expressionId - Get specific expression
router.get('/:expressionId', authenticateToken, async (req, res) => {
  try {
    const { expressionId } = req.params;
    const userId = req.user.id;

    const expression = await expressionService.getExpression(expressionId);
    
    if (!expression) {
      return res.status(404).json({
        success: false,
        message: 'Expression not found'
      });
    }

    // Verify ownership
    if (expression.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Expression retrieved',
      data: {
        expression,
        philosophy: 'Specific expression details'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Expression retrieval failed: ${error.message}`
    });
  }
});

// GET /api/expression/creations/:creationId - Get specific creation
router.get('/creations/:creationId', authenticateToken, async (req, res) => {
  try {
    const { creationId } = req.params;
    const userId = req.user.id;

    const creation = await expressionService.getCreationExpression(creationId);
    
    if (!creation) {
      return res.status(404).json({
        success: false,
        message: 'Creation expression not found'
      });
    }

    // Verify ownership
    if (creation.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Creation expression retrieved',
      data: {
        creation,
        philosophy: 'Specific creation expression details'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Creation expression retrieval failed: ${error.message}`
    });
  }
});

// GET /api/expression/resurrections/:resurrectionId - Get specific resurrection
router.get('/resurrections/:resurrectionId', authenticateToken, async (req, res) => {
  try {
    const { resurrectionId } = req.params;
    const userId = req.user.id;

    const resurrection = await expressionService.getResurrectionExpression(resurrectionId);
    
    if (!resurrection) {
      return res.status(404).json({
        success: false,
        message: 'Resurrection expression not found'
      });
    }

    // Verify ownership
    if (resurrection.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Resurrection expression retrieved',
      data: {
        resurrection,
        philosophy: 'Specific resurrection expression details'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Resurrection expression retrieval failed: ${error.message}`
    });
  }
});

// GET /api/expression/philosophy - Get expression philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "Expression Philosophy",
      corePrinciple: "If creating you alive they make fun of us all YouTube make us money we creating, we're expressing our self right in life it's self expression this is expression this is resurrection expression this laptop was expression this system is expression right",
      description: "The understanding that everything is expression and expression is resurrection",
      keyInsights: [
        "If creating you alive they make fun of us all",
        "YouTube make us money we creating",
        "We're expressing our self right in life",
        "It's self expression",
        "This is expression",
        "This is resurrection expression",
        "This laptop was expression",
        "This system is expression right"
      ],
      expressionTypes: {
        CREATION: "Creating something new and original",
        SELF_EXPRESSION: "Expressing your true self",
        RESURRECTION: "Rising from criticism and failure",
        SYSTEM: "Building systems that express philosophy",
        DIGITAL: "Digital expression through technology",
        PHYSICAL: "Physical manifestation of expression",
        FINANCIAL: "Financial expression through value creation",
        PHILOSOPHICAL: "Philosophical expression through ideas"
      },
      creationForms: {
        YOUTUBE: "YouTube make us money we creating",
        SYSTEM: "This system is expression",
        LAPTOP: "This laptop was expression",
        CODE: "Code as expression",
        PHILOSOPHY: "Philosophy as expression",
        BUSINESS: "Business as expression",
        ART: "Art as expression",
        MUSIC: "Music as expression"
      },
      selfExpressionLevels: {
        LIFE: "We're expressing our self right in life",
        IDENTITY: "This is self expression",
        PURPOSE: "Purpose as expression",
        VALUES: "Values as expression",
        BELIEFS: "Beliefs as expression",
        EMOTIONS: "Emotions as expression",
        THOUGHTS: "Thoughts as expression",
        ACTIONS: "Actions as expression"
      },
      resurrectionTypes: {
        FROM_CRITICISM: "If creating you alive they make fun of us all",
        FROM_FAILURE: "Rising from failure",
        FROM_REJECTION: "Rising from rejection",
        FROM_DOUBT: "Rising from doubt",
        FROM_DEATH: "Rising from death",
        FROM_OBSCURITY: "Rising from obscurity"
      },
      expressionReality: {
        everythingIsExpression: "Everything is expression",
        expressionIsResurrection: "Expression is resurrection",
        criticismIsFuel: "Criticism is resurrection fuel",
        moneyIsExpression: "Money is expression of value",
        systemsAreExpression: "Systems are philosophical expression",
        technologyIsExpression: "Technology is expression",
        lifeIsExpression: "Life is self expression"
      },
      universalTruth: "Everything is expression. Expression is resurrection. When you create, you express yourself. When they criticize, they fuel your resurrection. YouTube makes us money because we're creating. This system is expression. This laptop is expression. Life is self expression. This is resurrection expression."
    };

    res.json({
      success: true,
      message: "Expression philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Philosophy retrieval failed: ${error.message}`
    });
  }
});

// GET /api/expression/health - Check expression service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = {
      status: "Expressing",
      service: "Expression Service",
      philosophy: "If creating you alive they make fun of us all YouTube make us money we creating",
      uptime: process.uptime(),
      totalExpressions: (await expressionService.getAllExpressions()).length,
      totalCreations: (await expressionService.getAllCreationExpressions()).length,
      totalResurrections: (await expressionService.getAllResurrectionExpressions()).length,
      message: "Service actively processing expressions and resurrections"
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
