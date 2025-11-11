
import React, { useState } from 'react';
import { FileNode, File as FileType } from '../types';
import { FolderIcon, FileIcon, ClipboardIcon, CheckIcon } from './icons/Icons';

interface ResultsDisplayProps {
  files: FileNode[];
}

const FileTree: React.FC<{ nodes: FileNode[]; onSelectFile: (file: FileType) => void; selectedFile: FileType | null; level?: number; }> = ({ nodes, onSelectFile, selectedFile, level = 0 }) => {
    return (
        <ul className="space-y-1">
            {nodes.sort((a,b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
            }).map(node => (
                <li key={node.name} style={{ paddingLeft: `${level * 1.25}rem`}}>
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
                 <pre className="text-sm">
                    <code className="language-javascript">{file.content}</code>
                </pre>
            </div>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden h-[70vh] flex">
      <div className="w-1/3 min-w-[250px] max-w-[400px] bg-gray-900 p-4 overflow-y-auto">
        <FileTree nodes={files} onSelectFile={setSelectedFile} selectedFile={selectedFile} />
      </div>
      <div className="w-2/3 flex-grow">
        <CodeViewer file={selectedFile} />
      </div>
    </div>
  );
};
