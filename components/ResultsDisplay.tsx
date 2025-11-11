import React, { useState, useEffect, useRef } from 'react';
import { FileNode, File as FileType } from '../types';
import { FolderIcon, FileIcon, ClipboardIcon, CheckIcon, ArrowDownTrayIcon } from './icons/Icons';

declare global {
  interface Window {
    JSZip: any;
    hljs: any;
  }
}

interface ResultsDisplayProps {
  files: FileNode[] | null;
  isLoading: boolean;
}

const getLanguageFromFileName = (fileName: string): string => {
  if (fileName.toLowerCase() === 'dockerfile') return 'dockerfile';
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'html':
      return 'xml'; // highlight.js uses 'xml' for html
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'sh':
      return 'bash';
    case 'yml':
    case 'yaml':
      return 'yaml';
    default:
      return 'plaintext';
  }
};

const FileTree: React.FC<{ nodes: FileNode[]; onSelectFile: (file: FileType) => void; selectedFile: FileType | null; level?: number; }> = ({ nodes, onSelectFile, selectedFile, level = 0 }) => {
    return (
        <ul className="space-y-1">
            {nodes.sort((a,b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            }).map(node => (
                <li key={`${node.name}-${level}`} style={{ paddingLeft: `${level * 1.25}rem`}}>
                    {node.type === 'folder' ? (
                        <div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <FolderIcon className="h-5 w-5 flex-shrink-0" />
                                <span>{node.name}</span>
                            </div>
                            <FileTree nodes={node.children} onSelectFile={onSelectFile} selectedFile={selectedFile} level={level + 1} />
                        </div>
                    ) : (
                        <button 
                            onClick={() => onSelectFile(node)} 
                            className={`w-full text-left flex items-center space-x-2 p-1 rounded-md transition-colors ${selectedFile?.name === node.name && selectedFile?.content === node.content ? 'bg-indigo-900/50 text-white' : 'hover:bg-gray-700/50 text-gray-300'}`}
                        >
                            <FileIcon className="h-5 w-5 flex-shrink-0" />
                            <span>{node.name}</span>
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );
};

const CodeViewer: React.FC<{ file: FileType | null }> = ({ file }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current && window.hljs) {
            window.hljs.highlightElement(codeRef.current);
        }
    }, [file]);

    const handleCopy = () => {
        if (file) {
            navigator.clipboard.writeText(file.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    if (!file) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500">
                <p>Select a file to view its content</p>
            </div>
        );
    }

    const language = getLanguageFromFileName(file.name);

    return (
        <div className="flex flex-col h-full bg-gray-950 rounded-lg">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
                <span className="font-mono text-sm text-gray-300">{file.name}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-gray-300"
                >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardIcon className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
            <div className="flex-grow overflow-auto p-4">
                 <pre className="text-sm bg-transparent p-0 m-0"><code ref={codeRef} className={`language-${language}`}>{file.content}</code></pre>
            </div>
        </div>
    );
};

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


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ files, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  const handleDownloadZip = async () => {
    if (!files || !window.JSZip) {
        console.error("Files not available or JSZip not loaded.");
        return;
    }

    const zip = new window.JSZip();

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
    
    addFilesToZip(zip, files);

    try {
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'project.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (e) {
        console.error("Error generating zip file:", e);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">Generating Project...</h3>
        </div>
        <SkeletonLoader />
      </>
    );
  }

  if (!files) {
      return null;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-white">Generated Project</h3>
        <button
          onClick={handleDownloadZip}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Download .zip</span>
        </button>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden h-[70vh] flex">
        <div className="w-1/3 min-w-[250px] max-w-[400px] bg-gray-900 p-4 overflow-y-auto">
          <FileTree nodes={files} onSelectFile={setSelectedFile} selectedFile={selectedFile} />
        </div>
        <div className="w-2/3 flex-grow">
          <CodeViewer file={selectedFile} />
        </div>
      </div>
    </>
  );
};