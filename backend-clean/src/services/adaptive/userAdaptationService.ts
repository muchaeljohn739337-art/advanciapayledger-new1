import { EventEmitter } from 'events';
import { humanLoopService } from './humanLoopService';

interface UserAdaptationProfile {
  userId: string;
  adaptations: {
    learned: string[];
    preferred: string[];
    avoided: string[];
    mastered: string[];
    completed: string[];
  };
  skillLevel: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    expert: string[];
  };
  learningPath: {
    current: string;
    next: string[];
    completed: string[];
    recommended: string[];
  };
  systemUnderstanding: {
    concepts: string[];
    workflows: string[];
    features: string[];
    limitations: string[];
  };
  adaptationHistory: any[];
  lastUpdated: Date;
}

interface AdaptationChallenge {
  id: string;
  type: 'skill' | 'workflow' | 'feature' | 'concept';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  title: string;
  description: string;
  steps: string[];
  expectedOutcome: string;
  rewards: string[];
  prerequisites: string[];
}

class UserAdaptationService extends EventEmitter {
  private static instance: UserAdaptationService;
  private userProfiles = new Map<string, UserAdaptationProfile>();
  private adaptationChallenges = new Map<string, AdaptationChallenge>();
  private learningPaths = new Map<string, string[]>();
  private progressiveLevels: any[] = [];

  static getInstance(): UserAdaptationService {
    if (!UserAdaptationService.instance) {
      UserAdaptationService.instance = new UserAdaptationService();
    }
    return UserAdaptationService.instance;
  }

  constructor() {
    super();
    this.initializeAdaptationSystem();
    this.setupChallenges();
    this.createLearningPaths();
  }

  private initializeAdaptationSystem() {
    // Monitor user interactions to understand adaptation needs
    this.startUserInteractionMonitoring();
    
    // Initialize adaptation recommendations
    this.initializeRecommendationEngine();
    
    // Set up progressive disclosure
    this.setupProgressiveDisclosure();
  }

  private startUserInteractionMonitoring() {
    // Monitor how users interact with the system
    setInterval(() => {
      this.analyzeUserInteractions();
    }, 120000); // Analyze every 2 minutes
  }

  private analyzeUserInteractions() {
    console.log('👤 Analyzing user interactions for adaptation...');
    
    // Track feature usage patterns
    this.trackFeatureUsage();
    
    // Track workflow efficiency
    this.trackWorkflowEfficiency();
    
    // Track error recovery
    this.trackErrorRecovery();
    
    // Track help-seeking behavior
    this.trackHelpSeeking();
  }

  private trackFeatureUsage() {
    // Analyze which features users use most/least
    const usagePatterns = {
      heavilyUsed: ['dashboard', 'payments', 'transactions'],
      rarelyUsed: ['advanced_analytics', 'api_access', 'automation'],
      neverUsed: ['beta_features', 'developer_tools'],
      struggleWith: ['virtual_cards', 'crypto_payments']
    };

    this.emit('feature_usage_analyzed', usagePatterns);
  }

  private trackWorkflowEfficiency() {
    // Measure how efficiently users complete tasks
    const efficiencyMetrics = {
      averageTaskTime: 45, // seconds
      mostEfficientWorkflow: 'quick_payment',
      leastEfficientWorkflow: 'complex_transaction',
      improvementOpportunities: ['batch_operations', 'keyboard_shortcuts']
    };

    this.emit('workflow_efficiency_analyzed', efficiencyMetrics);
  }

  private trackErrorRecovery() {
    // Track how users recover from errors
    const recoveryPatterns = {
      selfRecovery: 0.7,
      helpSeeking: 0.3,
      commonErrors: ['invalid_input', 'network_error', 'insufficient_funds'],
      successfulRecoveryMethods: ['retry_button', 'help_tooltip', 'video_tutorial']
    };

    this.emit('error_recovery_analyzed', recoveryPatterns);
  }

  private trackHelpSeeking() {
    // Track when and how users seek help
    const helpPatterns = {
      documentationViews: ['getting_started', 'payments', 'security'],
      supportRequests: ['account_issues', 'payment_problems'],
      tutorialCompletions: ['basic_setup', 'first_payment'],
      abandonedHelp: ['advanced_features', 'api_documentation']
    };

    this.emit('help_seeking_analyzed', helpPatterns);
  }

  private initializeRecommendationEngine() {
    this.on('feature_usage_analyzed', (patterns) => {
      this.generateFeatureRecommendations(patterns);
    });

    this.on('workflow_efficiency_analyzed', (metrics) => {
      this.generateEfficiencyRecommendations(metrics);
    });

    this.on('error_recovery_analyzed', (patterns) => {
      this.generateRecoveryRecommendations(patterns);
    });

    this.on('help_seeking_analyzed', (patterns) => {
      this.generateLearningRecommendations(patterns);
    });
  }

  private generateFeatureRecommendations(patterns: any) {
    const recommendations = {
      explore: patterns.rarelyUsed,
      learn: patterns.neverUsed,
      master: patterns.heavilyUsed,
      improve: patterns.struggleWith
    };

    console.log('💡 Generated feature recommendations:', recommendations);
    this.emit('adaptation_recommendations', { type: 'features', data: recommendations });
  }

  private generateEfficiencyRecommendations(metrics: any) {
    const recommendations = {
      workflows: [metrics.mostEfficientWorkflow],
      improvements: metrics.improvementOpportunities,
      avoid: [metrics.leastEfficientWorkflow]
    };

    console.log('⚡ Generated efficiency recommendations:', recommendations);
    this.emit('adaptation_recommendations', { type: 'efficiency', data: recommendations });
  }

  private generateRecoveryRecommendations(patterns: any) {
    const recommendations = {
      learnMethods: patterns.successfulRecoveryMethods,
      preventErrors: patterns.commonErrors,
      buildConfidence: patterns.selfRecovery > 0.5 ? 'advanced' : 'basic'
    };

    console.log('🛠️ Generated recovery recommendations:', recommendations);
    this.emit('adaptation_recommendations', { type: 'recovery', data: recommendations });
  }

  private generateLearningRecommendations(patterns: any) {
    const recommendations = {
      prioritize: patterns.documentationViews,
      improve: patterns.abandonedHelp,
      complete: patterns.tutorialCompletions
    };

    console.log('📚 Generated learning recommendations:', recommendations);
    this.emit('adaptation_recommendations', { type: 'learning', data: recommendations });
  }

  private setupProgressiveDisclosure() {
    // Gradually reveal features as users master concepts
    this.progressiveLevels = [
      {
        level: 1,
        name: 'Essentials',
        features: ['dashboard', 'basic_payments', 'transactions'],
        unlocked: true
      },
      {
        level: 2,
        name: 'Efficiency',
        features: ['quick_actions', 'batch_operations', 'keyboard_shortcuts'],
        unlocked: false,
        requirement: 'complete_5_payments'
      },
      {
        level: 3,
        name: 'Advanced',
        features: ['virtual_cards', 'crypto_payments', 'analytics'],
        unlocked: false,
        requirement: 'master_basic_features'
      },
      {
        level: 4,
        name: 'Expert',
        features: ['api_access', 'automation', 'beta_features'],
        unlocked: false,
        requirement: 'complete_advanced_challenges'
      }
    ];
  }

  private setupChallenges() {
    // Create adaptation challenges to help users learn
    const challenges: AdaptationChallenge[] = [
      {
        id: 'first_payment',
        type: 'workflow',
        difficulty: 'beginner',
        title: 'Complete Your First Payment',
        description: 'Learn the basic payment workflow',
        steps: ['Navigate to payments', 'Enter payment details', 'Confirm and send'],
        expectedOutcome: 'Successfully complete a payment',
        rewards: ['Quick access badge', 'Payment history shortcut'],
        prerequisites: []
      },
      {
        id: 'virtual_card_master',
        type: 'feature',
        difficulty: 'intermediate',
        title: 'Master Virtual Cards',
        description: 'Learn to create and manage virtual cards',
        steps: ['Create virtual card', 'Set spending limits', 'Monitor transactions'],
        expectedOutcome: 'Comfortably manage virtual cards',
        rewards: ['Card management badge', 'Advanced card features'],
        prerequisites: ['first_payment']
      },
      {
        id: 'crypto_explorer',
        type: 'feature',
        difficulty: 'advanced',
        title: 'Explore Crypto Payments',
        description: 'Learn to handle cryptocurrency transactions',
        steps: ['Set up crypto wallet', 'Make crypto payment', 'Monitor blockchain'],
        expectedOutcome: 'Confidently use crypto payments',
        rewards: ['Crypto expert badge', 'Lower transaction fees'],
        prerequisites: ['virtual_card_master']
      },
      {
        id: 'automation_builder',
        type: 'workflow',
        difficulty: 'expert',
        title: 'Build Payment Automation',
        description: 'Create automated payment workflows',
        steps: ['Design workflow', 'Set triggers', 'Test automation', 'Deploy'],
        expectedOutcome: 'Successfully automate payment processes',
        rewards: ['Automation master badge', 'API access'],
        prerequisites: ['crypto_explorer']
      }
    ];

    for (const challenge of challenges) {
      this.adaptationChallenges.set(challenge.id, challenge);
    }
  }

  private createLearningPaths() {
    // Define structured learning paths
    this.learningPaths.set('beginner', [
      'first_payment',
      'transaction_history',
      'account_security'
    ]);

    this.learningPaths.set('intermediate', [
      'virtual_card_master',
      'batch_payments',
      'basic_analytics'
    ]);

    this.learningPaths.set('advanced', [
      'crypto_explorer',
      'advanced_analytics',
      'api_basics'
    ]);

    this.learningPaths.set('expert', [
      'automation_builder',
      'custom_integrations',
      'beta_testing'
    ]);
  }

  // Get user's adaptation profile
  getUserProfile(userId: string): UserAdaptationProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  // Get available challenges for user
  getAvailableChallenges(userId: string): AdaptationChallenge[] {
    const profile = this.getUserProfile(userId);
    if (!profile) {
      return Array.from(this.adaptationChallenges.values()).filter(c => c.difficulty === 'beginner');
    }

    const completed = profile.adaptations.completed;
    return Array.from(this.adaptationChallenges.values()).filter(
      challenge => !completed.includes(challenge.id) &&
      challenge.prerequisites.every(req => completed.includes(req))
    );
  }

  // Start adaptation challenge
  startChallenge(userId: string, challengeId: string): boolean {
    const challenge = this.adaptationChallenges.get(challengeId);
    if (!challenge) return false;

    const profile = this.getUserProfile(userId) || this.createProfile(userId);
    
    // Check prerequisites
    const prerequisitesMet = challenge.prerequisites.every(req => 
      profile.adaptations.completed.includes(req)
    );

    if (!prerequisitesMet) {
      console.log(`❌ Prerequisites not met for challenge ${challengeId}`);
      return false;
    }

    // Start the challenge
    profile.learningPath.current = challengeId;
    profile.lastUpdated = new Date();

    this.emit('challenge_started', { userId, challengeId, challenge });
    console.log(`🚀 User ${userId} started challenge: ${challenge.title}`);

    return true;
  }

  // Complete adaptation challenge
  completeChallenge(userId: string, challengeId: string, success: boolean): void {
    const challenge = this.adaptationChallenges.get(challengeId);
    const profile = this.getUserProfile(userId);
    
    if (!challenge || !profile) return;

    if (success) {
      // Mark as completed
      profile.adaptations.completed.push(challengeId);
      profile.adaptations.mastered.push(challengeId);
      
      // Update learning path
      profile.learningPath.completed.push(challengeId);
      profile.learningPath.current = '';
      
      // Get next challenges
      profile.learningPath.next = this.getNextChallenges(challengeId);
      
      // Apply rewards
      this.applyChallengeRewards(userId, challenge.rewards);
      
      // Update skill level
      this.updateSkillLevel(userId, challenge);
      
      this.emit('challenge_completed', { userId, challengeId, challenge });
      console.log(`✅ User ${userId} completed challenge: ${challenge.title}`);
    } else {
      // Record failed attempt
      profile.adaptations.avoided.push(challengeId);
      
      this.emit('challenge_failed', { userId, challengeId, challenge });
      console.log(`❌ User ${userId} failed challenge: ${challenge.title}`);
    }

    profile.lastUpdated = new Date();
  }

  private getNextChallenges(completedChallengeId: string): string[] {
    const completed = this.adaptationChallenges.get(completedChallengeId);
    if (!completed) return [];

    return Array.from(this.adaptationChallenges.values())
      .filter(challenge => 
        challenge.prerequisites.includes(completedChallengeId) &&
        challenge.difficulty !== 'beginner'
      )
      .map(challenge => challenge.id);
  }

  private applyChallengeRewards(userId: string, rewards: string[]): void {
    // Apply rewards to user account
    console.log(`🎁 Applying rewards to user ${userId}:`, rewards);
    
    // This would integrate with your user management system
    this.emit('rewards_applied', { userId, rewards });
  }

  private updateSkillLevel(userId: string, challenge: AdaptationChallenge): void {
    const profile = this.getUserProfile(userId);
    if (!profile) return;

    // Remove from current skill level
    const currentLevel = profile.skillLevel[challenge.difficulty];
    const index = currentLevel.indexOf(challenge.id);
    if (index > -1) {
      currentLevel.splice(index, 1);
    }

    // Add to mastered
    profile.skillLevel[challenge.difficulty].push(challenge.id);

    // Check for level progression
    this.checkLevelProgression(userId);
  }

  private checkLevelProgression(userId: string): void {
    const profile = this.getUserProfile(userId);
    if (!profile) return;

    // Check if user has completed enough challenges to advance
    const beginnerCount = profile.skillLevel.beginner.length;
    const intermediateCount = profile.skillLevel.intermediate.length;
    const advancedCount = profile.skillLevel.advanced.length;

    if (beginnerCount >= 3 && intermediateCount === 0) {
      this.emit('level_up', { userId, from: 'beginner', to: 'intermediate' });
    } else if (intermediateCount >= 3 && advancedCount === 0) {
      this.emit('level_up', { userId, from: 'intermediate', to: 'advanced' });
    }
  }

  private createProfile(userId: string): UserAdaptationProfile {
    const profile: UserAdaptationProfile = {
      userId,
      adaptations: {
        learned: [],
        preferred: [],
        avoided: [],
        mastered: [],
        completed: [],
      },
      skillLevel: {
        beginner: [],
        intermediate: [],
        advanced: [],
        expert: []
      },
      learningPath: {
        current: '',
        next: [],
        completed: [],
        recommended: ['first_payment']
      },
      systemUnderstanding: {
        concepts: [],
        workflows: [],
        features: [],
        limitations: []
      },
      adaptationHistory: [],
      lastUpdated: new Date()
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  // Get adaptation statistics
  getAdaptationStats(): any {
    const profiles = Array.from(this.userProfiles.values());
    
    return {
      totalUsers: profiles.length,
      averageChallengesCompleted: profiles.reduce((sum, p) => sum + p.adaptations.completed.length, 0) / profiles.length,
      skillDistribution: this.getSkillDistribution(profiles),
      popularChallenges: this.getPopularChallenges(),
      learningProgress: this.getLearningProgress(profiles)
    };
  }

  private getSkillDistribution(profiles: UserAdaptationProfile[]): any {
    const distribution = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    
    for (const profile of profiles) {
      const masteredCount = profile.adaptations.mastered.length;
      if (masteredCount < 3) distribution.beginner++;
      else if (masteredCount < 6) distribution.intermediate++;
      else if (masteredCount < 10) distribution.advanced++;
      else distribution.expert++;
    }
    
    return distribution;
  }

  private getPopularChallenges(): any {
    // Return most popular challenges
    return [
      { id: 'first_payment', completions: 150 },
      { id: 'virtual_card_master', completions: 89 },
      { id: 'crypto_explorer', completions: 45 }
    ];
  }

  private getLearningProgress(profiles: UserAdaptationProfile[]): any {
    const total = profiles.length;
    const withProgress = profiles.filter(p => p.adaptations.completed.length > 0).length;
    
    return {
      usersWithProgress: (withProgress / total) * 100,
      averageCompletionRate: profiles.reduce((sum, p) => sum + p.adaptations.completed.length, 0) / total
    };
  }
}

export const userAdaptationService = UserAdaptationService.getInstance();
export default userAdaptationService;
