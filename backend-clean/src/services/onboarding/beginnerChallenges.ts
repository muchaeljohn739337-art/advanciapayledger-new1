import { EventEmitter } from 'events';
import { userAdaptationService } from '../adaptive/userAdaptationService';
import { multiCryptoService } from '../crypto/multiCryptoService';

interface BeginnerChallenge {
  id: string;
  title: string;
  description: string;
  type: 'crypto' | 'payment' | 'security' | 'adaptive';
  difficulty: 'beginner';
  steps: string[];
  expectedOutcome: string;
  rewards: string[];
  prerequisites: string[];
  estimatedTime: number;
  tutorialAvailable: boolean;
}

interface ChallengeProgress {
  userId: string;
  challengeId: string;
  currentStep: number;
  completedSteps: string[];
  startTime: Date;
  lastActivity: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  helpRequested: boolean;
  hintsUsed: number;
}

class BeginnerChallengesService extends EventEmitter {
  private static instance: BeginnerChallengesService;
  private challenges = new Map<string, BeginnerChallenge>();
  private progress = new Map<string, ChallengeProgress>();

  static getInstance(): BeginnerChallengesService {
    if (!BeginnerChallengesService.instance) {
      BeginnerChallengesService.instance = new BeginnerChallengesService();
    }
    return BeginnerChallengesService.instance;
  }

  constructor() {
    super();
    this.initializeChallenges();
    this.setupEventListeners();
  }

  private initializeChallenges() {
    const challenges: BeginnerChallenge[] = [
      // Crypto Basics
      {
        id: 'crypto_first_deposit',
        title: 'Make Your First Crypto Deposit',
        description: 'Learn how to deposit cryptocurrency into your wallet',
        type: 'crypto',
        difficulty: 'beginner',
        steps: [
          'Navigate to Multi-Crypto section',
          'Select Bitcoin (BTC) as currency',
          'Enter deposit amount (minimum 0.0001 BTC)',
          'Generate deposit address',
          'Copy address and complete deposit'
        ],
        expectedOutcome: 'Successfully initiate a Bitcoin deposit',
        rewards: ['Bitcoin Badge', 'Crypto Explorer', 'Lower deposit fees'],
        prerequisites: [],
        estimatedTime: 15,
        tutorialAvailable: true
      },
      {
        id: 'crypto_explore_currencies',
        title: 'Explore Different Cryptocurrencies',
        description: 'Discover the various cryptocurrencies supported on the platform',
        type: 'crypto',
        difficulty: 'beginner',
        steps: [
          'Go to Multi-Crypto dashboard',
          'Review all supported currencies',
          'Check exchange rates for 3 different pairs',
          'View transaction limits and fees',
          'Identify the most stable currency'
        ],
        expectedOutcome: 'Understand the available cryptocurrency options',
        rewards: ['Explorer Badge', 'Market Insights', 'Advanced charts'],
        prerequisites: [],
        estimatedTime: 10,
        tutorialAvailable: true
      },
      {
        id: 'crypto_first_exchange',
        title: 'Perform Your First Crypto Exchange',
        description: 'Exchange one cryptocurrency for another',
        type: 'crypto',
        difficulty: 'beginner',
        steps: [
          'Navigate to Exchange tab',
          'Select BTC as source currency',
          'Select USDT as target currency',
          'Enter exchange amount (0.001 BTC)',
          'Review exchange rate and fees',
          'Confirm and complete exchange'
        ],
        expectedOutcome: 'Successfully exchange BTC for USDT',
        rewards: ['Trader Badge', 'Exchange Priority', 'Reduced fees'],
        prerequisites: ['crypto_first_deposit'],
        estimatedTime: 20,
        tutorialAvailable: true
      },
      
      // Payment System
      {
        id: 'payment_setup_wallet',
        title: 'Set Up Your Payment Wallet',
        description: 'Configure your wallet for seamless payments',
        type: 'payment',
        difficulty: 'beginner',
        steps: [
          'Go to Wallet section',
          'Verify your identity',
          'Set up spending limits',
          'Enable two-factor authentication',
          'Test wallet with small transaction'
        ],
        expectedOutcome: 'Fully configured and secure payment wallet',
        rewards: ['Wallet Master Badge', 'Higher limits', 'Priority support'],
        prerequisites: [],
        estimatedTime: 25,
        tutorialAvailable: true
      },
      {
        id: 'payment_first_transaction',
        title: 'Complete Your First Payment',
        description: 'Send your first payment using the platform',
        type: 'payment',
        difficulty: 'beginner',
        steps: [
          'Navigate to Payments section',
          'Select payment method',
          'Enter recipient details',
          'Set payment amount',
          'Add description (optional)',
          'Confirm and send payment'
        ],
        expectedOutcome: 'Successfully send a payment',
        rewards: ['Payment Pro Badge', 'Transaction history', 'Quick send feature'],
        prerequisites: ['payment_setup_wallet'],
        estimatedTime: 15,
        tutorialAvailable: true
      },
      
      // Security
      {
        id: 'security_setup_2fa',
        title: 'Enable Two-Factor Authentication',
        description: 'Secure your account with 2FA',
        type: 'security',
        difficulty: 'beginner',
        steps: [
          'Go to Security Settings',
          'Select 2FA method (SMS/Authenticator)',
          'Scan QR code with authenticator app',
          'Enter verification code',
          'Save backup codes',
          'Test 2FA login'
        ],
        expectedOutcome: 'Account secured with two-factor authentication',
        rewards: ['Security Guardian Badge', 'Backup codes access', 'Security alerts'],
        prerequisites: [],
        estimatedTime: 10,
        tutorialAvailable: true
      },
      {
        id: 'security_review_permissions',
        title: 'Review Account Permissions',
        description: 'Understand and manage your account permissions',
        type: 'security',
        difficulty: 'beginner',
        steps: [
          'Navigate to Account Settings',
          'Review current permissions',
          'Understand permission levels',
          'Adjust notification preferences',
          'Set up privacy controls',
          'Review connected devices'
        ],
        expectedOutcome: 'Optimized account security and privacy settings',
        rewards: ['Privacy Pro Badge', 'Advanced controls', 'Security reports'],
        prerequisites: ['security_setup_2fa'],
        estimatedTime: 15,
        tutorialAvailable: true
      },
      
      // Adaptive Learning
      {
        id: 'adaptive_complete_profile',
        title: 'Complete Your Learning Profile',
        description: 'Set up your personalized learning journey',
        type: 'adaptive',
        difficulty: 'beginner',
        steps: [
          'Go to Adaptive Learning section',
          'Complete skill assessment',
          'Set learning preferences',
          'Choose learning goals',
          'Enable progress tracking',
          'Review recommended challenges'
        ],
        expectedOutcome: 'Personalized learning profile created',
        rewards: ['Learner Badge', 'Personalized path', 'Progress insights'],
        prerequisites: [],
        estimatedTime: 20,
        tutorialAvailable: true
      },
      {
        id: 'adaptive_first_challenge',
        title: 'Complete Your First Learning Challenge',
        description: 'Experience the adaptive learning system',
        type: 'adaptive',
        difficulty: 'beginner',
        steps: [
          'Select a beginner challenge',
          'Review challenge requirements',
          'Follow step-by-step guidance',
          'Use hints if needed',
          'Complete challenge successfully',
          'Review your progress'
        ],
        expectedOutcome: 'Successfully complete first adaptive challenge',
        rewards: ['Achievement Badge', 'Next challenge unlocked', 'Learning streak'],
        prerequisites: ['adaptive_complete_profile'],
        estimatedTime: 30,
        tutorialAvailable: true
      }
    ];

    for (const challenge of challenges) {
      this.challenges.set(challenge.id, challenge);
    }
  }

  private setupEventListeners() {
    // Listen to crypto events to track progress
    multiCryptoService.on('deposit_initiated', (transaction) => {
      this.updateChallengeProgress(transaction.userId, 'crypto_first_deposit', 'deposit_initiated');
    });

    multiCryptoService.on('exchange_initiated', (transaction) => {
      this.updateChallengeProgress(transaction.userId, 'crypto_first_exchange', 'exchange_initiated');
    });

    // Listen to adaptive learning events
    userAdaptationService.on('challenge_completed', (data) => {
      this.updateChallengeProgress(data.userId, data.challengeId, 'completed');
    });
  }

  // Get available challenges for user
  getAvailableChallenges(userId: string): BeginnerChallenge[] {
    const userProgress = this.getUserProgress(userId);
    const completedChallenges = userProgress.filter(p => p.status === 'completed').map(p => p.challengeId);
    
    return Array.from(this.challenges.values()).filter(challenge => {
      // Don't show already completed challenges
      if (completedChallenges.includes(challenge.id)) return false;
      
      // Check prerequisites
      return challenge.prerequisites.every(prereq => completedChallenges.includes(prereq));
    });
  }

  // Get user progress
  getUserProgress(userId: string): ChallengeProgress[] {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  // Start challenge
  startChallenge(userId: string, challengeId: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;

    const progress: ChallengeProgress = {
      userId,
      challengeId,
      currentStep: 0,
      completedSteps: [],
      startTime: new Date(),
      lastActivity: new Date(),
      status: 'in_progress',
      helpRequested: false,
      hintsUsed: 0
    };

    this.progress.set(`${userId}-${challengeId}`, progress);
    
    // Start the challenge in adaptive service
    userAdaptationService.startChallenge(userId, challengeId);
    
    this.emit('challenge_started', { userId, challengeId, challenge });
    console.log(`🎯 Beginner challenge started: ${challenge.title}`);
    
    return true;
  }

  // Update challenge progress
  updateChallengeProgress(userId: string, challengeId: string, step: string): void {
    const progressKey = `${userId}-${challengeId}`;
    const progress = this.progress.get(progressKey);
    
    if (!progress) return;

    progress.completedSteps.push(step);
    progress.currentStep = progress.completedSteps.length;
    progress.lastActivity = new Date();

    // Check if challenge is completed
    const challenge = this.challenges.get(challengeId);
    if (challenge && progress.completedSteps.length >= challenge.steps.length) {
      progress.status = 'completed';
      this.completeChallenge(userId, challengeId);
    }

    this.emit('progress_updated', { userId, challengeId, step, progress });
  }

  // Complete challenge
  completeChallenge(userId: string, challengeId: string): void {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return;

    const progressKey = `${userId}-${challengeId}`;
    const progress = this.progress.get(progressKey);
    
    if (progress) {
      progress.status = 'completed';
      progress.lastActivity = new Date();
    }

    // Complete in adaptive service
    userAdaptationService.completeChallenge(userId, challengeId, true);
    
    this.emit('challenge_completed', { userId, challengeId, challenge });
    console.log(`✅ Beginner challenge completed: ${challenge.title}`);
  }

  // Request help
  requestHelp(userId: string, challengeId: string): string {
    const challenge = this.challenges.get(challengeId);
    const progress = this.progress.get(`${userId}-${challengeId}`);
    
    if (!challenge || !progress) return 'Challenge not found';

    progress.helpRequested = true;
    progress.hintsUsed++;
    
    // Provide contextual help based on current step
    const currentStepIndex = progress.currentStep;
    const currentStep = challenge.steps[currentStepIndex];
    
    const hints = {
      'crypto_first_deposit': [
        'Look for the Multi-Crypto option in the main menu',
        'Bitcoin is the most popular cryptocurrency for beginners',
        'Start with a small amount to test the process'
      ],
      'crypto_first_exchange': [
        'Make sure you have funds in your wallet first',
        'Check the exchange rate before confirming',
        'Consider the fees when calculating the amount'
      ],
      'payment_setup_wallet': [
        'Identity verification is required for security',
        'Two-factor authentication adds an extra layer of security',
        'Start with lower spending limits as you learn'
      ],
      'security_setup_2fa': [
        'Use Google Authenticator or similar app',
        'Save your backup codes in a safe place',
        'Test 2FA before logging out'
      ]
    };

    const challengeHints = hints[challengeId as keyof typeof hints] || ['Follow the on-screen instructions carefully'];
    const hintIndex = Math.min(progress.hintsUsed - 1, challengeHints.length - 1);
    
    return challengeHints[hintIndex] || 'No more hints available';
  }

  // Get challenge statistics
  getChallengeStats(): any {
    const allProgress = Array.from(this.progress.values());
    const uniqueUsers = new Set(allProgress.map(p => p.userId)).size;
    
    const stats = {
      totalChallenges: this.challenges.size,
      totalUsers: uniqueUsers,
      totalAttempts: allProgress.length,
      completedChallenges: allProgress.filter(p => p.status === 'completed').length,
      inProgressChallenges: allProgress.filter(p => p.status === 'in_progress').length,
      averageCompletionTime: this.calculateAverageCompletionTime(),
      mostPopularChallenges: this.getMostPopularChallenges(),
      challengeTypeDistribution: this.getChallengeTypeDistribution()
    };

    return stats;
  }

  private calculateAverageCompletionTime(): number {
    const completedProgress = Array.from(this.progress.values()).filter(p => p.status === 'completed');
    
    if (completedProgress.length === 0) return 0;
    
    const totalTime = completedProgress.reduce((sum, p) => {
      return sum + (p.lastActivity.getTime() - p.startTime.getTime());
    }, 0);
    
    return Math.round(totalTime / completedProgress.length / 60000); // Convert to minutes
  }

  private getMostPopularChallenges(): any[] {
    const challengeCounts = new Map<string, number>();
    
    for (const progress of this.progress.values()) {
      const count = challengeCounts.get(progress.challengeId) || 0;
      challengeCounts.set(progress.challengeId, count + 1);
    }
    
    return Array.from(challengeCounts.entries())
      .map(([challengeId, count]) => {
        const challenge = this.challenges.get(challengeId);
        return {
          challengeId,
          title: challenge?.title || 'Unknown',
          attempts: count
        };
      })
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 5);
  }

  private getChallengeTypeDistribution(): any {
    const distribution = {
      crypto: 0,
      payment: 0,
      security: 0,
      adaptive: 0
    };

    for (const challenge of this.challenges.values()) {
      distribution[challenge.type as keyof typeof distribution]++;
    }

    return distribution;
  }

  // Get next recommended challenge
  getNextRecommendedChallenge(userId: string): BeginnerChallenge | null {
    const availableChallenges = this.getAvailableChallenges(userId);
    
    if (availableChallenges.length === 0) return null;
    
    // Prioritize crypto and security challenges for beginners
    const priorityOrder = ['security', 'crypto', 'payment', 'adaptive'];
    
    for (const type of priorityOrder) {
      const challenge = availableChallenges.find(c => c.type === type);
      if (challenge) return challenge;
    }
    
    return availableChallenges[0];
  }

  // Get tutorial for challenge
  getTutorial(challengeId: string): any {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || !challenge.tutorialAvailable) return null;

    const tutorials = {
      'crypto_first_deposit': {
        video: 'https://example.com/crypto-deposit-tutorial',
        steps: [
          'Click on Multi-Crypto in the navigation menu',
          'Select Bitcoin from the currency dropdown',
          'Enter the amount you want to deposit',
          'Click "Generate Deposit Address"',
          'Copy the address and use it to send Bitcoin',
          'Wait for confirmations to see the deposit in your account'
        ],
        tips: [
          'Start with a small test amount first',
          'Double-check the address before sending',
          'Bitcoin transactions take 10-30 minutes to confirm'
        ]
      },
      'security_setup_2fa': {
        video: 'https://example.com/2fa-tutorial',
        steps: [
          'Go to Settings > Security',
          'Click "Enable Two-Factor Authentication"',
          'Choose your preferred 2FA method',
          'Follow the setup instructions',
          'Save your backup codes securely',
          'Test the 2FA setup'
        ],
        tips: [
          'Use an authenticator app for better security',
          'Store backup codes offline',
          'Test 2FA before you need it'
        ]
      }
    };

    return tutorials[challengeId as keyof typeof tutorials] || null;
  }
}

export const beginnerChallengesService = BeginnerChallengesService.getInstance();
export default beginnerChallengesService;
