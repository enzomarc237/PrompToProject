import React, { useState, useEffect, useCallback } from 'react';
import { ProjectOptions } from '../types';
import { STACK_OPTIONS, PATTERN_OPTIONS, AUTH_OPTIONS, TESTING_OPTIONS, INFRA_OPTIONS, DEFAULT_PROJECT_OPTIONS, BACKEND_OPTIONS, FRONTEND_OPTIONS } from '../constants';
import { SparklesIcon, ChevronDownIcon, ChevronRightIcon } from './icons/Icons';

interface PromptFormProps {
  onGenerate: (options: ProjectOptions) => void;
  isLoading: boolean;
}

const QUICK_PROMPTS = [
    { label: "SaaS Dashboard", text: "A SaaS dashboard with user management, stripe subscription, and activity logging." },
    { label: "E-commerce Store", text: "A modern e-commerce store with product filtering, cart functionality, and checkout flow." },
    { label: "Task Manager", text: "A collaborative kanban board task manager with realtime updates." },
    { label: "Blog Platform", text: "A markdown-based blog platform with comments and tags system." },
];

const FormSelect: React.FC<{label: string, name: string, value: string | undefined, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({ label, name, value, onChange, options }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="block w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-3 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
                {options.map(option => <option key={option}>{option}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
        </div>
    </div>
);

const LOCAL_STORAGE_KEY = 'prompt-to-project-options';

export const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading }) => {
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

  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const handleQuickPrompt = (text: string) => {
      setOptions(prev => ({ ...prev, description: text }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(options);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl shadow-indigo-500/5 dark:shadow-black/40 border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {/* Header / Description Input */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
                <label htmlFor="description" className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What do you want to build?
                </label>
                <div className="relative">
                    <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="block w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all text-base shadow-inner"
                    value={options.description}
                    onChange={handleChange}
                    placeholder="e.g., A fitness tracking app where users can log workouts, view progress charts, and share achievements..."
                    />
                    <div className="absolute bottom-3 right-3">
                        <SparklesIcon className="h-5 w-5 text-indigo-400 opacity-50" />
                    </div>
                </div>

                {/* Quick Prompts */}
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 self-center mr-1">Quick Start:</span>
                    {QUICK_PROMPTS.map((prompt) => (
                        <button
                            key={prompt.label}
                            type="button"
                            onClick={() => handleQuickPrompt(prompt.text)}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800"
                        >
                            {prompt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="md:col-span-2">
                    <FormSelect label="Tech Stack" name="stack" value={options.stack} onChange={handleChange} options={STACK_OPTIONS} />
                </div>
                {options.stack === 'Custom' && (
                    <>
                        <FormSelect label="Backend Framework" name="backend" value={options.backend} onChange={handleChange} options={BACKEND_OPTIONS} />
                        <FormSelect label="Frontend Framework" name="frontend" value={options.frontend} onChange={handleChange} options={FRONTEND_OPTIONS} />
                    </>
                )}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 px-6 sm:px-8 py-4">
                <button 
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                >
                    {showAdvanced ? <ChevronDownIcon className="h-4 w-4 mr-2"/> : <ChevronRightIcon className="h-4 w-4 mr-2"/>}
                    Advanced Configuration
                </button>

                {showAdvanced && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <FormSelect label="Architecture Pattern" name="pattern" value={options.pattern} onChange={handleChange} options={PATTERN_OPTIONS} />
                        <FormSelect label="Authentication" name="auth" value={options.auth} onChange={handleChange} options={AUTH_OPTIONS} />
                        <FormSelect label="Testing Framework" name="testing" value={options.testing} onChange={handleChange} options={TESTING_OPTIONS} />
                        <FormSelect label="Infrastructure" name="infra" value={options.infra} onChange={handleChange} options={INFRA_OPTIONS} />
                    </div>
                )}
          </div>

          {/* Submit Button */}
          <div className="p-6 sm:px-8 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end">
                <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-8 border border-transparent rounded-lg shadow-lg shadow-indigo-500/30 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                >
                {isLoading ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Project...
                    </>
                ) : (
                    <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Generate Codebase
                    </>
                )}
                </button>
          </div>
      </div>
    </form>
  );
};