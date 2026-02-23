import { Router } from 'express';
import { securityConfigService } from '../services/security/securityConfig';
import { logger } from "../lib/logger";
// import { aiAgentSecurityController } from '../services/ai/security/agentSecurityController';
import { leakDetectionService } from '../services/security/leak-detection/leakDetectionService';
import { authenticateAdminKey } from '../middleware/adminAuth';

const aiAgentSecurityController = {
  registerAgent: (_agentId: string, _agentType: string, _capabilities: any) => false,
  unregisterAgent: (_agentId: string) => false,
  validateAgentOperation: (_agentId: string, _operation: string, _context: any) => ({
    allowed: false,
    reason: 'AI agent security controller disabled',
  }),
  validateLLMPrompt: (_prompt: string, _llmType?: string) => ({
    allowed: false,
    reason: 'LLM prompt validation disabled',
  }),
  sanitizeLLMResponse: (response: string, _llmType?: string) => response,
};

const router = Router();

// All security routes require admin authentication
router.use(authenticateAdminKey);

// Get overall security status
router.get('/status', async (req, res) => {
  try {
    const securityStatus = securityConfigService.getSecurityStatus();
    // const aiStatus = aiAgentSecurityController.getSecurityStatus();
    const leakStatus = leakDetectionService.getScanStatus();
    
    res.json({
      success: true,
      security: {
        overall: securityStatus,
        ai: { status: 'disabled' }, // aiStatus,
        leaks: leakStatus
      },
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to get security status:', error);
    res.status(500).json({ error: 'Failed to get security status' });
  }
});

// Get leak reports
router.get('/leaks', async (req, res) => {
  try {
    const severity = Array.isArray(req.query.severity)
      ? req.query.severity[0]
      : req.query.severity;
    const reports = leakDetectionService.getReports(severity as string);
    
    res.json({
      success: true,
      reports,
      total: reports.length
    });
  } catch (error) {
    logger.error('Failed to get leak reports:', error);
    res.status(500).json({ error: 'Failed to get leak reports' });
  }
});

// Get critical leaks
router.get('/leaks/critical', async (req, res) => {
  try {
    const reports = leakDetectionService.getCriticalReports();
    
    res.json({
      success: true,
      reports,
      total: reports.length
    });
  } catch (error) {
    logger.error('Failed to get critical leaks:', error);
    res.status(500).json({ error: 'Failed to get critical leaks' });
  }
});

// Trigger manual scan
router.post('/scan', async (req, res) => {
  try {
    await leakDetectionService.performFullScan();
    
    res.json({
      success: true,
      message: 'Security scan initiated'
    });
  } catch (error) {
    logger.error('Failed to start security scan:', error);
    res.status(500).json({ error: 'Failed to start security scan' });
  }
});

// Clear leak reports
router.delete('/leaks', async (req, res) => {
  try {
    leakDetectionService.clearReports();
    
    res.json({
      success: true,
      message: 'Leak reports cleared'
    });
  } catch (error) {
    logger.error('Failed to clear leak reports:', error);
    res.status(500).json({ error: 'Failed to clear leak reports' });
  }
});

// Register AI agent
router.post('/ai/agents/register', async (req, res) => {
  try {
    const { agentId, agentType, capabilities } = req.body;
    
    const success = aiAgentSecurityController.registerAgent(agentId, agentType, capabilities);
    
    if (success) {
      res.json({
        success: true,
        message: 'Agent registered successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to register agent'
      });
    }
  } catch (error) {
    logger.error('Failed to register AI agent:', error);
    res.status(500).json({ error: 'Failed to register AI agent' });
  }
});

// Unregister AI agent
router.delete('/ai/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const success = aiAgentSecurityController.unregisterAgent(agentId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Agent unregistered successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }
  } catch (error) {
    logger.error('Failed to unregister AI agent:', error);
    res.status(500).json({ error: 'Failed to unregister AI agent' });
  }
});

// Validate AI agent operation
router.post('/ai/agents/validate', async (req, res) => {
  try {
    const { agentId, operation, context } = req.body;
    
    const validation = aiAgentSecurityController.validateAgentOperation(agentId, operation, context);
    
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    logger.error('Failed to validate AI agent operation:', error);
    res.status(500).json({ error: 'Failed to validate AI agent operation' });
  }
});

// Validate LLM prompt
router.post('/ai/llm/validate-prompt', async (req, res) => {
  try {
    const { prompt, llmType } = req.body;
    
    const validation = aiAgentSecurityController.validateLLMPrompt(prompt, llmType);
    
    res.json({
      success: true,
      validation
    });
  } catch (error) {
    logger.error('Failed to validate LLM prompt:', error);
    res.status(500).json({ error: 'Failed to validate LLM prompt' });
  }
});

// Sanitize LLM response
router.post('/ai/llm/sanitize-response', async (req, res) => {
  try {
    const { response, llmType } = req.body;
    
    const sanitized = aiAgentSecurityController.sanitizeLLMResponse(response, llmType);
    
    res.json({
      success: true,
      sanitized
    });
  } catch (error) {
    logger.error('Failed to sanitize LLM response:', error);
    res.status(500).json({ error: 'Failed to sanitize LLM response' });
  }
});

export default router;
