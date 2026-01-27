/**
 * Gradient AI Service - Advancia Pay Ledger
 * 
 * Integration with Gradient AI for:
 * - AI-powered fraud detection
 * - Customer support automation
 * - Transaction analysis
 * - Risk assessment
 */

interface GradientMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GradientResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GradientAIService {
  private apiKey: string;
  private baseUrl: string = 'https://inference.do-ai.run/v1';

  constructor() {
    this.apiKey = process.env.GRADIENT_API_KEY || '';
    if (!this.apiKey) {
      console.log('⚠️ Gradient AI service not configured - missing GRADIENT_API_KEY');
    }
  }

  /**
   * Check if Gradient AI is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Chat completion using Gradient AI
   */
  async chatCompletion(
    messages: GradientMessage[],
    model: string = 'anthropic-claude-sonnet-4',
    maxTokens: number = 1000
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gradient AI not configured. Add GRADIENT_API_KEY to environment variables.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages,
          model,
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Gradient AI API error: ${response.status} ${response.statusText}`);
      }

      const data: GradientResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Gradient AI chat completion error:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }

  /**
   * Analyze transaction for fraud detection
   */
  async analyzeTransaction(transactionData: {
    amount: number;
    currency: string;
    merchant: string;
    userId: string;
    location?: string;
    deviceFingerprint?: string;
  }): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    reasons: string[];
    recommendation: string;
  }> {
    const prompt = `
Analyze this financial transaction for fraud risk:

Transaction Details:
- Amount: ${transactionData.amount} ${transactionData.currency}
- Merchant: ${transactionData.merchant}
- User ID: ${transactionData.userId}
- Location: ${transactionData.location || 'Unknown'}
- Device: ${transactionData.deviceFingerprint || 'Unknown'}

Provide analysis in JSON format:
{
  "riskScore": 0-100,
  "riskLevel": "low|medium|high", 
  "reasons": ["reason1", "reason2"],
  "recommendation": "approve|decline|manual_review"
}

Consider factors like:
- Unusual amount for user history
- High-risk merchant category
- Geographic anomalies
- Device inconsistencies
- Time-based patterns
    `;

    try {
      const response = await this.chatCompletion([
        { role: 'system', content: 'You are a fraud detection expert. Analyze transactions and provide risk assessments.' },
        { role: 'user', content: prompt }
      ]);

      // Parse JSON response
      const analysis = JSON.parse(response);
      return analysis;
    } catch (error) {
      console.error('Transaction analysis error:', error);
      // Return safe default
      return {
        riskScore: 50,
        riskLevel: 'medium',
        reasons: ['Unable to perform AI analysis'],
        recommendation: 'manual_review'
      };
    }
  }

  /**
   * Generate customer support response
   */
  async generateSupportResponse(
    customerMessage: string,
    customerHistory?: string,
    issueType?: string
  ): Promise<{
    response: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    escalation: boolean;
  }> {
    const prompt = `
Customer Message: "${customerMessage}"
Issue Type: ${issueType || 'General'}
Customer History: ${customerHistory || 'New customer'}

Generate a helpful support response. Include:
1. Empathetic acknowledgment
2. Solution or next steps
3. Category classification
4. Priority assessment
5. Escalation recommendation

Respond in JSON format:
{
  "response": "Your response here",
  "category": "billing|technical|general|fraud",
  "priority": "low|medium|high",
  "escalation": true|false
}
    `;

    try {
      const response = await this.chatCompletion([
        { 
          role: 'system', 
          content: 'You are a helpful customer support agent for Advancia Pay Ledger. Provide empathetic, accurate responses.' 
        },
        { role: 'user', content: prompt }
      ]);

      return JSON.parse(response);
    } catch (error) {
      console.error('Support response generation error:', error);
      return {
        response: 'Thank you for contacting Advancia Pay Ledger support. We\'ve received your message and will respond shortly.',
        category: 'general',
        priority: 'medium',
        escalation: false
      };
    }
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzeUserBehavior(userActivities: Array<{
    action: string;
    timestamp: string;
    amount?: number;
    location?: string;
  }>): Promise<{
    behaviorScore: number;
    patterns: string[];
    anomalies: string[];
    recommendations: string[];
  }> {
    const prompt = `
Analyze user behavior patterns from these activities:

${JSON.stringify(userActivities, null, 2)}

Provide analysis in JSON format:
{
  "behaviorScore": 0-100,
  "patterns": ["pattern1", "pattern2"],
  "anomalies": ["anomaly1", "anomaly2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Look for:
- Normal usage patterns
- Unusual activity spikes
- Geographic inconsistencies
- Time-based anomalies
- Amount patterns
    `;

    try {
      const response = await this.chatCompletion([
        { 
          role: 'system', 
          content: 'You are a security analyst specializing in user behavior analysis for financial platforms.' 
        },
        { role: 'user', content: prompt }
      ]);

      return JSON.parse(response);
    } catch (error) {
      console.error('User behavior analysis error:', error);
      return {
        behaviorScore: 50,
        patterns: [],
        anomalies: ['Unable to analyze behavior'],
        recommendations: ['Manual review recommended']
      };
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('Gradient AI not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get models: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Get models error:', error);
      throw new Error(`Failed to get available models: ${error.message}`);
    }
  }
}

export const gradientAIService = new GradientAIService();
