import { GoogleGenAI } from "@google/genai";
import type { FileNode, ProjectOptions } from "../types";
import {
  LLMProvider,
  type LLMModel,
  type LLMProviderConfig,
} from "../types/llm";

// Environment defaults
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;

const OPENAI_BASE_URL = "https://api.openai.com/v1";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export interface LLMModelInfo {
  id: string;
  name: string;
  contextWindow?: number;
  inputCost?: number;
  outputCost?: number;
}

export interface LLMClientGenerateOptions {
  prompt: string;
  systemInstruction: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMClient {
  listModels(): Promise<LLMModelInfo[]>;
  generate(options: LLMClientGenerateOptions): Promise<string>;
}

// Gemini implementation
class GeminiClient implements LLMClient {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async listModels(): Promise<LLMModelInfo[]> {
    // Static for now; can be wired to model discovery endpoint later.
    return [
      {
        id: "gemini-2.5-flash-preview-09-2025",
        name: "Gemini 2.5 Flash",
      },
    ];
  }

  async generate({
    prompt,
    systemInstruction,
    model = "gemini-2.5-flash-preview-09-2025",
  }: LLMClientGenerateOptions): Promise<string> {
    const response = await this.client.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    return response.text;
  }
}

// OpenAI implementation
class OpenAIClient implements LLMClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async listModels(): Promise<LLMModelInfo[]> {
    const res = await fetch(`${OPENAI_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch OpenAI models");
    }

    const data = await res.json();

    // Filter to chat/completion-capable models; keep minimal here.
    const allowedPrefix = ["gpt-"];
    return (data.data || [])
      .map((m: any) => m.id as string)
      .filter((id: string) => allowedPrefix.some((p) => id.startsWith(p)))
      .map((id: string) => ({ id, name: id }));
  }

  async generate({
    prompt,
    systemInstruction,
    model = "gpt-4.1-mini",
    maxTokens = 4096,
    temperature = 0.4,
  }: LLMClientGenerateOptions): Promise<string> {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI request failed: ${text}`);
    }

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content ??
      (() => {
        throw new Error("No content returned from OpenAI");
      })();

    return content;
  }
}

// OpenRouter implementation
class OpenRouterClient implements LLMClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async listModels(): Promise<LLMModelInfo[]> {
    const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch OpenRouter models");
    }

    const data = await res.json();

    return (data.data || []).map((m: any) => ({
      id: m.id,
      name: m.name ?? m.id,
      contextWindow: m.context_length,
    }));
  }

  async generate({
    prompt,
    systemInstruction,
    model,
    maxTokens = 4096,
    temperature = 0.4,
  }: LLMClientGenerateOptions): Promise<string> {
    const selectedModel = model;
    if (!selectedModel) {
      throw new Error("OpenRouter model must be specified");
    }

    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Prompt-to-Project",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter request failed: ${text}`);
    }

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content ??
      (() => {
        throw new Error("No content returned from OpenRouter");
      })();

    return content;
  }
}

export interface LLMRuntimeSettings {
  provider: LLMProvider;
  gemini?: { apiKey?: string; model?: string };
  openai?: { apiKey?: string; model?: string };
  openrouter?: { apiKey?: string; model?: string };
}

export function getDefaultRuntimeSettings(): LLMRuntimeSettings {
  return {
    provider: LLMProvider.GEMINI,
    gemini: {
      apiKey: GEMINI_API_KEY,
      model: "gemini-2.5-flash-preview-09-2025",
    },
    openai: {
      apiKey: OPENAI_API_KEY,
      model: "gpt-4.1-mini",
    },
    openrouter: {
      apiKey: OPENROUTER_API_KEY,
      model: undefined,
    },
  };
}

export function createLLMClient(settings: LLMRuntimeSettings): LLMClient {
  switch (settings.provider) {
    case LLMProvider.OPENAI: {
      const apiKey = settings.openai?.apiKey || OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API key not configured");
      return new OpenAIClient(apiKey);
    }
    case LLMProvider.OPENROUTER: {
      const apiKey = settings.openrouter?.apiKey || OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OpenRouter API key not configured");
      return new OpenRouterClient(apiKey);
    }
    case LLMProvider.GEMINI:
    default: {
      const apiKey = settings.gemini?.apiKey || GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not configured");
      return new GeminiClient(apiKey);
    }
  }
}
