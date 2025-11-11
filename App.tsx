import React, { useState, useCallback } from 'react';
import { PromptForm } from './components/PromptForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { CodeBracketSquareIcon } from './components/icons/Icons';
import { generateProjectStructure } from './services/geminiService';
import { FileNode, ProjectOptions } from './types';

const SkeletonLoader = () => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden h-[70vh] flex animate-pulse">
        <div className="w-1/3 min-w-[250px] max-w-[400px] bg-gray-900 p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                    <div className="pl-5 mt-2 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                </div>
            ))}
             <div className="h-5 bg-gray-700 rounded w-3/4 mt-4"></div>
             <div className="h-5 bg-gray-700 rounded w-1/2 mt-4"></div>
        </div>
        <div className="w-2/3 flex-grow flex flex-col bg-gray-800">
            <div className="p-3 border-b border-gray-700">
                <div className="h-5 bg-gray-700 rounded w-1/4"></div>
            </div>
            <div className="p-4 space-y-2 flex-grow">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>
        </div>
    </div>
);

const GenerationProgress: React.FC<{ details: ProjectOptions }> = ({ details }) => {
    const stackDisplay = details.stack === 'Custom' 
        ? `${details.frontend} + ${details.backend}`
        : details.stack;

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Generating Project...</h3>
            </div>
            <div className="relative">
                <SkeletonLoader />
                <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center">
                    <div className="text-center p-8 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-md mx-auto">
                        <div className="flex justify-center items-center mb-4">
                             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
                        </div>
                        <h4 className="text-xl font-semibold text-white mb-2">Crafting Your Codebase</h4>
                        <p className="text-gray-400 mb-6">Gemini is building your project. This might take a moment.</p>
                        <div className="text-left text-sm space-y-2 bg-gray-800/50 p-4 rounded-md border border-gray-700">
                            <p><strong className="font-medium text-gray-300 w-28 inline-block">Stack:</strong> <span className="text-indigo-300">{stackDisplay}</span></p>
                            <p><strong className="font-medium text-gray-300 w-28 inline-block">Pattern:</strong> <span className="text-indigo-300">{details.pattern}</span></p>
                            <p><strong className="font-medium text-gray-300 w-28 inline-block">Auth:</strong> <span className="text-indigo-300">{details.auth}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<FileNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectOptions, setProjectOptions] = useState<ProjectOptions | null>(null);

  const handleGenerateProject = useCallback(async (options: ProjectOptions) => {
    setIsLoading(true);
    setError(null);
    setGeneratedFiles(null);
    setProjectOptions(options);
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

          <div className="mt-12">
            {isLoading && projectOptions && <GenerationProgress details={projectOptions} />}
            {generatedFiles && !isLoading && <ResultsDisplay files={generatedFiles} />}
          </div>
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
