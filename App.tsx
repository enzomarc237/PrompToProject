import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { CodeBracketSquareIcon, SunIcon, MoonIcon } from './components/icons/Icons';
import { generateProjectStructure } from './services/geminiService';
import { FileNode, ProjectOptions } from './types';

// Simulated Terminal Log for the loading state
const TerminalLoader: React.FC<{ details: ProjectOptions }> = ({ details }) => {
    const [lines, setLines] = useState<string[]>([]);
    
    useEffect(() => {
        const steps = [
            `> Initializing generator for ${details.stack}...`,
            `> Analyzing requirements: "${details.description.substring(0, 30)}..."`,
            `> Configuring architecture: ${details.pattern}`,
            `> Setting up authentication: ${details.auth}`,
            `> Scaffolding database models...`,
            `> Generating API routes...`,
            `> Crafting frontend components...`,
            `> Writing configuration files...`,
            `> Finalizing project structure...`,
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                setLines(prev => [...prev, steps[currentStep]]);
                currentStep++;
            } else {
                clearInterval(interval);
            }
        }, 800); // Add a new line every 800ms

        return () => clearInterval(interval);
    }, [details]);

    return (
        <div className="w-full max-w-3xl mx-auto mt-8">
            <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-700 font-mono text-sm">
                <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2 border-b border-gray-700">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-gray-400 text-xs">gemini-build-server — bash — 80x24</span>
                </div>
                <div className="p-6 h-64 overflow-hidden flex flex-col justify-end relative">
                     <div className="absolute inset-0 p-6 overflow-y-auto space-y-2">
                        {lines.map((line, i) => (
                            <div key={i} className="text-green-400">
                                <span className="text-gray-500 mr-2">$</span>
                                {line}
                            </div>
                        ))}
                        <div className="animate-pulse text-green-400">
                            <span className="text-gray-500 mr-2">$</span>
                            <span className="inline-block w-2 h-4 bg-green-400 align-middle"></span>
                        </div>
                     </div>
                </div>
            </div>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm animate-pulse">
                Gemini is writing your code... This may take up to 30 seconds.
            </p>
        </div>
    );
};

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<FileNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectOptions, setProjectOptions] = useState<ProjectOptions | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = window.localStorage.getItem('theme') as Theme;
      if (savedTheme) return savedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeSwitch = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleGenerateProject = useCallback(async (options: ProjectOptions) => {
    setIsLoading(true);
    setError(null);
    setGeneratedFiles(null);
    setProjectOptions(options);
    
    // Scroll to loading section
    window.scrollTo({ top: 300, behavior: 'smooth' });

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
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gray-50 dark:bg-gray-950">
      
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg p-1.5 text-white shadow-lg shadow-indigo-500/20">
                 <CodeBracketSquareIcon className="h-6 w-6" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Prompt-to-Project
              </h1>
            </div>
             <button
              onClick={handleThemeSwitch}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Hero / Intro */}
        {!generatedFiles && !isLoading && (
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-6">
                Turn Ideas into Code
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Describe your dream application, pick your stack, and let our AI architect generate a complete, production-ready folder structure and codebase in seconds.
                </p>
            </div>
        )}

        {/* Form Section - Only show if not showing results or loading, OR allow it to stick around? 
            Let's keep it always visible but maybe visually deemphasized when results are shown. 
            For now, simple flow: Form -> (Loading) -> Results + "Start Over" button */}
        
        {!generatedFiles && (
             <PromptForm onGenerate={handleGenerateProject} isLoading={isLoading} />
        )}

        {error && (
            <div className="mt-8 max-w-4xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl flex items-start shadow-sm" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <strong className="font-bold block mb-1">Generation Failed</strong>
                    <span className="block text-sm opacity-90">{error}</span>
                </div>
            </div>
        )}

        {/* Loading State */}
        {isLoading && projectOptions && <TerminalLoader details={projectOptions} />}

        {/* Results Section */}
        {generatedFiles && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ResultsDisplay files={generatedFiles} />
                <div className="mt-8 text-center">
                    <button 
                        onClick={() => { setGeneratedFiles(null); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                        className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 font-medium underline underline-offset-4 transition-colors"
                    >
                        Start a new project
                    </button>
                </div>
            </div>
        )}

      </main>
      
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Gemini 2.5 Pro • Built with React & Tailwind
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;