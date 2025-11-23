import React, { useState, useEffect, useRef } from 'react';
import { ProjectOptions } from '../types';

const SkeletonLoader = () => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden h-[70vh] flex flex-col font-mono text-sm">
        {/* IDE Header */}
        <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 space-x-2">
            <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 text-center text-gray-400 text-xs">Project Pulse - VS Code</div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 hidden md:block">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">Explorer</div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-2 animate-pulse">
                            <div className="w-4 h-4 bg-gray-700 rounded"></div>
                            <div className={`h-4 bg-gray-700 rounded ${['w-20', 'w-32', 'w-24', 'w-28', 'w-16'][i]}`}></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-gray-900">
                {/* Tabs */}
                <div className="h-9 bg-gray-800 border-b border-gray-700 flex">
                    <div className="w-32 bg-gray-900 border-r border-gray-700 flex items-center px-3 border-t-2 border-t-blue-500">
                        <div className="w-20 h-3 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Code Area */}
                <div className="p-6 space-y-3 flex-1 overflow-hidden relative">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="flex space-x-4 animate-pulse opacity-50">
                            <div className="w-8 text-right text-gray-600 select-none">{i + 1}</div>
                            <div className={`h-4 bg-gray-800 rounded ${['w-1/3', 'w-1/2', 'w-1/4', 'w-3/4', 'w-1/2', 'w-5/6', 'w-1/3', 'w-2/3', 'w-1/4', 'w-1/2', 'w-1/3', 'w-1/4'][i]
                                }`}></div>
                        </div>
                    ))}

                    {/* Floating Processing Badge */}
                    <div className="absolute bottom-6 right-6 bg-blue-600 text-white px-3 py-1 rounded-full text-xs shadow-lg animate-bounce">
                        Processing...
                    </div>
                </div>

                {/* Terminal Panel */}
                <div className="h-1/3 border-t border-gray-700 bg-black p-4 font-mono text-xs overflow-hidden relative">
                    <div className="flex justify-between items-center mb-2 text-gray-400 border-b border-gray-800 pb-1">
                        <div className="flex space-x-4">
                            <span className="text-white border-b border-white">TERMINAL</span>
                            <span>OUTPUT</span>
                            <span>DEBUG CONSOLE</span>
                        </div>
                    </div>
                    <div className="space-y-1 text-green-400 opacity-80">
                        <div>$ npm install</div>
                        <div className="text-gray-400">added 142 packages in 3s</div>
                        <div>$ npm run dev</div>
                        <div className="text-gray-400">ready in 245ms</div>
                        <div className="animate-pulse">_</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const GENERATION_STEPS = [
    { label: 'Analyzing Requirements', duration: 2000 },
    { label: 'Designing Architecture', duration: 2500 },
    { label: 'Scaffolding Project Structure', duration: 3000 },
    { label: 'Configuring Dependencies', duration: 2000 },
    { label: 'Writing Source Code', duration: 4000 },
    { label: 'Polishing UI Components', duration: 2500 },
    { label: 'Finalizing Project', duration: 2000 },
];

const LOG_MESSAGES = [
    "Initializing project workspace...",
    "Parsing user requirements...",
    "Selecting optimal technology stack...",
    "Configuring TypeScript environment...",
    "Setting up Tailwind CSS...",
    "Generating core components...",
    "Implementing routing logic...",
    "Creating service layers...",
    "Optimizing build configuration...",
    "Running initial linting checks...",
    "Formatting code structure...",
    "Validating component hierarchy...",
    "Preparing final bundle...",
];

export const GenerationProgress: React.FC<{ details: ProjectOptions }> = ({ details }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const stackDisplay = details.stack === 'Custom'
        ? `${details.frontend} + ${details.backend}`
        : details.stack;

    // Progress and Step Logic
    useEffect(() => {
        let stepTimeout: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        const runSteps = (index: number) => {
            if (index >= GENERATION_STEPS.length) return;

            const step = GENERATION_STEPS[index];
            setCurrentStepIndex(index);

            // Calculate progress increment for this step
            const startProgress = (index / GENERATION_STEPS.length) * 100;
            const endProgress = ((index + 1) / GENERATION_STEPS.length) * 100;
            const duration = step.duration;
            const intervalTime = 50;
            const steps = duration / intervalTime;
            const increment = (endProgress - startProgress) / steps;

            let currentStepProgress = 0;

            progressInterval = setInterval(() => {
                currentStepProgress++;
                setProgress(prev => Math.min(prev + increment, 99)); // Cap at 99 until done
                if (currentStepProgress >= steps) clearInterval(progressInterval);
            }, intervalTime);

            stepTimeout = setTimeout(() => {
                clearInterval(progressInterval);
                runSteps(index + 1);
            }, duration);
        };

        runSteps(0);

        return () => {
            clearTimeout(stepTimeout);
            clearInterval(progressInterval);
        };
    }, []);

    // Log Simulation Logic
    useEffect(() => {
        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < LOG_MESSAGES.length) {
                setLogs(prev => [...prev, LOG_MESSAGES[logIndex]]);
                logIndex++;
            } else {
                // Loop logs or add random "processing" logs
                const randomFiles = ['utils.ts', 'App.tsx', 'index.css', 'api.ts', 'types.ts'];
                const randomAction = ['Updating', 'Verifying', 'Optimizing', 'Linking'];
                const file = randomFiles[Math.floor(Math.random() * randomFiles.length)];
                const action = randomAction[Math.floor(Math.random() * randomAction.length)];
                setLogs(prev => [...prev, `${action} ${file}...`]);
            }
        }, 800);

        return () => clearInterval(logInterval);
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const currentStep = GENERATION_STEPS[currentStepIndex] || GENERATION_STEPS[GENERATION_STEPS.length - 1];

    return (
        <div className="animate-fade-in relative min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Generating Project</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Gemini is architecting your application</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {Math.round(progress)}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {currentStep.label}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Status & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Current Action Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500"></div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Status</h4>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 animate-pulse">{currentStep.label}...</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {GENERATION_STEPS.map((step, idx) => (
                                    <div key={idx} className="flex items-center text-sm">
                                        <div className={`w-2 h-2 rounded-full mr-3 ${idx < currentStepIndex ? 'bg-green-500' :
                                                idx === currentStepIndex ? 'bg-indigo-500 animate-pulse' :
                                                    'bg-gray-300 dark:bg-gray-600'
                                            }`}></div>
                                        <span className={`${idx <= currentStepIndex ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Project Details Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Configuration</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Stack</span>
                                    <span className="font-medium text-indigo-600 dark:text-indigo-400 text-right">{stackDisplay}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Pattern</span>
                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{details.pattern}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Auth</span>
                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{details.auth}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: IDE Preview & Terminal */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative">
                            <SkeletonLoader />

                            {/* Overlay Terminal for "Real-time" feel */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md rounded-b-lg border-t border-gray-700 p-4 font-mono text-xs h-48 overflow-hidden flex flex-col">
                                <div className="flex justify-between items-center mb-2 text-gray-500 text-[10px] uppercase tracking-wider">
                                    <span>Build Log</span>
                                    <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div> Live</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                                    {logs.map((log, i) => (
                                        <div key={i} className="text-gray-300">
                                            <span className="text-blue-500 mr-2">➜</span>
                                            {log}
                                        </div>
                                    ))}
                                    <div ref={logsEndRef} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

