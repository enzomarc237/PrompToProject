import React, { useState, useCallback } from 'react';
import { PromptForm } from './components/PromptForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { CodeBracketSquareIcon } from './components/icons/Icons';
import { generateProjectStructure } from './services/geminiService';
import { FileNode, ProjectOptions } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<FileNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateProject = useCallback(async (options: ProjectOptions) => {
    setIsLoading(true);
    setError(null);
    setGeneratedFiles(null);
    try {
      const files = await generateProjectStructure(options);
      setGeneratedFiles(files);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <header className="bg-gray-950/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <CodeBracketSquareIcon className="h-8 w-8 text-indigo-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">
                Prompt-to-Project Starter
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Turn Your Idea Into Code
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Describe your application, select your tech stack, and let AI generate a complete starter project for you.
            </p>
          </div>
          
          <PromptForm onGenerate={handleGenerateProject} isLoading={isLoading} />

          {error && (
            <div className="mt-10 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {(isLoading || generatedFiles) && (
            <div className="mt-12">
              <ResultsDisplay files={generatedFiles} isLoading={isLoading} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-950/70 py-4">
        <div className="text-center text-sm text-gray-500">
          Powered by Gemini 2.5 Pro
        </div>
      </footer>
    </div>
  );
};

export default App;