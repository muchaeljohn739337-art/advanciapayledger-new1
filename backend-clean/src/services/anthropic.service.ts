import { logger } from "../lib/logger";
/**
 * Anthropic AI Service - Advancia Pay Ledger
 * 
 * Anthropic Claude integration for advanced AI capabilities
 */

export class AnthropicService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000');
    this.temperature = parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7');

    if (!this.apiKey) {
      logger.info('⚠️ Anthropic Service not configured - missing API key');
    } else {
      logger.info('✅ Anthropic Service initialized with Claude');
    }
  }

  /**
   * Check if Anthropic service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate chat completion using Anthropic Claude
   */
  async generateChatCompletion(messages: Array<{role: string; content: string}>): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Anthropic service not configured');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          messages: messages
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text || '';
    } catch (error: any) {
      logger.error('Anthropic chat completion error:', error);
      throw new Error(`Chat completion failed: ${error.message}`);
    }
  }

  /**
   * Generate text completion
   */
  async generateTextCompletion(prompt: string): Promise<string> {
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.generateChatCompletion(messages);
  }

  /**
   * Analyze transaction for fraud detection
   */
  async analyzeTransaction(transactionData: any): Promise<{
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    analysis: string;
    recommendations: string[];
  }> {
    const prompt = `
    Analyze this financial transaction for fraud detection:

    Transaction Data:
    ${JSON.stringify(transactionData, null, 2)}

    Please provide:
    1. Risk score (0-100)
    2. Risk level (LOW/MEDIUM/HIGH)
    3. Detailed analysis
    4. Recommendations

    Respond in JSON format:
    {
      "riskScore": number,
      "riskLevel": "LOW|MEDIUM|HIGH",
      "analysis": "detailed analysis",
      "recommendations": ["recommendation1", "recommendation2"]
    }
    `;

    try {
      const response = await this.generateTextCompletion(prompt);
      
      // Try to parse JSON response
      try {
        const analysis = JSON.parse(response);
        return analysis;
      } catch {
        // If JSON parsing fails, create a structured response
        return {
          riskScore: 50,
          riskLevel: 'MEDIUM',
          analysis: response,
          recommendations: ['Review transaction manually', 'Verify user identity']
        };
      }
    } catch (error: any) {
      throw new Error(`Transaction analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate customer support response
   */
  async generateSupportResponse(customerMessage: string, category: string = 'general'): Promise<{
    response: string;
    category: string;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    suggestedActions: string[];
  }> {
    const prompt = `
    Generate a professional customer support response for this message:

    Customer Message: "${customerMessage}"
    Category: ${category}

    Please provide:
    1. A helpful, empathetic response
    2. Message category classification
    3. Sentiment analysis
    4. Suggested actions for the support team

    Respond in JSON format:
    {
      "response": "professional response",
      "category": "category",
      "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
      "suggestedActions": ["action1", "action2"]
    }
    `;

    try {
      const response = await this.generateTextCompletion(prompt);
      
      // Try to parse JSON response
      try {
        const supportResponse = JSON.parse(response);
        return supportResponse;
      } catch {
        // If JSON parsing fails, create a structured response
        return {
          response: response,
          category: category,
          sentiment: 'NEUTRAL',
          suggestedActions: ['Review customer request', 'Follow up if needed']
        };
      }
    } catch (error: any) {
      throw new Error(`Support response generation failed: ${error.message}`);
    }
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzeUserBehavior(userActivity: any): Promise<{
    behaviorPattern: string;
    riskIndicators: string[];
    recommendations: string[];
    engagementScore: number;
  }> {
    const prompt = `
    Analyze user behavior patterns based on this activity data:

    User Activity:
    ${JSON.stringify(userActivity, null, 2)}

    Please provide:
    1. Behavior pattern analysis
    2. Risk indicators (if any)
    3. Recommendations for engagement
    4. Engagement score (0-100)

    Respond in JSON format:
    {
      "behaviorPattern": "pattern description",
      "riskIndicators": ["indicator1", "indicator2"],
      "recommendations": ["recommendation1", "recommendation2"],
      "engagementScore": number
    }
    `;

    try {
      const response = await this.generateTextCompletion(prompt);
      
      // Try to parse JSON response
      try {
        const behaviorAnalysis = JSON.parse(response);
        return behaviorAnalysis;
      } catch {
        // If JSON parsing fails, create a structured response
        return {
          behaviorPattern: response,
          riskIndicators: [],
          recommendations: ['Monitor user activity'],
          engagementScore: 75
        };
      }
    } catch (error: any) {
      throw new Error(`User behavior analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate financial insights
   */
  async generateFinancialInsights(financialData: any): Promise<{
    insights: string[];
    trends: string[];
    recommendations: string[];
    riskAssessment: string;
  }> {
    const prompt = `
    Generate financial insights based on this data:

    Financial Data:
    ${JSON.stringify(financialData, null, 2)}

    Please provide:
    1. Key insights
    2. Trend analysis
    3. Recommendations
    4. Risk assessment

    Respond in JSON format:
    {
      "insights": ["insight1", "insight2"],
      "trends": ["trend1", "trend2"],
      "recommendations": ["recommendation1", "recommendation2"],
      "riskAssessment": "risk assessment summary"
    }
    `;

    try {
      const response = await this.generateTextCompletion(prompt);
      
      // Try to parse JSON response
      try {
        const insights = JSON.parse(response);
        return insights;
      } catch {
        // If JSON parsing fails, create a structured response
        return {
          insights: [response],
          trends: ['Analyze trends manually'],
          recommendations: ['Review financial data'],
          riskAssessment: 'Moderate risk'
        };
      }
    } catch (error: any) {
      throw new Error(`Financial insights generation failed: ${error.message}`);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(complianceData: any): Promise<{
    complianceScore: number;
    issues: string[];
    recommendations: string[];
    report: string;
  }> {
    const prompt = `
    Generate a compliance report based on this data:

    Compliance Data:
    ${JSON.stringify(complianceData, null, 2)}

    Please provide:
    1. Compliance score (0-100)
    2. Identified issues
    3. Recommendations
    4. Detailed report

    Respond in JSON format:
    {
      "complianceScore": number,
      "issues": ["issue1", "issue2"],
      "recommendations": ["recommendation1", "recommendation2"],
      "report": "detailed compliance report"
    }
    `;

    try {
      const response = await this.generateTextCompletion(prompt);
      
      // Try to parse JSON response
      try {
        const complianceReport = JSON.parse(response);
        return complianceReport;
      } catch {
        // If JSON parsing fails, create a structured response
        return {
          complianceScore: 85,
          issues: ['Manual review needed'],
          recommendations: ['Review compliance requirements'],
          report: response
        };
      }
    } catch (error: any) {
      throw new Error(`Compliance report generation failed: ${error.message}`);
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    model: string;
    maxTokens: number;
    temperature: number;
    apiKeyLength: number;
  } {
    return {
      configured: this.isConfigured(),
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      apiKeyLength: this.apiKey.length
    };
  }
}

export const anthropicService = new AnthropicService();
