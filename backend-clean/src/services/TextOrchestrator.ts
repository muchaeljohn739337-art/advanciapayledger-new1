import axios from "axios";

interface TextProvider {
  name: string;
  endpoint: string;
  model: string;
  enabled: boolean;
  priority: number;
  costPerToken?: number;
}

interface TextRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

interface TextResponse {
  provider: string;
  response: string;
  tokensUsed?: number;
  cost?: number;
  latency: number;
}

export class TextOrchestrator {
  private providers: TextProvider[] = [];
  private cache: Map<string, { response: string; timestamp: number }> =
    new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.providers = [
      {
        name: "OpenAI",
        endpoint: "https://api.openai.com/v1/chat/completions",
        model: "gpt-4",
        enabled: true,
        priority: 1,
        costPerToken: 0.00003,
      },
      {
        name: "Claude",
        endpoint: "https://api.anthropic.com/v1/messages",
        model: "claude-3-sonnet-20240229",
        enabled: true,
        priority: 2,
        costPerToken: 0.000015,
      },
      {
        name: "Gemini",
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        model: "gemini-pro",
        enabled: true,
        priority: 3,
        costPerToken: 0.00001,
      },
      {
        name: "DeepSeek",
        endpoint: "https://api.deepseek.com/v1/chat/completions",
        model: "deepseek-chat",
        enabled: true,
        priority: 4,
        costPerToken: 0.000001,
      },
      {
        name: "Ollama",
        endpoint: "http://localhost:11434/api/generate",
        model: "llama2",
        enabled: false, // Local only
        priority: 5,
        costPerToken: 0,
      },
    ];
  }

  async generateText(request: TextRequest): Promise<TextResponse> {
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return {
        provider: "cache",
        response: cached.response,
        latency: 0,
      };
    }

    const enabledProviders = this.providers
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const provider of enabledProviders) {
      try {
        const response = await this.callProvider(provider, request);
        this.cache.set(cacheKey, {
          response: response.response,
          timestamp: Date.now(),
        });
        return response;
      } catch (error) {
        console.error(`Failed to call provider ${provider.name}:`, error);
        continue;
      }
    }

    throw new Error("All text providers failed");
  }

  private async callProvider(provider: TextProvider, request: TextRequest): Promise<TextResponse> {
    const startTime = Date.now();

    switch (provider.name) {
      case "OpenAI":
        return this.callOpenAI(provider, request, startTime);
      case "Claude":
        return this.callClaude(provider, request, startTime);
      case "Gemini":
        return this.callGemini(provider, request, startTime);
      case "DeepSeek":
        return this.callDeepSeek(provider, request, startTime);
      case "Ollama":
        return this.callOllama(provider, request, startTime);
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  }

  private async callOpenAI(provider: TextProvider, request: TextRequest, startTime: number): Promise<TextResponse> {
    const response = await axios.post(
      provider.endpoint,
      {
        model: provider.model,
        messages: [{ role: "user", content: request.prompt }],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        stream: request.stream || false,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const latency = Date.now() - startTime;
    const tokensUsed = response.data.usage?.total_tokens || 0;
    const cost = tokensUsed * (provider.costPerToken || 0);

    return {
      provider: provider.name,
      response: response.data.choices[0].message.content,
      tokensUsed,
      cost,
      latency,
    };
  }

  private async callClaude(provider: TextProvider, request: TextRequest, startTime: number): Promise<TextResponse> {
    const response = await axios.post(
      provider.endpoint,
      {
        model: provider.model,
        max_tokens: request.maxTokens || 1000,
        messages: [{ role: "user", content: request.prompt }],
        temperature: request.temperature || 0.7,
        stream: request.stream || false,
      },
      {
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      }
    );

    const latency = Date.now() - startTime;
    const tokensUsed = response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0;
    const cost = tokensUsed * (provider.costPerToken || 0);

    return {
      provider: provider.name,
      response: response.data.content[0].text,
      tokensUsed,
      cost,
      latency,
    };
  }

  private async callGemini(provider: TextProvider, request: TextRequest, startTime: number): Promise<TextResponse> {
    const response = await axios.post(
      `${provider.endpoint}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: request.prompt }] }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 1000,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const latency = Date.now() - startTime;
    const responseText = response.data.candidates[0].content.parts[0].text;

    return {
      provider: provider.name,
      response: responseText,
      latency,
    };
  }

  private async callDeepSeek(provider: TextProvider, request: TextRequest, startTime: number): Promise<TextResponse> {
    const response = await axios.post(
      provider.endpoint,
      {
        model: provider.model,
        messages: [{ role: "user", content: request.prompt }],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
        stream: request.stream || false,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const latency = Date.now() - startTime;
    const tokensUsed = response.data.usage?.total_tokens || 0;
    const cost = tokensUsed * (provider.costPerToken || 0);

    return {
      provider: provider.name,
      response: response.data.choices[0].message.content,
      tokensUsed,
      cost,
      latency,
    };
  }

  private async callOllama(provider: TextProvider, request: TextRequest, startTime: number): Promise<TextResponse> {
    const response = await axios.post(
      provider.endpoint,
      {
        model: provider.model,
        prompt: request.prompt,
        stream: request.stream || false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 1000,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const latency = Date.now() - startTime;

    return {
      provider: provider.name,
      response: response.data.response,
      latency,
    };
  }

  private getCacheKey(request: TextRequest): string {
    return `${request.prompt}_${request.maxTokens}_${request.temperature}`;
  }

  getProviders(): TextProvider[] {
    return this.providers;
  }

  enableProvider(name: string): void {
    const provider = this.providers.find(p => p.name === name);
    if (provider) {
      provider.enabled = true;
    }
  }

  disableProvider(name: string): void {
    const provider = this.providers.find(p => p.name === name);
    if (provider) {
      provider.enabled = false;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export default new TextOrchestrator();
