import { Router } from 'express';
import { humanLoopService } from '../services/adaptive/humanLoopService';
import { userAdaptationService } from '../services/adaptive/userAdaptationService';
import { logger } from "../lib/logger";
import { authenticate, AuthRequest } from '../middleware/auth';
import { authenticateAdminKey } from '../middleware/adminAuth';

const router = Router();

// Get human loop status (admin only)
router.get('/human-loop/status', authenticateAdminKey, async (req, res) => {
  try {
    const stats = humanLoopService.getAdaptationStats();
    const rules = humanLoopService.getNonNegotiableRules();
    
    res.json({
      success: true,
      humanLoop: {
        stats,
        nonNegotiableRules: rules,
        status: 'active'
      }
    });
  } catch (error) {
    logger.error('Failed to get human loop status:', error);
    res.status(500).json({ error: 'Failed to get human loop status' });
  }
});

// Get user adaptations
router.get('/user/:userId/adaptations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    if (req.user?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const profile = userAdaptationService.getUserProfile(userId);
    const challenges = userAdaptationService.getAvailableChallenges(userId);
    
    res.json({
      success: true,
      profile,
      availableChallenges: challenges
    });
  } catch (error) {
    logger.error('Failed to get user adaptations:', error);
    res.status(500).json({ error: 'Failed to get user adaptations' });
  }
});

// Start adaptation challenge
router.post('/user/:userId/challenges/:challengeId/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId, challengeId } = req.params as { userId: string; challengeId: string };
    if (req.user?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const success = userAdaptationService.startChallenge(userId, challengeId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Challenge started successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to start challenge'
      });
    }
  } catch (error) {
    logger.error('Failed to start challenge:', error);
    res.status(500).json({ error: 'Failed to start challenge' });
  }
});

// Complete adaptation challenge
router.post('/user/:userId/challenges/:challengeId/complete', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId, challengeId } = req.params as { userId: string; challengeId: string };
    if (req.user?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { success } = req.body;
    
    userAdaptationService.completeChallenge(userId, challengeId, success);
    
    res.json({
      success: true,
      message: 'Challenge completion recorded'
    });
  } catch (error) {
    logger.error('Failed to complete challenge:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

// Get adaptation recommendations
router.get('/user/:userId/recommendations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    if (req.user?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // This would generate personalized recommendations
    const recommendations = {
      features: ['explore_virtual_cards', 'learn_crypto_payments'],
      workflows: ['batch_operations', 'quick_actions'],
      learning: ['security_best_practices', 'advanced_analytics'],
      efficiency: ['keyboard_shortcuts', 'automation_basics']
    };
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    logger.error('Failed to get recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Submit human approval for system adaptation (admin only)
router.post('/human-loop/approve', authenticateAdminKey, async (req, res) => {
  try {
    const { adaptationId, decision, reason } = req.body;
    
    // Process human approval decision
    logger.info(`👤 Human approval received: ${decision} for adaptation ${adaptationId}`);
    
    res.json({
      success: true,
      message: 'Human approval recorded'
    });
  } catch (error) {
    logger.error('Failed to record human approval:', error);
    res.status(500).json({ error: 'Failed to record human approval' });
  }
});

// Get system adaptations history (admin only)
router.get('/adaptations/history', authenticateAdminKey, async (req, res) => {
  try {
    const adaptations = humanLoopService.getAdaptations();
    
    res.json({
      success: true,
      adaptations,
      total: adaptations.length
    });
  } catch (error) {
    logger.error('Failed to get adaptations history:', error);
    res.status(500).json({ error: 'Failed to get adaptations history' });
  }
});

// Add non-negotiable rule (admin only)
router.post('/human-loop/rules', authenticateAdminKey, async (req, res) => {
  try {
    const { rule } = req.body;
    
    humanLoopService.addNonNegotiableRule(rule);
    
    res.json({
      success: true,
      message: 'Non-negotiable rule added'
    });
  } catch (error) {
    logger.error('Failed to add non-negotiable rule:', error);
    res.status(500).json({ error: 'Failed to add non-negotiable rule' });
  }
});

// Get adaptation statistics (admin only)
router.get('/stats', authenticateAdminKey, async (req, res) => {
  try {
    const humanLoopStats = humanLoopService.getAdaptationStats();
    const userAdaptationStats = userAdaptationService.getAdaptationStats();
    
    res.json({
      success: true,
      stats: {
        humanLoop: humanLoopStats,
        userAdaptation: userAdaptationStats
      }
    });
  } catch (error) {
    logger.error('Failed to get adaptation statistics:', error);
    res.status(500).json({ error: 'Failed to get adaptation statistics' });
  }
});

export default router;
