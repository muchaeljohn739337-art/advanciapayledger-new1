'use client';

import { useState, useEffect } from 'react';
import { Brain, User, Target, TrendingUp, Award, Settings, Shield } from 'lucide-react';

interface UserAdaptationProfile {
  userId: string;
  adaptations: {
    learned: string[];
    preferred: string[];
    avoided: string[];
    mastered: string[];
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

export function AdaptiveDashboard() {
  const [profile, setProfile] = useState<UserAdaptationProfile | null>(null);
  const [challenges, setChallenges] = useState<AdaptationChallenge[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'recommendations' | 'settings'>('overview');

  useEffect(() => {
    fetchAdaptiveData();
  }, []);

  const fetchAdaptiveData = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const profileResponse = await fetch('/api/adaptive/user/current-user/adaptations');
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        setProfile(profileData.profile);
        setChallenges(profileData.availableChallenges);
      }
      
      // Get recommendations
      const recommendationsResponse = await fetch('/api/adaptive/user/current-user/recommendations');
      const recommendationsData = await recommendationsResponse.json();
      
      if (recommendationsData.success) {
        setRecommendations(recommendationsData.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch adaptive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/adaptive/user/current-user/challenges/${challengeId}/start`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchAdaptiveData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to start challenge:', error);
    }
  };

  const completeChallenge = async (challengeId: string, success: boolean) => {
    try {
      const response = await fetch(`/api/adaptive/user/current-user/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchAdaptiveData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to complete challenge:', error);
    }
  };

  const getSkillLevel = () => {
    if (!profile) return 'Beginner';
    
    const mastered = profile.adaptations.mastered.length;
    if (mastered >= 10) return 'Expert';
    if (mastered >= 6) return 'Advanced';
    if (mastered >= 3) return 'Intermediate';
    return 'Beginner';
  };

  const getProgressPercentage = () => {
    if (!profile) return 0;
    
    const totalPossible = 12; // Approximate total challenges
    return Math.round((profile.learningPath.completed.length / totalPossible) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Adaptive Learning Center</h1>
        <p className="text-gray-600">The system adapts to you, then you adapt to the system</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Brain },
            { id: 'challenges', label: 'Challenges', icon: Target },
            { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skill Level Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Award className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Skill Level</h3>
                <p className="text-2xl font-bold text-gray-900">{getSkillLevel()}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{getProgressPercentage()}% Complete</p>
          </div>

          {/* Completed Challenges */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Target className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Challenges</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.learningPath.completed.length || 0}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Completed challenges</p>
          </div>

          {/* Learning Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Learning Path</h3>
                <p className="text-lg font-bold text-gray-900">
                  {profile?.learningPath.current ? 'In Progress' : 'Ready to Start'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {profile?.learningPath.next.length || 0} challenges available
            </p>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile?.adaptations.mastered.slice(-3).map((achievement, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{challenge.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  challenge.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Steps:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  {challenge.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Rewards:</h4>
                <div className="flex flex-wrap gap-2">
                  {challenge.rewards.map((reward, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {reward}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => startChallenge(challenge.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Challenge
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations && Object.entries(recommendations).map(([category, items]: [string, any]) => (
            <div key={category} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
              <ul className="space-y-2">
                {items.map((item: string, index: number) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {item.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Adaptive Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Adaptive Learning</h4>
                <p className="text-sm text-gray-600">Allow the system to adapt to your behavior</p>
              </div>
              <button className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                <span className="translate-x-6 inline-block w-4 h-4 transform bg-white rounded-full transition"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Show Recommendations</h4>
                <p className="text-sm text-gray-600">Display personalized recommendations</p>
              </div>
              <button className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                <span className="translate-x-6 inline-block w-4 h-4 transform bg-white rounded-full transition"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Progressive Disclosure</h4>
                <p className="text-sm text-gray-600">Gradually reveal advanced features</p>
              </div>
              <button className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                <span className="translate-x-6 inline-block w-4 h-4 transform bg-white rounded-full transition"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Human-in-the-Loop</h4>
                <p className="text-sm text-gray-600">Require human approval for critical changes</p>
              </div>
              <button className="relative inline-flex items-center h-6 rounded-full w-11 bg-blue-600">
                <span className="translate-x-6 inline-block w-4 h-4 transform bg-white rounded-full transition"></span>
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium mb-2">Non-Negotiable Rules</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 text-red-500 mr-2" />
                Security never compromised
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 text-red-500 mr-2" />
                Data privacy always respected
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 text-red-500 mr-2" />
                User consent required
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 text-red-500 mr-2" />
                Transparency mandatory
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-4 h-4 text-red-500 mr-2" />
                Human oversight required
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
