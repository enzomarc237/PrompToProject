import { SavedProject, ProjectOptions, FileNode } from '../types';

const PROJECTS_STORAGE_KEY = 'saved-projects';

export const projectHistoryService = {
  saveProject: (
    userId: string,
    name: string,
    options: ProjectOptions,
    files: FileNode[]
  ): SavedProject => {
    const projects = getAllProjects();
    
    const newProject: SavedProject = {
      id: crypto.randomUUID(),
      userId,
      name,
      options,
      files,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    
    return newProject;
  },

  getUserProjects: (userId: string): SavedProject[] => {
    const projects = getAllProjects();
    return projects
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getProject: (projectId: string): SavedProject | null => {
    const projects = getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  },

  deleteProject: (projectId: string): void => {
    const projects = getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
  },

  updateProject: (projectId: string, updates: Partial<SavedProject>): SavedProject | null => {
    const projects = getAllProjects();
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index === -1) return null;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    return projects[index];
  },
};

function getAllProjects(): SavedProject[] {
  try {
    const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return projectsJson ? JSON.parse(projectsJson) : [];
  } catch {
    return [];
  }
}
