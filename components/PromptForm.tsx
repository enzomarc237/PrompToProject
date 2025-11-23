import React, { useState, useEffect, useCallback } from 'react';
import { ProjectOptions } from '../types';
import { STACK_OPTIONS, PATTERN_OPTIONS, AUTH_OPTIONS, TESTING_OPTIONS, INFRA_OPTIONS, DEFAULT_PROJECT_OPTIONS, BACKEND_OPTIONS, FRONTEND_OPTIONS } from '../constants';
import { SparklesIcon, ChevronDownIcon } from './icons/Icons';

interface PromptFormProps {
  onGenerate: (options: ProjectOptions) => void;
  isLoading: boolean;
}

const FormSelect: React.FC<{ label: string, name: string, value: string | undefined, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }> = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <div className="relative mt-1">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none text-gray-900 dark:text-gray-200"
      >
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  </div>
);

const LOCAL_STORAGE_KEY = 'prompt-to-project-options';

import { useLLMSettings } from '../contexts/LLMSettingsContext';
import { createLLMClient } from '../lib/llmClient';

// ... existing imports

export const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading }) => {
  const { settings } = useLLMSettings();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [options, setOptions] = useState<ProjectOptions>(() => {
    try {
      const savedOptions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedOptions) {
        const parsed = JSON.parse(savedOptions);
        return { ...DEFAULT_PROJECT_OPTIONS, ...parsed };
      }
    } catch (error) {
      console.error('Could not load project options from localStorage', error);
    }
    return DEFAULT_PROJECT_OPTIONS;
  });

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const client = createLLMClient(settings);
      const newSuggestions = await client.generateSuggestions();
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Failed to get suggestions", error);
      // Fallback suggestions if API fails
      setSuggestions([
        "A personal finance tracker with budget visualization",
        "A collaborative real-time whiteboard for teams",
        "A fitness tracking app with workout plans and progress charts"
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setOptions(prev => ({ ...prev, description: suggestion }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(options));
    } catch (error) {
      console.error('Could not save project options to localStorage', error);
    }
  }, [options]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    setOptions(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(options);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-1">
        <div className="relative">
          <textarea
            id="description"
            name="description"
            rows={4}
            className="block w-full rounded-xl border-0 bg-transparent py-4 pl-4 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 sm:text-lg sm:leading-6 resize-none"
            value={options.description}
            onChange={handleChange}
            placeholder="Describe your dream application... (e.g., 'A kanban board with drag-and-drop tasks and team collaboration')"
          />
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button
              type="button"
              onClick={handleGetSuggestions}
              disabled={isLoadingSuggestions || isLoading}
              className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Get AI Suggestions"
            >
              {isLoadingSuggestions ? (
                <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="text-indigo-500">✨ Surprise Me</span>
              )}
            </button>
            <button
              type="submit"
              disabled={isLoading || !options.description.trim()}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
        {suggestions.length > 0 && (
          <div className="px-4 pb-4 pt-2 flex flex-wrap gap-2 animate-fade-in">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-left max-w-full truncate"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        <FormSelect label="Tech Stack" name="stack" value={options.stack} onChange={handleChange} options={STACK_OPTIONS} />

        {options.stack === 'Custom' && (
          <>
            <FormSelect label="Backend Framework" name="backend" value={options.backend} onChange={handleChange} options={BACKEND_OPTIONS} />
            <FormSelect label="Frontend Framework" name="frontend" value={options.frontend} onChange={handleChange} options={FRONTEND_OPTIONS} />
          </>
        )}

        <FormSelect label="Architecture Pattern" name="pattern" value={options.pattern} onChange={handleChange} options={PATTERN_OPTIONS} />
        <FormSelect label="Authentication" name="auth" value={options.auth} onChange={handleChange} options={AUTH_OPTIONS} />
        <FormSelect label="Testing Framework" name="testing" value={options.testing} onChange={handleChange} options={TESTING_OPTIONS} />
        <FormSelect label="Infrastructure" name="infra" value={options.infra} onChange={handleChange} options={INFRA_OPTIONS} />
      </div>
    </form>
  );
};