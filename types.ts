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
  createdAt: string;
}

export interface SavedProject {
  id: string;
  userId: string;
  name: string;
  options: ProjectOptions;
  files: FileNode[];
  createdAt: string;
  updatedAt: string;
}
