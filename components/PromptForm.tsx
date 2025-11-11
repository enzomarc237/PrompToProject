
import React, { useState } from 'react';
import { ProjectOptions } from '../types';
import { STACK_OPTIONS, PATTERN_OPTIONS, AUTH_OPTIONS, TESTING_OPTIONS, INFRA_OPTIONS, DEFAULT_PROJECT_OPTIONS } from '../constants';
import { SparklesIcon, ChevronDownIcon } from './icons/Icons';

interface PromptFormProps {
  onGenerate: (options: ProjectOptions) => void;
  isLoading: boolean;
}

const FormSelect: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <div className="relative mt-1">
            <select
                value={value}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
            >
                {options.map(option => <option key={option}>{option}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
        </div>
    </div>
);


export const PromptForm: React.FC<PromptFormProps> = ({ onGenerate, isLoading }) => {
  const [options, setOptions] = useState<ProjectOptions>(DEFAULT_PROJECT_OPTIONS);

  const handleChange = (field: keyof ProjectOptions, value: string) => {
    setOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(options);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-950/50 p-6 rounded-lg border border-gray-700">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Project Description
        </label>
        <textarea
          id="description"
          rows={5}
          className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-3"
          value={options.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your project idea here..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect label="Tech Stack" value={options.stack} onChange={(e) => handleChange('stack', e.target.value)} options={STACK_OPTIONS} />
        <FormSelect label="Architecture Pattern" value={options.pattern} onChange={(e) => handleChange('pattern', e.target.value)} options={PATTERN_OPTIONS} />
        <FormSelect label="Authentication" value={options.auth} onChange={(e) => handleChange('auth', e.target.value)} options={AUTH_OPTIONS} />
        <FormSelect label="Testing Framework" value={options.testing} onChange={(e) => handleChange('testing', e.target.value)} options={TESTING_OPTIONS} />
        <FormSelect label="Infrastructure" value={options.infra} onChange={(e) => handleChange('infra', e.target.value)} options={INFRA_OPTIONS} />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-900/50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Project
            </>
          )}
        </button>
      </div>
    </form>
  );
};
