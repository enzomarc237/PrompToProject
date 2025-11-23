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
        // Only require an API key for the currently selected provider
        const hasKey =
          (settings.provider === LLMProvider.GEMINI && (settings.gemini?.apiKey || import.meta.env.VITE_GEMINI_API_KEY)) ||
          (settings.provider === LLMProvider.OPENAI && (settings.openai?.apiKey || import.meta.env.VITE_OPENAI_API_KEY)) ||
          (settings.provider === LLMProvider.OPENROUTER && (settings.openrouter?.apiKey || import.meta.env.VITE_OPENROUTER_API_KEY));

        if (!hasKey) {
          setError("Set an API key for the selected provider to load models.");
          setModels([]);
          return;
        }

        const client = createLLMClient(settings);
        const list = await client.listModels();
        setModels(list.map((m) => m.id));
      } catch (e) {
        console.error(e);
        setError(
          e instanceof Error
            ? e.message
            : "Failed to load models. Please check your API key and try again.",
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
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your LLM provider to generate projects. API keys are stored locally in your browser.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Provider
          </label>
          <div className="relative">
            <select
              value={activeProvider}
              onChange={handleProviderChange}
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5"
            >
              <option value={LLMProvider.GEMINI}>Google Gemini</option>
              <option value={LLMProvider.OPENAI}>OpenAI</option>
              <option value={LLMProvider.OPENROUTER}>OpenRouter</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5"
            placeholder="sk-..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Model
          </label>
          {loadingModels ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500 py-2">
              <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Fetching models...</span>
            </div>
          ) : error ? (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
              {error}
            </div>
          ) : models.length > 0 ? (
            <select
              value={currentModel || ""}
              onChange={(e) =>
                handleModelChange(activeProvider, e.target.value)
              }
              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5"
            >
              <option value="">Select a model</option>
              {models.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-gray-500 italic py-2">
              Enter a valid API key to load available models.
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Max Tokens
            </label>
            <span className="text-xs text-gray-500">{settings.maxTokens ?? 4096}</span>
          </div>
          <input
            type="range"
            min={512}
            max={32768}
            step={256}
            value={settings.maxTokens ?? 4096}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setSettings((prev) => ({
                ...prev,
                maxTokens: Number.isFinite(v) ? v : prev.maxTokens,
              }));
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
      </div>
    </div>
  );
};
