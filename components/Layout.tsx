import React, { useState } from 'react';
import {
    CodeBracketSquareIcon,
    SunIcon,
    MoonIcon,
    PlusIcon,
    FolderIcon,
    Cog6ToothIcon,
    SparklesIcon
} from './icons/Icons';

interface LayoutProps {
    children: React.ReactNode;
    user: { name: string; email?: string } | null;
    onLogout: () => void;
    theme: 'light' | 'dark';
    onThemeSwitch: () => void;
    onNewProject: () => void;
    onShowHistory: () => void;
    onShowSettings: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    user,
    onLogout,
    theme,
    onThemeSwitch,
    onNewProject,
    onShowHistory,
    onShowSettings
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
                        <CodeBracketSquareIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-500 mr-3" />
                        <span className="text-lg font-bold tracking-tight">Prompt2Project</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <button
                            onClick={() => { onNewProject(); setIsSidebarOpen(false); }}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm mb-6 group"
                        >
                            <PlusIcon className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform" />
                            New Project
                        </button>

                        <div className="space-y-1">
                            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
                            <button
                                onClick={() => { onShowHistory(); setIsSidebarOpen(false); }}
                                className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <FolderIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                                Project History
                            </button>
                            <button
                                onClick={() => { onShowSettings(); setIsSidebarOpen(false); }}
                                className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                                Settings
                            </button>
                        </div>
                    </nav>

                    {/* User & Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Free Plan</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <button
                                onClick={onThemeSwitch}
                                className="flex-1 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex justify-center"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex-1 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors text-xs font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 z-30">
                    <div className="flex items-center">
                        <CodeBracketSquareIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-500 mr-2" />
                        <span className="font-bold">Prompt2Project</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
