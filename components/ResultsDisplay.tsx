import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FileNode, File as FileType } from '../types';
import { FolderIcon, FileIcon, ClipboardIcon, CheckIcon, ArrowDownTrayIcon, ChevronDownIcon, ChevronRightIcon, JsIcon, TsIcon, HtmlIcon, CssIcon, JsonIcon, MarkdownIcon, NpmIcon, GitIcon, TailwindIcon, ViteIcon, FlutterIcon, SwiftIcon, KotlinIcon, FirebaseIcon, TagIcon, DocumentTextIcon } from './icons/Icons';

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
    case 'dart':
      return 'dart';
    case 'swift':
      return 'swift';
    case 'kt':
    case 'kts':
      return 'kotlin';
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
                    className="w-full text-left flex items-center space-x-2 p-1 rounded-md transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-200 dark:focus:bg-gray-700/50"
                    style={{ paddingLeft: `${level * 1.25}rem` }}
                    aria-expanded={isExpanded}
                    role="treeitem"
                >
                    {isExpanded ? <ChevronDownIcon className="h-4 w-4 flex-shrink-0" /> : <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />}
                    <FolderIcon className="h-5 w-5 flex-shrink-0 text-sky-500 dark:text-sky-400" />
                    <span>{node.name}</span>
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
        <li style={{ paddingLeft: `${(level * 1.25)}rem` }}>
             <button 
                onClick={() => onSelectFile(node)} 
                className={`w-full text-left flex items-center space-x-2 p-1 rounded-md transition-colors ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-200 dark:focus:bg-gray-700/50`}
                role="treeitem"
             >
                <FileIconComponent className="h-5 w-5 flex-shrink-0 ml-4" />
                <span>{node.name}</span>
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
}> = ({ nodes, onSelectFile, selectedFile, expandedFolders, toggleFolder }) => {
    const treeRef = useRef<HTMLUListElement>(null);

    // Fix: Correctly type focusable nodes and handle active element to prevent TS errors.
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
            return;
        }
        e.preventDefault();

        const focusableNodes = Array.from(
            treeRef.current?.querySelectorAll('[role="treeitem"]') ?? []
        ) as HTMLElement[];

        const activeElement = document.activeElement;
        const currentIndex = focusableNodes.findIndex(node => node === activeElement);

        if (currentIndex === -1 && focusableNodes.length > 0) {
            focusableNodes[0].focus();
            return;
        }

        let nextIndex = -1;
        if (e.key === 'ArrowDown') {
            nextIndex = currentIndex + 1;
        } else if (e.key === 'ArrowUp') {
            nextIndex = currentIndex - 1;
        }

        if (nextIndex >= 0 && nextIndex < focusableNodes.length) {
            focusableNodes[nextIndex].focus();
        }
    }, []);

    return (
        <ul className="space-y-1" role="tree" ref={treeRef} onKeyDown={handleKeyDown}>
            {nodes.length === 0 && (
                <li className="p-2 text-sm text-gray-500 dark:text-gray-400 text-center">No matching files found.</li>
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
                />
            ))}
        </ul>
    );
};


const CodeViewer: React.FC<{ file: FileType | null; searchQuery: string }> = ({ file, searchQuery }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current && window.hljs && file) {
            codeRef.current.textContent = file.content;
            window.hljs.highlightElement(codeRef.current);
        }
    }, [file]);

    useEffect(() => {
        const codeElement = codeRef.current;
        if (!codeElement) return;

        // Remove previous search highlights
        const existingMarks = Array.from(codeElement.querySelectorAll('mark.search-highlight'));
        // FIX: Explicitly type `mark` as Element to prevent TypeScript from inferring it as `unknown`.
        existingMarks.forEach((mark: Element) => {
            const parent = mark.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
                parent.normalize();
            }
        });

        if (!searchQuery.trim() || !file) {
            return;
        }

        // Apply new search highlights
        const regex = new RegExp(searchQuery.trim(), 'gi');
        const walker = document.createTreeWalker(codeElement, NodeFilter.SHOW_TEXT);
        const textNodes: Text[] = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode as Text);
        }

        textNodes.forEach(node => {
            if (!node.textContent) return;
            const matches = node.textContent.match(regex);
            if (matches) {
                const fragment = document.createDocumentFragment();
                const parts = node.textContent.split(regex);
                
                parts.forEach((part, index) => {
                    fragment.appendChild(document.createTextNode(part));
                    if (index < matches.length) {
                        const mark = document.createElement('mark');
                        mark.className = 'search-highlight';
                        mark.textContent = matches[index];
                        fragment.appendChild(mark);
                    }
                });
                node.parentNode?.replaceChild(fragment, node);
            }
        });
    }, [searchQuery, file]);
    
    const handleCopy = () => {
        if (file) {
            navigator.clipboard.writeText(file.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    if (!file) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                <p>Select a file to view its content</p>
            </div>
        );
    }

    const language = getLanguageFromFileName(file.name);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 rounded-lg">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-700 dark:text-gray-300"
                >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardIcon className="h-4 w-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
            <div className="flex-grow overflow-auto p-4 bg-gray-900 text-gray-200">
                 <pre className="text-sm bg-transparent p-0 m-0"><code ref={codeRef} className={`language-${language}`}>{file.content}</code></pre>
            </div>
        </div>
    );
};

interface ResultsDisplayProps {
  files: FileNode[];
}

const filterNodes = (nodes: FileNode[], query: string, searchInName: boolean, searchInContent: boolean): FileNode[] => {
    if (!query.trim() || (!searchInName && !searchInContent)) {
        return nodes;
    }
    const lowerCaseQuery = query.toLowerCase();

    const filter = (node: FileNode): FileNode | null => {
        if (node.type === 'file') {
            const nameMatches = searchInName && node.name.toLowerCase().includes(lowerCaseQuery);
            const contentMatches = searchInContent && node.content.toLowerCase().includes(lowerCaseQuery);
            return (nameMatches || contentMatches) ? node : null;
        }

        if (node.type === 'folder') {
            if (searchInName && node.name.toLowerCase().includes(lowerCaseQuery)) {
                return node;
            }

            const filteredChildren = node.children
                .map(filter)
                .filter((n): n is FileNode => n !== null);

            if (filteredChildren.length > 0) {
                return { ...node, children: filteredChildren };
            }
        }

        return null;
    };

    return nodes.map(filter).filter((n): n is FileNode => n !== null);
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInName, setSearchInName] = useState(true);
  const [searchInContent, setSearchInContent] = useState(false);
  const { expandedFolders, toggleFolder, setExpandedFolders } = useFileTreeState();

  const filteredFiles = useMemo(() => {
      return filterNodes(files, searchQuery, searchInName, searchInContent);
  }, [files, searchQuery, searchInName, searchInContent]);


  useEffect(() => {
      if (searchQuery) {
          const allFolderPaths = new Set<string>();
          const findFolders = (nodes: FileNode[], currentPath: string) => {
              nodes.forEach(node => {
                  const path = currentPath ? `${currentPath}/${node.name}` : node.name;
                  if (node.type === 'folder') {
                      allFolderPaths.add(path);
                      findFolders(node.children, path);
                  }
              });
          };
          findFolders(filteredFiles, '');
          setExpandedFolders(allFolderPaths);
      } else {
          // Collapse all folders when search is cleared
          setExpandedFolders(new Set());
      }
  }, [searchQuery, searchInName, searchInContent, filteredFiles, setExpandedFolders]);

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
        <h3 className="text-2xl font-bold text-black dark:text-white">Generated Project</h3>
        <button
          onClick={handleDownloadZip}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Download .zip</span>
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden h-[70vh] flex">
        <div className="w-1/3 min-w-[250px] max-w-[400px] bg-gray-50 dark:bg-gray-900 flex flex-col">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 space-y-2">
                <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-gray-400"
                    aria-label="Filter files"
                />
                <div className="flex items-center justify-end space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Search in:</span>
                    <button 
                        onClick={() => setSearchInName(prev => !prev)}
                        className={`p-1.5 rounded-md transition-colors ${searchInName ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        aria-pressed={searchInName}
                        title="Search in file name"
                    >
                        <TagIcon className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => setSearchInContent(prev => !prev)}
                        className={`p-1.5 rounded-md transition-colors ${searchInContent ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        aria-pressed={searchInContent}
                        title="Search in file content"
                    >
                        <DocumentTextIcon className="h-4 w-4" />
                    </button>
                </div>
          </div>
          <div className="p-2 overflow-y-auto flex-grow">
            <FileTreeView
                nodes={filteredFiles}
                onSelectFile={setSelectedFile}
                selectedFile={selectedFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
            />
          </div>
        </div>
        <div className="w-2/3 flex-grow">
          <CodeViewer file={selectedFile} searchQuery={searchQuery} />
        </div>
      </div>
    </>
  );
};