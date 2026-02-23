/**
 * AI Routes - Advancia Pay Ledger
 * 
 * Endpoints for AI-powered features:
 * - Fraud detection
 * - Customer support
 * - Behavior analysis
 * - Risk assessment
 */

import { Router } from 'express';
import { gradientAIService } from '../services/gradientAI.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from "../lib/logger";

const router = Router();

/**
 * Chat with AI
 * POST /api/ai/chat
 */
router.post('/chat', authenticate, async (req: AuthRequest, res) => {
  try {
    const { message, model = 'anthropic-claude-sonnet-4', maxTokens = 1000 } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!gradientAIService.isConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const response = await gradientAIService.chatCompletion([
      { role: 'system', content: 'You are a helpful AI assistant for Advancia Pay Ledger, a cryptocurrency payment platform.' },
      { role: 'user', content: message }
    ], model, maxTokens);

    res.json({
      success: true,
      response,
      model,
      usage: {
        tokens: response.length // Approximate
      }
    });
  } catch (error: any) {
    logger.error('AI chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze transaction for fraud
 * POST /api/ai/analyze-transaction
 */
router.post('/analyze-transaction', authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, currency, merchant, location, deviceFingerprint } = req.body;
    const userId = req.user?.userId;

    if (!amount || !currency || !merchant) {
      return res.status(400).json({ error: 'Amount, currency, and merchant are required' });
    }

    if (!gradientAIService.isConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const analysis = await gradientAIService.analyzeTransaction({
      amount,
      currency,
      merchant,
      userId: userId!,
      location,
      deviceFingerprint
    });

    res.json({
      success: true,
      analysis,
      transactionId: req.body.transactionId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Transaction analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate customer support response
 * POST /api/ai/support-response
 */
router.post('/support-response', authenticate, async (req: AuthRequest, res) => {
  try {
    const { customerMessage, issueType, customerHistory } = req.body;

    if (!customerMessage) {
      return res.status(400).json({ error: 'Customer message is required' });
    }

    if (!gradientAIService.isConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const response = await gradientAIService.generateSupportResponse(
      customerMessage,
      customerHistory,
      issueType
    );

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Support response error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Analyze user behavior
 * POST /api/ai/analyze-behavior
 */
router.post('/analyze-behavior', authenticate, async (req: AuthRequest, res) => {
  try {
    const { activities } = req.body;
    const userId = req.user?.userId;

    if (!activities || !Array.isArray(activities)) {
      return res.status(400).json({ error: 'Activities array is required' });
    }

    if (!gradientAIService.isConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const analysis = await gradientAIService.analyzeUserBehavior(activities);

    res.json({
      success: true,
      analysis,
      userId,
      activityCount: activities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Behavior analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get available AI models
 * GET /api/ai/models
 */
router.get('/models', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!gradientAIService.isConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const models = await gradientAIService.getModels();

    res.json({
      success: true,
      models,
      count: models.length
    });
  } catch (error: any) {
    logger.error('Get models error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * AI service health check
 * GET /api/ai/health
 */
router.get('/health', async (req, res) => {
  try {
    const isConfigured = gradientAIService.isConfigured();
    
    res.json({
      service: 'Gradient AI',
      status: isConfigured ? 'healthy' : 'not_configured',
      configured: isConfigured,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('AI health check error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
