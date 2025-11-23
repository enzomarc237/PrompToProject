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
  generateSuggestions(): Promise<string[]>;
}

// Gemini implementation
class GeminiClient implements LLMClient {
  private client: GoogleGenAI;
  private apiKey: string;
  private model?: string;

  constructor(apiKey: string, model?: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.apiKey = apiKey;
    this.model = model;
  }

  async listModels(): Promise<LLMModelInfo[]> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch Gemini models: ${response.statusText}`);
      }
      const data = await response.json();
      const models = data.models || [];

      return models
        .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m: any) => ({
          id: m.name.replace(/^models\//, ""),
          name: m.displayName,
          contextWindow: m.inputTokenLimit,
        }));
    } catch (error) {
      console.error("Failed to list Gemini models, falling back to default list", error);
      return [
        {
          id: "gemini-2.0-flash-exp",
          name: "Gemini 2.0 Flash (Experimental)",
        },
        {
          id: "gemini-1.5-pro",
          name: "Gemini 1.5 Pro",
        },
        {
          id: "gemini-1.5-flash",
          name: "Gemini 1.5 Flash",
        },
      ];
    }
  }

  async generate({
    prompt,
    systemInstruction,
    model = this.model || "gemini-2.5-flash-preview-09-2025",
    maxTokens,
  }: LLMClientGenerateOptions): Promise<string> {
    const response = await this.client.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: maxTokens,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    return response.text;
  }

  async generateSuggestions(): Promise<string[]> {
    const topics = ["Health", "Finance", "Productivity", "Entertainment", "Education", "DevTools", "Social", "E-commerce", "Travel", "Gaming"];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const prompt = `Generate 3 creative, distinct, and detailed web application ideas. One should be related to ${randomTopic}, and the others should be completely different. Return ONLY a JSON array of strings, where each string is a description of the app idea.`;

    const response = await this.client.models.generateContent({
      model: this.model || "gemini-2.5-flash-preview-09-2025",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });

    try {
      let text = response.text;
      console.log("Gemini raw suggestion response:", text);
      // Clean up markdown code blocks if present
      text = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse suggestions from Gemini. Raw text:", response.text, "Error:", e);
      return ["A task management app with AI prioritization", "A real-time collaborative whiteboard", "A personal budget tracker with visualization"];
    }
  }
}

// OpenAI implementation
class OpenAIClient implements LLMClient {
  private apiKey: string;
  private model?: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model;
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
    model = "gpt-4o-mini",
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

  async generateSuggestions(): Promise<string[]> {
    const topics = ["Health", "Finance", "Productivity", "Entertainment", "Education", "DevTools", "Social", "E-commerce", "Travel", "Gaming"];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const prompt = `Generate 3 creative, distinct, and detailed web application ideas. One should be related to ${randomTopic}, and the others should be completely different. Return ONLY a JSON array of strings.`;

    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative assistant. Return ONLY a JSON array of strings." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.9,
      }),
    });

    if (!res.ok) {
      return ["A task management app with AI prioritization", "A real-time collaborative whiteboard", "A personal budget tracker with visualization"];
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    try {
      // Clean up markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse suggestions:", e);
      return ["A task management app with AI prioritization", "A real-time collaborative whiteboard", "A personal budget tracker with visualization"];
    }
  }
}

// OpenRouter implementation
class OpenRouterClient implements LLMClient {
  private apiKey: string;
  private model?: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model;
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

  async generateSuggestions(): Promise<string[]> {
    const topics = ["Health", "Finance", "Productivity", "Entertainment", "Education", "DevTools", "Social", "E-commerce", "Travel", "Gaming"];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const prompt = `Generate 3 creative, distinct, and detailed web application ideas. One should be related to ${randomTopic}, and the others should be completely different. Return ONLY a JSON array of strings.`;

    // Default to a cheap/fast model for suggestions if possible, or let user pick? 
    // For now, we'll try to use a reasonable default if we can, or just error out if no model is selected in main flow?
    // Actually, OpenRouter needs a model. We'll use a common one or rely on what's passed? 
    // Since this method doesn't take options, we might need to hardcode a fallback or use the client's configured model if we stored it.
    // But we don't store it in the client. Let's use a safe default like google/gemini-flash-1.5 or similar if available, or just fail gracefully.
    // Use a lightweight model for suggestions.
    const model = this.model || "google/gemini-flash-1.5-8b";

    try {
      const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Prompt-to-Project",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are a creative assistant. Return ONLY a JSON array of strings." },
            { role: "user", content: prompt },
          ],
          max_tokens: 1000,
          temperature: 0.9,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`OpenRouter suggestion request failed: ${res.status} ${res.statusText}`, errorText);
        throw new Error(`OpenRouter request failed: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (e) {
      return ["A task management app with AI prioritization", "A real-time collaborative whiteboard", "A personal budget tracker with visualization"];
    }
  }
}

export interface LLMRuntimeSettings {
  provider: LLMProvider;
  maxTokens?: number;
  gemini?: { apiKey?: string; model?: string };
  openai?: { apiKey?: string; model?: string };
  openrouter?: { apiKey?: string; model?: string };
}

export function getDefaultRuntimeSettings(): LLMRuntimeSettings {
  return {
    provider: LLMProvider.GEMINI,
    maxTokens: 4096,
    gemini: {
      apiKey: GEMINI_API_KEY,
      model: "gemini-2.5-flash-preview-09-2025",
    },
    openai: {
      apiKey: OPENAI_API_KEY,
      model: "gpt-4o-mini",
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
      return new OpenAIClient(apiKey, settings.openai?.model);
    }
    case LLMProvider.OPENROUTER: {
      const apiKey = settings.openrouter?.apiKey || OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OpenRouter API key not configured");
      return new OpenRouterClient(apiKey, settings.openrouter?.model);
    }
    case LLMProvider.GEMINI:
    default: {
      const apiKey = settings.gemini?.apiKey || GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not configured");
      return new GeminiClient(apiKey, settings.gemini?.model);
    }
  }
}
