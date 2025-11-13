import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { AuthForm } from './components/AuthForm';
import { ProjectHistory } from './components/ProjectHistory';
import { SaveProjectDialog } from './components/SaveProjectDialog';
import { Toast } from './components/Toast';
import { CodeBracketSquareIcon, SunIcon, MoonIcon } from './components/icons/Icons';
import { generateProjectStructure } from './services/geminiService';
import { projectHistoryService } from './services/projectHistoryService';
import { useAuth } from './contexts/AuthContext';
import { FileNode, ProjectOptions, SavedProject } from './types';

const SkeletonLoader = () => (
    <div className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden h-[70vh] flex animate-pulse">
        <div className="w-1/3 min-w-[250px] max-w-[400px] bg-gray-100 dark:bg-gray-900 p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="pl-5 mt-2 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                </div>
            ))}
             <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mt-4"></div>
             <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mt-4"></div>
        </div>
        <div className="w-2/3 flex-grow flex flex-col bg-gray-200 dark:bg-gray-800">
            <div className="p-3 border-b border-gray-300 dark:border-gray-700">
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            <div className="p-4 space-y-2 flex-grow">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
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
                <h3 className="text-2xl font-bold text-black dark:text-white">Generating Project...</h3>
            </div>
            <div className="relative">
                <SkeletonLoader />
                <div className="absolute inset-0 bg-gray-200/80 dark:bg-gray-800/80 flex items-center justify-center">
                    <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-300 dark:border-gray-700 max-w-md mx-auto">
                        <div className="flex justify-center items-center mb-4">
                             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                        </div>
                        <h4 className="text-xl font-semibold text-black dark:text-white mb-2">Crafting Your Codebase</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Gemini is building your project. This might take a moment.</p>
                        <div className="text-left text-sm space-y-2 bg-gray-100/50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-300 dark:border-gray-700">
                            <p><strong className="font-medium text-gray-700 dark:text-gray-300 w-28 inline-block">Stack:</strong> <span className="text-indigo-600 dark:text-indigo-300">{stackDisplay}</span></p>
                            <p><strong className="font-medium text-gray-700 dark:text-gray-300 w-28 inline-block">Pattern:</strong> <span className="text-indigo-600 dark:text-indigo-300">{details.pattern}</span></p>
                            <p><strong className="font-medium text-gray-700 dark:text-gray-300 w-28 inline-block">Auth:</strong> <span className="text-indigo-600 dark:text-indigo-300">{details.auth}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

type Theme = 'light' | 'dark';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<FileNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectOptions, setProjectOptions] = useState<ProjectOptions | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
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
    setCurrentProjectId(null);
    try {
      const files = await generateProjectStructure(options);
      setGeneratedFiles(files);
      
      if (user && files && files.length > 0) {
        const projectName = options.description.slice(0, 50).trim() || 'Untitled Project';
        const savedProject = await projectHistoryService.saveProject(
          user.id,
          projectName,
          options,
          files
        );
        setCurrentProjectId(savedProject.id);
        setToast({ message: 'Project saved successfully!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleSaveProject = useCallback(async (name: string) => {
    if (!user || !generatedFiles || !projectOptions) return;
    
    try {
      if (currentProjectId) {
        await projectHistoryService.updateProject(currentProjectId, {
          name,
          files: generatedFiles,
          options: projectOptions,
        });
        setToast({ message: 'Project updated successfully!', type: 'success' });
      } else {
        const savedProject = await projectHistoryService.saveProject(
          user.id,
          name,
          projectOptions,
          generatedFiles
        );
        setCurrentProjectId(savedProject.id);
        setToast({ message: 'Project saved successfully!', type: 'success' });
      }
      
      setShowSaveDialog(false);
    } catch (err) {
      console.error(err);
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to save project', 
        type: 'error' 
      });
    }
  }, [user, generatedFiles, projectOptions, currentProjectId]);

  const handleLoadProject = useCallback((project: SavedProject) => {
    setGeneratedFiles(project.files);
    setProjectOptions(project.options);
    setCurrentProjectId(project.id);
    setShowHistory(false);
    setError(null);
    setToast({ message: 'Project loaded successfully!', type: 'info' });
  }, []);

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 flex flex-col transition-colors duration-300">
      <header className="bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <CodeBracketSquareIcon className="h-8 w-8 text-indigo-500" />
              <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Prompt-to-Project Starter
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {user.name}
              </span>
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label="Project history"
                title="Project History"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {generatedFiles && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  aria-label="Save project"
                  title="Save Project"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleThemeSwitch}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-black dark:text-white sm:text-4xl">
              Turn Your Idea Into Code
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Describe your application, select your tech stack, and let AI generate a complete starter project for you.
            </p>
          </div>
          
          <PromptForm onGenerate={handleGenerateProject} isLoading={isLoading} />

          {error && (
            <div className="mt-10 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
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
      
      <footer className="bg-white/70 dark:bg-gray-950/70 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Powered by Gemini 2.5 Pro
        </div>
      </footer>

      {showHistory && (
        <ProjectHistory
          onLoadProject={handleLoadProject}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showSaveDialog && (
        <SaveProjectDialog
          onSave={handleSaveProject}
          onCancel={() => setShowSaveDialog(false)}
          defaultName={projectOptions?.description.slice(0, 50) || ''}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;