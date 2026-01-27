/**
 * Anthropic AI Routes - Advancia Pay Ledger
 * 
 * Anthropic Claude AI integration routes
 */

import { Router, Response } from 'express';
import { anthropicService } from '../services/anthropic.service';
import { authenticateAdminKey, requirePermission } from '../middleware/adminAuth';

const router = Router();

/**
 * Anthropic Service Status
 * GET /api/anthropic/status
 */
router.get('/status', (req, res) => {
  const status = anthropicService.getStatus();
  
  res.json({
    success: true,
    anthropic: {
      ...status,
      service: 'Anthropic Claude AI',
      model: 'claude-3-sonnet-20240229',
      capabilities: [
        'chat_completion',
        'fraud_detection',
        'customer_support',
        'behavior_analysis',
        'financial_insights',
        'compliance_reporting'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Chat Completion
 * POST /api/anthropic/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages array is required',
        example: {
          messages: [
            { role: 'user', content: 'Hello, how can you help me?' }
          ]
        }
      });
    }

    const response = await anthropicService.generateChatCompletion(messages);

    res.json({
      success: true,
      response,
      model: 'claude-3-sonnet-20240229',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Anthropic chat completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Text Completion
 * POST /api/anthropic/complete
 */
router.post('/complete', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required',
        example: { prompt: 'Write a short story about AI' }
      });
    }

    const response = await anthropicService.generateTextCompletion(prompt);

    res.json({
      success: true,
      response,
      model: 'claude-3-sonnet-20240229',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Anthropic text completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Transaction Fraud Analysis
 * POST /api/anthropic/analyze-transaction
 */
router.post('/analyze-transaction', async (req, res) => {
  try {
    const { transactionData } = req.body;

    if (!transactionData) {
      return res.status(400).json({ 
        error: 'Transaction data is required',
        example: {
          transactionData: {
            amount: 1000,
            currency: 'USD',
            merchant: 'example-merchant',
            userId: 'user123',
            timestamp: '2024-01-01T00:00:00Z'
          }
        }
      });
    }

    const analysis = await anthropicService.analyzeTransaction(transactionData);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Anthropic transaction analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Customer Support Response
 * POST /api/anthropic/support-response
 */
router.post('/support-response', async (req, res) => {
  try {
    const { customerMessage, category = 'general' } = req.body;

    if (!customerMessage) {
      return res.status(400).json({ 
        error: 'Customer message is required',
        example: {
          customerMessage: 'I need help with my account',
          category: 'account'
        }
      });
    }

    const supportResponse = await anthropicService.generateSupportResponse(customerMessage, category);

    res.json({
      success: true,
      supportResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Anthropic support response error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * User Behavior Analysis
 * POST /api/anthropic/analyze-behavior
 */
router.post('/analyze-behavior', async (req, res) => {
  try {
    const { userActivity } = req.body;

    if (!userActivity) {
      return res.status(400).json({ 
        error: 'User activity data is required',
        example: {
          userActivity: {
            userId: 'user123',
            loginCount: 10,
            transactions: 5,
            lastLogin: '2024-01-01T00:00:00Z',
            sessionDuration: 3600
          }
        }
      });
    }

    const behaviorAnalysis = await anthropicService.analyzeUserBehavior(userActivity);

    res.json({
      success: true,
      behaviorAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Anthropic behavior analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Financial Insights
 * POST /api/anthropic/financial-insights
 */
router.post('/financial-insights', async (req, res) => {
  try {
    const { financialData } = req.body;

    if (!financialData) {
      return res.status(400).json({ 
        error: 'Financial data is required',
        example: {
          financialData: {
            revenue: 100000,
            expenses: 75000,
            profit: 25000,
            transactions: 1000,
            period: 'monthly'
          }
        }
      });
    }

    const insights = await anthropicService.generateFinancialInsights(financialData);

    res.json({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Anthropic financial insights error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Compliance Report
 * POST /api/anthropic/compliance-report
 */
router.post('/compliance-report', authenticateAdminKey, requirePermission('read_reports'), async (req, res) => {
  try {
    const { complianceData } = req.body;

    if (!complianceData) {
      return res.status(400).json({ 
        error: 'Compliance data is required',
        example: {
          complianceData: {
            transactions: 1000,
            suspiciousActivities: 2,
            kycCompleted: 950,
            amlChecks: 980,
            period: 'monthly'
          }
        }
      });
    }

    const complianceReport = await anthropicService.generateComplianceReport(complianceData);

    res.json({
      success: true,
      complianceReport,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Anthropic compliance report error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Advanced AI Analysis (Admin Only)
 * POST /api/anthropic/advanced-analysis
 */
router.post('/advanced-analysis', authenticateAdminKey, requirePermission('manage_security'), async (req, res) => {
  try {
    const { data, analysisType } = req.body;

    if (!data || !analysisType) {
      return res.status(400).json({ 
        error: 'Data and analysis type are required',
        example: {
          data: { /* any data */ },
          analysisType: 'security_audit'
        }
      });
    }

    const prompt = `
    Perform an advanced ${analysisType} analysis on this data:

    ${JSON.stringify(data, null, 2)}

    Provide comprehensive insights, recommendations, and risk assessments.
    `;

    const analysis = await anthropicService.generateTextCompletion(prompt);

    res.json({
      success: true,
      analysisType,
      analysis,
      model: 'claude-3-sonnet-20240229',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Anthropic advanced analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * AI Health Check
 * GET /api/anthropic/health
 */
router.get('/health', async (req, res) => {
  try {
    // Test the service with a simple prompt
    const testResponse = await anthropicService.generateTextCompletion('Hello, please respond with "Service is working"');
    
    res.json({
      success: true,
      status: 'healthy',
      service: 'Anthropic Claude AI',
      model: 'claude-3-sonnet-20240229',
      testResponse: testResponse.includes('Service is working') ? 'PASS' : 'FAIL',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
