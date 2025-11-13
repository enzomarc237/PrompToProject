export interface ProjectOptions {
  description: string;
  stack: string;
  pattern: string;
  auth: string;
  testing: string;
  infra: string;
  backend?: string;
  frontend?: string;
}

export type File = {
  type: 'file';
  name: string;
  content: string;
};

export type Folder = {
  type: 'folder';
  name: string;
  children: FileNode[];
};

export type FileNode = File | Folder;

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created?: string;
  updated?: string;
}

export interface SavedProject {
  id: string;
  user: string;
  name: string;
  description?: string;
  options: ProjectOptions;
  files: FileNode[];
  created?: string;
  updated?: string;
}
