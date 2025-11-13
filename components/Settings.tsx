import React, { useEffect, useState } from "react";
import { useLLMSettings } from "../contexts/LLMSettingsContext";
import { LLMProvider } from "../types/llm";
import { createLLMClient } from "../lib/llmClient";

export const Settings: React.FC = () => {
  const { settings, setSettings } = useLLMSettings();
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProvider = settings.provider;

  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      setError(null);
      try {
        const client = createLLMClient(settings);
        const list = await client.listModels();
        setModels(list.map((m) => m.id));
      } catch (e) {
        console.error(e);
        setError(
          e instanceof Error
            ? e.message
            : "Failed to load models for selected provider.",
        );
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProvider, settings.provider, settings.gemini?.apiKey, settings.openai?.apiKey, settings.openrouter?.apiKey]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as LLMProvider;
    setSettings((prev) => ({
      ...prev,
      provider,
    }));
  };

  const handleApiKeyChange = (
    provider: LLMProvider,
    apiKey: string,
  ) => {
    setSettings((prev) => {
      const next = { ...prev };
      if (provider === LLMProvider.GEMINI) {
        next.gemini = { ...(next.gemini || {}), apiKey };
      } else if (provider === LLMProvider.OPENAI) {
        next.openai = { ...(next.openai || {}), apiKey };
      } else if (provider === LLMProvider.OPENROUTER) {
        next.openrouter = { ...(next.openrouter || {}), apiKey };
      }
      return next;
    });
  };

  const handleModelChange = (
    provider: LLMProvider,
    model: string,
  ) => {
    setSettings((prev) => {
      const next = { ...prev };
      if (provider === LLMProvider.GEMINI) {
        next.gemini = { ...(next.gemini || {}), model };
      } else if (provider === LLMProvider.OPENAI) {
        next.openai = { ...(next.openai || {}), model };
      } else if (provider === LLMProvider.OPENROUTER) {
        next.openrouter = { ...(next.openrouter || {}), model };
      }
      return next;
    });
  };

  const currentModel =
    activeProvider === LLMProvider.GEMINI
      ? settings.gemini?.model
      : activeProvider === LLMProvider.OPENAI
        ? settings.openai?.model
        : settings.openrouter?.model;

  const currentApiKey =
    activeProvider === LLMProvider.GEMINI
      ? settings.gemini?.apiKey
      : activeProvider === LLMProvider.OPENAI
        ? settings.openai?.apiKey
        : settings.openrouter?.apiKey;

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        LLM Settings
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Provider
        </label>
        <select
          value={activeProvider}
          onChange={handleProviderChange}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
        >
          <option value={LLMProvider.GEMINI}>Gemini</option>
          <option value={LLMProvider.OPENAI}>OpenAI</option>
          <option value={LLMProvider.OPENROUTER}>OpenRouter</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {activeProvider === LLMProvider.GEMINI
            ? "Gemini API Key"
            : activeProvider === LLMProvider.OPENAI
              ? "OpenAI API Key"
              : "OpenRouter API Key"}
        </label>
        <input
          type="password"
          value={currentApiKey || ""}
          onChange={(e) =>
            handleApiKeyChange(activeProvider, e.target.value)
          }
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          placeholder="Enter API key (stored locally in your browser)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Model
        </label>
        {loadingModels ? (
          <div className="text-xs text-gray-500">Loading models...</div>
        ) : error ? (
          <div className="text-xs text-red-500">
            {error}
          </div>
        ) : models.length > 0 ? (
          <select
            value={currentModel || ""}
            onChange={(e) =>
              handleModelChange(activeProvider, e.target.value)
            }
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="">Select a model</option>
            {models.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-xs text-gray-500">
            No models available. Check your API key.
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-500">
        API keys are stored only in your browser (localStorage) and used
        directly from the frontend. PocketBase is used only for
        authentication and project storage.
      </p>
    </div>
  );
};
