import type { FileNode, ProjectOptions } from "../types";
import { createLLMClient } from "../lib/llmClient";
import { createSystemInstruction, createUserPrompt } from "./promptBuilder";
import type { LLMRuntimeSettings } from "../lib/llmClient";
import { LLMProvider } from "../types/llm";

// Central generation entrypoint used by the app.
// Uses the runtime LLM settings chosen by the user.

export const generateProjectStructure = async (
  options: ProjectOptions,
  llmSettings: LLMRuntimeSettings,
): Promise<FileNode[]> => {
  const client = createLLMClient(llmSettings);

  const systemInstruction = createSystemInstruction();
  const userPrompt = createUserPrompt(options);

  const raw = await client.generate({
    prompt: userPrompt,
    systemInstruction,
    model:
      llmSettings.provider === LLMProvider.GEMINI
        ? llmSettings.gemini?.model
        : llmSettings.provider === LLMProvider.OPENAI
          ? llmSettings.openai?.model
          : llmSettings.openrouter?.model,
    maxTokens: llmSettings.maxTokens ?? 4096,
  });

  const jsonText = raw.trim();

  if (!jsonText.startsWith("[") || !jsonText.endsWith("]")) {
    throw new Error("Invalid JSON response from API. Expected a root array.");
  }

  const parsedJson = JSON.parse(jsonText);

  if (!Array.isArray(parsedJson)) {
    throw new Error("Parsed JSON is not an array as expected.");
  }

  return parsedJson as FileNode[];
};
