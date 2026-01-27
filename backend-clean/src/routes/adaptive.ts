import { Router } from 'express';
import { humanLoopService } from '../services/adaptive/humanLoopService';
import { userAdaptationService } from '../services/adaptive/userAdaptationService';

const router = Router();

// Get human loop status
router.get('/human-loop/status', async (req, res) => {
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
    console.error('Failed to get human loop status:', error);
    res.status(500).json({ error: 'Failed to get human loop status' });
  }
});

// Get user adaptations
router.get('/user/:userId/adaptations', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = userAdaptationService.getUserProfile(userId);
    const challenges = userAdaptationService.getAvailableChallenges(userId);
    
    res.json({
      success: true,
      profile,
      availableChallenges: challenges
    });
  } catch (error) {
    console.error('Failed to get user adaptations:', error);
    res.status(500).json({ error: 'Failed to get user adaptations' });
  }
});

// Start adaptation challenge
router.post('/user/:userId/challenges/:challengeId/start', async (req, res) => {
  try {
    const { userId, challengeId } = req.params;
    
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
    console.error('Failed to start challenge:', error);
    res.status(500).json({ error: 'Failed to start challenge' });
  }
});

// Complete adaptation challenge
router.post('/user/:userId/challenges/:challengeId/complete', async (req, res) => {
  try {
    const { userId, challengeId } = req.params;
    const { success } = req.body;
    
    userAdaptationService.completeChallenge(userId, challengeId, success);
    
    res.json({
      success: true,
      message: 'Challenge completion recorded'
    });
  } catch (error) {
    console.error('Failed to complete challenge:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

// Get adaptation recommendations
router.get('/user/:userId/recommendations', async (req, res) => {
  try {
    const { userId } = req.params;
    
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
    console.error('Failed to get recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Submit human approval for system adaptation
router.post('/human-loop/approve', async (req, res) => {
  try {
    const { adaptationId, decision, reason } = req.body;
    
    // Process human approval decision
    console.log(`👤 Human approval received: ${decision} for adaptation ${adaptationId}`);
    
    res.json({
      success: true,
      message: 'Human approval recorded'
    });
  } catch (error) {
    console.error('Failed to record human approval:', error);
    res.status(500).json({ error: 'Failed to record human approval' });
  }
});

// Get system adaptations history
router.get('/adaptations/history', async (req, res) => {
  try {
    const adaptations = humanLoopService.getAdaptations();
    
    res.json({
      success: true,
      adaptations,
      total: adaptations.length
    });
  } catch (error) {
    console.error('Failed to get adaptations history:', error);
    res.status(500).json({ error: 'Failed to get adaptations history' });
  }
});

// Add non-negotiable rule
router.post('/human-loop/rules', async (req, res) => {
  try {
    const { rule } = req.body;
    
    humanLoopService.addNonNegotiableRule(rule);
    
    res.json({
      success: true,
      message: 'Non-negotiable rule added'
    });
  } catch (error) {
    console.error('Failed to add non-negotiable rule:', error);
    res.status(500).json({ error: 'Failed to add non-negotiable rule' });
  }
});

// Get adaptation statistics
router.get('/stats', async (req, res) => {
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
    console.error('Failed to get adaptation statistics:', error);
    res.status(500).json({ error: 'Failed to get adaptation statistics' });
  }
});

export default router;
