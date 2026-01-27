import { Router } from 'express';
import { beginnerChallengesService } from '../../services/onboarding/beginnerChallenges';

const router = Router();

// Get available challenges for user
router.get('/available/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const challenges = beginnerChallengesService.getAvailableChallenges(userId);
    
    res.json({
      success: true,
      challenges,
      total: challenges.length
    });
  } catch (error) {
    console.error('Failed to get available challenges:', error);
    res.status(500).json({ error: 'Failed to get available challenges' });
  }
});

// Get user progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = beginnerChallengesService.getUserProgress(userId);
    
    res.json({
      success: true,
      progress,
      total: progress.length
    });
  } catch (error) {
    console.error('Failed to get user progress:', error);
    res.status(500).json({ error: 'Failed to get user progress' });
  }
});

// Start challenge
router.post('/start', async (req, res) => {
  try {
    const { userId, challengeId } = req.body;
    
    if (!userId || !challengeId) {
      return res.status(400).json({ error: 'userId and challengeId are required' });
    }
    
    const success = beginnerChallengesService.startChallenge(userId, challengeId);
    
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

// Update challenge progress
router.post('/progress', async (req, res) => {
  try {
    const { userId, challengeId, step } = req.body;
    
    if (!userId || !challengeId || !step) {
      return res.status(400).json({ error: 'userId, challengeId, and step are required' });
    }
    
    beginnerChallengesService.updateChallengeProgress(userId, challengeId, step);
    
    res.json({
      success: true,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Failed to update progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Request help
router.post('/help', async (req, res) => {
  try {
    const { userId, challengeId } = req.body;
    
    if (!userId || !challengeId) {
      return res.status(400).json({ error: 'userId and challengeId are required' });
    }
    
    const hint = beginnerChallengesService.requestHelp(userId, challengeId);
    
    res.json({
      success: true,
      hint
    });
  } catch (error) {
    console.error('Failed to get help:', error);
    res.status(500).json({ error: 'Failed to get help' });
  }
});

// Get next recommended challenge
router.get('/next/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const challenge = beginnerChallengesService.getNextRecommendedChallenge(userId);
    
    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Failed to get next challenge:', error);
    res.status(500).json({ error: 'Failed to get next challenge' });
  }
});

// Get tutorial
router.get('/tutorial/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const tutorial = beginnerChallengesService.getTutorial(challengeId);
    
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    
    res.json({
      success: true,
      tutorial
    });
  } catch (error) {
    console.error('Failed to get tutorial:', error);
    res.status(500).json({ error: 'Failed to get tutorial' });
  }
});

// Get challenge statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = beginnerChallengesService.getChallengeStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Failed to get challenge stats:', error);
    res.status(500).json({ error: 'Failed to get challenge stats' });
  }
});

export default router;
