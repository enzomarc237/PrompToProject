import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileNode, File as FileType } from '../types';
import { FolderIcon, FileIcon, ClipboardIcon, CheckIcon, ArrowDownTrayIcon, ChevronDownIcon, ChevronRightIcon } from './icons/Icons';

declare global {
  interface Window {
    JSZip: any;
    hljs: any;
  }
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

// Custom hook to manage the state of the recursive file tree (expanded/collapsed folders)
const useFileTreeState = () => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = useCallback((path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    }, []);

    return { expandedFolders, toggleFolder };
};

// Recursive component to render a single node (file or folder) in the tree
const TreeNode: React.FC<{
    node: FileNode;
    level: number;
    currentPath: string;
    onSelectFile: (file: FileType) => void;
    selectedFile: FileType | null;
    expandedFolders: Set<string>;
    toggleFolder: (path: string) => void;
}> = ({ node, level, currentPath, onSelectFile, selectedFile, expandedFolders, toggleFolder }) => {
    const isExpanded = expandedFolders.has(currentPath);

    if (node.type === 'folder') {
        return (
            <li>
                <button
                    onClick={() => toggleFolder(currentPath)}
                    className="w-full text-left flex items-center space-x-2 p-1 rounded-md transition-colors text-gray-400 hover:bg-gray-700/50"
                    style={{ paddingLeft: `${level * 1.25}rem` }}
                >
                    {isExpanded ? <ChevronDownIcon className="h-4 w-4 flex-shrink-0" /> : <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />}
                    <FolderIcon className="h-5 w-5 flex-shrink-0" />
                    <span>{node.name}</span>
                </button>
                {isExpanded && (
                    <ul className="space-y-1">
                        {node.children.sort((a,b) => {
                            if (a.type === 'folder' && b.type === 'file') return -1;
                            if (a.type === 'file' && b.type === 'folder') return 1;
                            return a.name.localeCompare(b.name);
                        }).map(childNode => (
                            <TreeNode
                                key={childNode.name}
                                node={childNode}
                                level={level + 1}
                                currentPath={`${currentPath}/${childNode.name}`}
                                onSelectFile={onSelectFile}
                                selectedFile={selectedFile}
                                expandedFolders={expandedFolders}
                                toggleFolder={toggleFolder}
                            />
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    // It's a file
    return (
        <li style={{ paddingLeft: `${(level * 1.25)}rem` }}>
             <button 
                onClick={() => onSelectFile(node)} 
                className={`w-full text-left flex items-center space-x-2 p-1 rounded-md transition-colors ${selectedFile?.name === node.name && selectedFile?.content === node.content ? 'bg-indigo-900/50 text-white' : 'hover:bg-gray-700/50 text-gray-300'}`}
             >
                <FileIcon className="h-5 w-5 flex-shrink-0 ml-4" />
                <span>{node.name}</span>
            </button>
        </li>
    );
};

// The main component that initializes the tree state and renders the root nodes
const FileTreeView: React.FC<{ nodes: FileNode[]; onSelectFile: (file: FileType) => void; selectedFile: FileType | null; }> = ({ nodes, onSelectFile, selectedFile }) => {
    const { expandedFolders, toggleFolder } = useFileTreeState();
    
    return (
        <ul className="space-y-1">
            {nodes.sort((a,b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            }).map(node => (
                <TreeNode
                    key={node.name}
                    node={node}
                    level={0}
                    currentPath={node.name}
                    onSelectFile={onSelectFile}
                    selectedFile={selectedFile}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                />
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

interface ResultsDisplayProps {
  files: FileNode[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ files }) => {
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
          <FileTreeView nodes={files} onSelectFile={setSelectedFile} selectedFile={selectedFile} />
        </div>
        <div className="w-2/3 flex-grow">
          <CodeViewer file={selectedFile} />
        </div>
      </div>
    </>
  );
};