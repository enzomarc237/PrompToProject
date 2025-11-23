import React, { useState, useCallback, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { AuthForm } from './components/AuthForm';
import { ProjectHistory } from './components/ProjectHistory';
import { SaveProjectDialog } from './components/SaveProjectDialog';
import { Toast } from './components/Toast';
import { CodeBracketSquareIcon, SunIcon, MoonIcon, ArrowDownTrayIcon } from './components/icons/Icons';
import { generateProjectStructure } from './services/generationService';
import { projectHistoryService } from './services/projectHistoryService';
import { useAuth } from './contexts/AuthContext';
import { FileNode, ProjectOptions, SavedProject } from './types';
import { LLMSettingsProvider, useLLMSettings } from './contexts/LLMSettingsContext';
import { Settings } from './components/Settings';
import { Layout } from './components/Layout';
import { GenerationProgress } from './components/GenerationProgress';



type Theme = 'light' | 'dark';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<FileNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectOptions, setProjectOptions] = useState<ProjectOptions | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  const { settings: llmSettings } = useLLMSettings();

  const handleGenerateProject = useCallback(async (options: ProjectOptions) => {
    setIsLoading(true);
    setError(null);
    setGeneratedFiles(null);
    setProjectOptions(options);
    setCurrentProjectId(null);
    try {
      const files = await generateProjectStructure(options, llmSettings);
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
  }, [user, llmSettings]);

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

  const handleDownloadZip = async () => {
    if (!generatedFiles || !(window as any).JSZip) {
      console.error("Files not available or JSZip not loaded.");
      return;
    }

    const zip = new (window as any).JSZip();

    const addFilesToZip = (zipFolder: any, nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'folder') {
          const newFolder = zipFolder.folder(node.name);
          if (node.children.length > 0) {
            addFilesToZip(newFolder, node.children);
          }
        } else {
          zipFolder.file(node.name, node.content);
        }
      });
    };

    addFilesToZip(zip, generatedFiles);

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${projectOptions?.description.slice(0, 20).trim().replace(/\s+/g, '-') || 'project'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setToast({ message: 'Project downloaded successfully!', type: 'success' });
    } catch (e) {
      console.error("Error generating zip file:", e);
      setToast({ message: 'Failed to generate zip file', type: 'error' });
    }
  };

  const handleNewProject = () => {
    setGeneratedFiles(null);
    setProjectOptions(null);
    setCurrentProjectId(null);
    setError(null);
  };

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Layout
      user={user}
      onLogout={logout}
      theme={theme}
      onThemeSwitch={handleThemeSwitch}
      onNewProject={handleNewProject}
      onShowHistory={() => setShowHistory(true)}
      onShowSettings={() => setShowSettings(true)}
    >
      <div className="max-w-4xl mx-auto">
        {!generatedFiles && (
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
              Turn Your Idea Into Code
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Describe your application, select your tech stack, and let AI generate a complete starter project for you.
            </p>
          </div>
        )}

        <PromptForm onGenerate={handleGenerateProject} isLoading={isLoading} />

        {error && (
          <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg animate-fade-in" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Error</h3>
                <div className="mt-2 text-sm">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          {isLoading && projectOptions && <GenerationProgress details={projectOptions} />}
          {generatedFiles && !isLoading && (
            <div className="animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Generated Project</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownloadZip}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Save Project
                  </button>
                </div>
              </div>
              <ResultsDisplay files={generatedFiles} />
            </div>
          )}
        </div>
      </div>

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

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl max-w-lg w-full mx-4 border border-gray-200 dark:border-gray-800 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Settings />
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LLMSettingsProvider>
      <AppContent />
    </LLMSettingsProvider>
  );
};

export default App;