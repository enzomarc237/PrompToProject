import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FileNode, File as FileType } from '../types';
import { FolderIcon, FileIcon, ClipboardIcon, CheckIcon, ArrowDownTrayIcon, ChevronDownIcon, ChevronRightIcon, ScissorsIcon, JsIcon, TsIcon, HtmlIcon, CssIcon, JsonIcon, MarkdownIcon, NpmIcon, GitIcon, TailwindIcon, ViteIcon, FlutterIcon, SwiftIcon, KotlinIcon, FirebaseIcon, TagIcon, DocumentTextIcon, CodeBracketSquareIcon } from './icons/Icons';
import ErrorBoundary from './ErrorBoundary';
import { generateCodeSnippet } from '../services/geminiService';

declare global {
  interface Window {
    JSZip: any;
    hljs: any;
  }
}

// --- Helpers & Types ---

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
    case 'dart':
      return 'dart';
    case 'swift':
      return 'swift';
    case 'kt':
    case 'kts':
      return 'kotlin';
    case 'html':
      return 'xml';
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

const getFileIconComponent = (fileName: string): React.FC<React.SVGProps<SVGSVGElement>> => {
    if (fileName === 'package.json') return NpmIcon;
    if (fileName === '.gitignore') return GitIcon;
    if (fileName.includes('tailwind.config')) return TailwindIcon;
    if (fileName.includes('vite.config')) return ViteIcon;
    if (fileName === 'firebase.json' || fileName === '.firebaserc') return FirebaseIcon;
    if (fileName === 'pubspec.yaml') return FlutterIcon;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'jsx':
            return JsIcon;
        case 'ts':
        case 'tsx':
            return TsIcon;
        case 'dart':
            return FlutterIcon;
        case 'swift':
            return SwiftIcon;
        case 'kt':
        case 'kts':
            return KotlinIcon;
        case 'html':
            return HtmlIcon;
        case 'css':
        case 'scss':
        case 'sass':
            return CssIcon;
        case 'json':
            return JsonIcon;
        case 'md':
            return MarkdownIcon;
        default:
            return FileIcon;
    }
};

// Helper hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Flatten helper for search indexing
type FlatNode = {
    path: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    node: FileNode;
    parentPath: string | null;
};

const flattenProject = (nodes: FileNode[], parentPath = ''): FlatNode[] => {
    let results: FlatNode[] = [];
    for (const node of nodes) {
        const path = parentPath ? `${parentPath}/${node.name}` : node.name;
        results.push({
            path,
            name: node.name,
            type: node.type,
            content: node.type === 'file' ? node.content : undefined,
            node,
            parentPath: parentPath || null
        });
        if (node.type === 'folder') {
            results = results.concat(flattenProject(node.children, path));
        }
    }
    return results;
};

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

    return { expandedFolders, toggleFolder, setExpandedFolders };
};

// --- Components ---

const TreeNode: React.FC<{
    node: FileNode;
    level: number;
    currentPath: string;
    onSelectFile: (file: FileType) => void;
    selectedFile: FileType | null;
    expandedFolders: Set<string>;
    toggleFolder: (path: string) => void;
    visiblePaths: Set<string> | null; // null means show all
}> = ({ node, level, currentPath, onSelectFile, selectedFile, expandedFolders, toggleFolder, visiblePaths }) => {
    // Performance optimization: If visiblePaths is set and this node isn't in it, don't render.
    if (visiblePaths && !visiblePaths.has(currentPath)) {
        return null;
    }

    const isExpanded = expandedFolders.has(currentPath);
    const paddingLeft = `${level * 1.25 + 0.5}rem`;

    if (node.type === 'folder') {
        return (
            <li>
                <button
                    onClick={() => toggleFolder(currentPath)}
                    className="w-full text-left flex items-center space-x-1.5 py-1.5 pr-2 rounded-sm transition-colors text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:bg-gray-800 text-sm font-medium"
                    style={{ paddingLeft }}
                    aria-expanded={isExpanded}
                    role="treeitem"
                >
                    {isExpanded ? <ChevronDownIcon className="h-3.5 w-3.5 flex-shrink-0" /> : <ChevronRightIcon className="h-3.5 w-3.5 flex-shrink-0" />}
                    <FolderIcon className={`h-4 w-4 flex-shrink-0 ${isExpanded ? 'text-indigo-400' : 'text-indigo-500/80'}`} />
                    <span className="truncate">{node.name}</span>
                </button>
                {isExpanded && (
                    <ul role="group">
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
                                visiblePaths={visiblePaths}
                            />
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    const FileIconComponent = getFileIconComponent(node.name);
    const isSelected = selectedFile?.name === node.name && selectedFile?.content === node.content;
    
    return (
        <li style={{ paddingLeft }}>
             <button 
                onClick={() => onSelectFile(node)} 
                className={`w-full text-left flex items-center space-x-2 py-1.5 pr-2 rounded-sm transition-colors text-sm ${isSelected ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                role="treeitem"
             >
                <FileIconComponent className="h-4 w-4 flex-shrink-0 ml-4" />
                <span className="truncate">{node.name}</span>
            </button>
        </li>
    );
};

const FileTreeView: React.FC<{
    nodes: FileNode[];
    onSelectFile: (file: FileType) => void;
    selectedFile: FileType | null;
    expandedFolders: Set<string>;
    toggleFolder: (path: string) => void;
    visiblePaths: Set<string> | null;
}> = ({ nodes, onSelectFile, selectedFile, expandedFolders, toggleFolder, visiblePaths }) => {
    const treeRef = useRef<HTMLUListElement>(null);

    // Basic keyboard navigation (could be enhanced to support deep nesting better)
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
            return;
        }
        e.preventDefault();

        const focusableNodes = Array.from(
            treeRef.current?.querySelectorAll('button[role="treeitem"]') ?? []
        ) as HTMLElement[];

        // Filter out hidden nodes from focus list if needed, though DOM query handles display:none usually
        const visibleFocusable = focusableNodes.filter(el => el.offsetParent !== null);

        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = visibleFocusable.indexOf(activeElement);

        if (currentIndex === -1 && visibleFocusable.length > 0) {
            visibleFocusable[0].focus();
            return;
        }

        let nextIndex = -1;
        if (e.key === 'ArrowDown') {
            nextIndex = currentIndex + 1;
        } else if (e.key === 'ArrowUp') {
            nextIndex = currentIndex - 1;
        }

        if (nextIndex >= 0 && nextIndex < visibleFocusable.length) {
            visibleFocusable[nextIndex].focus();
        }
    }, []);

    // If search returns no results
    const hasVisibleNodes = visiblePaths === null || nodes.some(node => visiblePaths.has(node.name));

    return (
        <ul className="space-y-0.5" role="tree" ref={treeRef} onKeyDown={handleKeyDown}>
            {!hasVisibleNodes && (
                <li className="p-4 text-sm text-gray-500 text-center italic">No matching files found.</li>
            )}
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
                    visiblePaths={visiblePaths}
                />
            ))}
        </ul>
    );
};


const CodeViewer: React.FC<{ file: FileType | null; searchQuery: string }> = ({ file, searchQuery }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const codeElement = codeRef.current;
        if (!codeElement || !window.hljs || !file) {
            return;
        }

        codeElement.className = `language-${getLanguageFromFileName(file.name)}`;
        codeElement.textContent = file.content;
        window.hljs.highlightElement(codeElement);
        
        if (!searchQuery.trim()) return;

        // Highlight search terms within the code viewer as well
        try {
            const regex = new RegExp(searchQuery.trim(), 'gi');
            const walker = document.createTreeWalker(codeElement, NodeFilter.SHOW_TEXT);
            const textNodes: Text[] = [];
            while (walker.nextNode()) {
                textNodes.push(walker.currentNode as Text);
            }

            textNodes.forEach(node => {
                if (!node.textContent || !node.parentNode) return;
                if (node.parentNode.nodeName === 'MARK') return;

                const matches = [...node.textContent.matchAll(regex)];
                if (matches.length > 0) {
                    const fragment = document.createDocumentFragment();
                    let lastIndex = 0;
                    matches.forEach(match => {
                        const index = match.index ?? 0;
                        const matchedText = match[0];
                        if (index > lastIndex) {
                            fragment.appendChild(document.createTextNode(node.textContent!.substring(lastIndex, index)));
                        }
                        const mark = document.createElement('mark');
                        mark.className = 'search-highlight';
                        mark.textContent = matchedText;
                        fragment.appendChild(mark);
                        lastIndex = index + matchedText.length;
                    });
                    if (lastIndex < node.textContent.length) {
                        fragment.appendChild(document.createTextNode(node.textContent.substring(lastIndex)));
                    }
                    node.parentNode.replaceChild(fragment, node);
                }
            });
        } catch (e) {
            // Ignore invalid regex errors during typing
        }
    }, [file, searchQuery]);
    
    const handleCopy = () => {
        if (file) {
            navigator.clipboard.writeText(file.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    if (!file) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-gray-400 bg-gray-50 dark:bg-[#1e1e1e] rounded-br-xl">
                <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <CodeBracketSquareIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-lg font-medium">Select a file to view its content</p>
                <p className="text-sm text-gray-500 mt-2">Click on any file in the sidebar to start editing</p>
            </div>
        );
    }

    const language = getLanguageFromFileName(file.name);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] rounded-none">
            {/* Code Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[#2b2b2b] bg-gray-50 dark:bg-[#252526]">
                <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {language}
                    </span>
                    <span className="font-mono text-sm text-gray-700 dark:text-gray-200">{file.name}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-700 dark:text-gray-300"
                >
                    {copied ? <CheckIcon className="h-3.5 w-3.5 text-green-500" /> : <ClipboardIcon className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
            </div>
            
            {/* Code Content */}
            <div className="flex-grow overflow-auto relative">
                 <pre className="text-sm font-mono leading-relaxed p-4 m-0 h-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-[#d4d4d4]">
                    <code ref={codeRef} className={`language-${language} !bg-transparent !p-0`}>{file.content}</code>
                 </pre>
            </div>
        </div>
    );
};

interface ResultsDisplayProps {
  files: FileNode[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchInName, setSearchInName] = useState(true);
  const [searchInContent, setSearchInContent] = useState(false);
  
  // File Tree State
  const { expandedFolders, toggleFolder, setExpandedFolders } = useFileTreeState();
  
  // Snippet States
  const [snippetDescription, setSnippetDescription] = useState('');
  const [generatedSnippet, setGeneratedSnippet] = useState<string | null>(null);
  const [isGeneratingSnippet, setIsGeneratingSnippet] = useState(false);
  const [snippetError, setSnippetError] = useState<string | null>(null);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const snippetCodeRef = useRef<HTMLElement>(null);

  // 1. Flatten project structure for efficient searching
  const flatNodes = useMemo(() => flattenProject(files), [files]);

  // 2. Perform Search Logic (filtering the flat list)
  const visiblePaths = useMemo(() => {
      if (!debouncedSearchQuery.trim() || (!searchInName && !searchInContent)) {
          return null; // null indicates "show all"
      }

      const lowerQuery = debouncedSearchQuery.toLowerCase();
      const matchedPaths = new Set<string>();

      flatNodes.forEach(item => {
          let isMatch = false;
          if (searchInName && item.name.toLowerCase().includes(lowerQuery)) {
              isMatch = true;
          } else if (searchInContent && item.type === 'file' && item.content?.toLowerCase().includes(lowerQuery)) {
              isMatch = true;
          }

          if (isMatch) {
              matchedPaths.add(item.path);
              
              // Add all ancestors
              let parent = item.parentPath;
              while (parent) {
                  matchedPaths.add(parent);
                  // Simple string manipulation to find parent's parent path
                  const lastSlash = parent.lastIndexOf('/');
                  parent = lastSlash > -1 ? parent.substring(0, lastSlash) : null;
              }
          }
      });

      return matchedPaths;
  }, [flatNodes, debouncedSearchQuery, searchInName, searchInContent]);

  // 3. Auto-expand folders when search has results
  useEffect(() => {
      if (visiblePaths) {
          // Filter out files from the visible paths to get just folders to expand
          const foldersToExpand = new Set<string>();
          visiblePaths.forEach(path => {
              // We can check against flatNodes to see if it's a folder, 
              // or just rely on the fact that only folders have children in the tree.
              // Simpler: expand everything in the set. Leaf nodes (files) in expandedFolders set is harmless.
              foldersToExpand.add(path);
          });
          setExpandedFolders(foldersToExpand);
      } else {
          // Optional: Collapse all or revert to previous state when search clears?
          // For now, let's keep user's expanded state or collapse all.
          // setExpandedFolders(new Set()); // Uncomment to collapse on clear
      }
  }, [visiblePaths, setExpandedFolders]);

  useEffect(() => {
      setSnippetDescription('');
      setGeneratedSnippet(null);
      setIsGeneratingSnippet(false);
      setSnippetError(null);
  }, [selectedFile]);

  useEffect(() => {
    if (snippetCodeRef.current && generatedSnippet && selectedFile) {
        snippetCodeRef.current.className = `language-${getLanguageFromFileName(selectedFile.name)}`;
        snippetCodeRef.current.textContent = generatedSnippet;
        window.hljs.highlightElement(snippetCodeRef.current);
    }
  }, [generatedSnippet, selectedFile]);
  
  const handleGenerateSnippet = useCallback(async () => {
    if (!selectedFile || !snippetDescription.trim()) return;

    setIsGeneratingSnippet(true);
    setSnippetError(null);
    setGeneratedSnippet(null);

    try {
        const snippet = await generateCodeSnippet(selectedFile.content, snippetDescription);
        setGeneratedSnippet(snippet);
    } catch (err) {
        setSnippetError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsGeneratingSnippet(false);
    }
  }, [selectedFile, snippetDescription]);

  const handleCopySnippet = () => {
    if (generatedSnippet) {
        navigator.clipboard.writeText(generatedSnippet);
        setSnippetCopied(true);
        setTimeout(() => setSnippetCopied(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    if (!files || !window.JSZip) {
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
        link.download = 'gemini-project.zip';
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Project Files</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Browse the generated codebase and AI-extracted snippets.</p>
        </div>
        <button
          onClick={handleDownloadZip}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 rounded-lg shadow-lg shadow-gray-900/10 dark:shadow-indigo-500/20 transition-all"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Download ZIP</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden h-[75vh] flex flex-col md:flex-row">
        
        {/* Sidebar / File Tree */}
        <div className="w-full md:w-80 bg-gray-900 dark:bg-[#252526] flex flex-col border-b md:border-b-0 md:border-r border-gray-800">
          <div className="p-3 border-b border-gray-800 space-y-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {/* Loading indicator for debounce */}
                    {searchQuery !== debouncedSearchQuery && (
                         <div className="absolute right-2 top-1.5">
                            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                         </div>
                    )}
                </div>
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Explorer</span>
                    <div className="flex space-x-1">
                        <button 
                            onClick={() => setSearchInName(prev => !prev)}
                            className={`p-1 rounded transition-colors ${searchInName ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Search in file name"
                        >
                            <TagIcon className="h-3.5 w-3.5" />
                        </button>
                        <button 
                            onClick={() => setSearchInContent(prev => !prev)}
                            className={`p-1 rounded transition-colors ${searchInContent ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                            title="Search in file content"
                        >
                            <DocumentTextIcon className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
          </div>
          <div className="p-2 overflow-y-auto flex-grow custom-scrollbar">
            <FileTreeView
                nodes={files} // Pass the full tree
                onSelectFile={setSelectedFile}
                selectedFile={selectedFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                visiblePaths={visiblePaths} // Pass the filter set
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col min-w-0 bg-white dark:bg-[#1e1e1e]">
          <div className="flex-grow min-h-0 relative">
             <div className="absolute inset-0">
                <ErrorBoundary>
                   <CodeViewer file={selectedFile} searchQuery={debouncedSearchQuery} />
                </ErrorBoundary>
             </div>
          </div>
          
          {/* Snippet Tool Panel */}
          {selectedFile && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-[#2b2b2b] bg-gray-50 dark:bg-[#1e1e1e]">
               <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-200">
                        <ScissorsIcon className="h-4 w-4 text-indigo-500" />
                        <h4 className="font-semibold text-sm uppercase tracking-wide">AI Code Extraction</h4>
                    </div>
                    
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={snippetDescription}
                            onChange={(e) => setSnippetDescription(e.target.value)}
                            placeholder="Describe code to extract (e.g. 'the Submit button handler')"
                            className="flex-grow bg-white dark:bg-[#252526] border border-gray-200 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white px-3 py-2 disabled:opacity-50"
                            disabled={isGeneratingSnippet}
                        />
                        <button 
                            onClick={handleGenerateSnippet} 
                            disabled={isGeneratingSnippet || !snippetDescription.trim()} 
                            className="flex-shrink-0 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isGeneratingSnippet ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Extract"
                            )}
                        </button>
                    </div>

                    {snippetError && (
                        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800">
                           {snippetError}
                        </div>
                    )}

                    {generatedSnippet && (
                        <div className="relative group mt-2">
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleCopySnippet}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                                >
                                    {snippetCopied ? <CheckIcon className="h-3 w-3 text-green-400" /> : <ClipboardIcon className="h-3 w-3" />}
                                    <span>{snippetCopied ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>
                            <div className="max-h-40 overflow-auto bg-[#2d2d2d] rounded-md p-3 border border-gray-700 shadow-inner">
                                <pre className="text-xs font-mono m-0"><code ref={snippetCodeRef} className={`language-${getLanguageFromFileName(selectedFile.name)}`}></code></pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};