import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LLMProvider } from "../types/llm";
import { getDefaultRuntimeSettings, LLMRuntimeSettings } from "../lib/llmClient";

const STORAGE_KEY = "prompt-to-project-llm-settings";

interface LLMSettingsContextValue {
  settings: LLMRuntimeSettings;
  setSettings: (updater: (prev: LLMRuntimeSettings) => LLMRuntimeSettings) => void;
}

const LLMSettingsContext = createContext<LLMSettingsContextValue | undefined>(
  undefined,
);

export const LLMSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettingsState] = useState<LLMRuntimeSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultRuntimeSettings();
      const parsed = JSON.parse(raw);
      return {
        ...getDefaultRuntimeSettings(),
        ...parsed,
      } as LLMRuntimeSettings;
    } catch {
      return getDefaultRuntimeSettings();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const value = useMemo<LLMSettingsContextValue>(
    () => ({
      settings,
      setSettings: (updater) => {
        setSettingsState((prev) => updater(prev));
      },
    }),
    [settings],
  );

  return (
    <LLMSettingsContext.Provider value={value}>
      {children}
    </LLMSettingsContext.Provider>
  );
};

export const useLLMSettings = (): LLMSettingsContextValue => {
  const ctx = useContext(LLMSettingsContext);
  if (!ctx) {
    throw new Error("useLLMSettings must be used within LLMSettingsProvider");
  }
  return ctx;
};
