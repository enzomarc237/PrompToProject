// LLM Provider Types
export interface LLMModel {
  id: string;
  name: string;
  description?: string;
  maxTokens: number;
  contextWindow: number;
  pricing?: {
    input: number; // cost per 1000 tokens
    output: number;
  };
  capabilities?: {
    vision?: boolean;
    functionCalling?: boolean;
    streaming?: boolean;
  };
}

export interface LLMProviderConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  availableModels?: LLMModel[];
  isConfigured: boolean;
}

export interface UserSettings {
  id?: string;
  userId: string;
  selectedProvider: LLMProvider;
  geminiConfig?: LLMProviderConfig;
  openAIConfig?: LLMProviderConfig;
  openRouterConfig?: LLMProviderConfig;
  createdAt?: string;
  updatedAt?: string;
}

// Provider enumeration
export enum LLMProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  OPENROUTER = 'openrouter'
}

// Service interface for LLM providers
export interface LLMProviderService {
  readonly provider: LLMProvider;
  
  // Initialize provider with config
  initialize(config: LLMProviderConfig): Promise<void>;
  
  // Get available models
  getModels(): Promise<LLMModel[]>;
  
  // Generate content using project requirements
  generateContent(
    prompt: string, 
    systemInstruction: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string>;
  
  // Check if provider is properly configured
  isConfigured(): boolean;
  
  // Validate API key
  validateApiKey(apiKey: string): Promise<boolean>;
}

// Generation request/response types
export interface GenerationRequest {
  provider: LLMProvider;
  model?: string;
  prompt: string;
  systemInstruction: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
  };
}

export interface GenerationResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: LLMProvider;
}