import { SavedProject, ProjectOptions, FileNode } from '../types';
import { pb } from '../lib/pocketbase';
import { escapeFilter } from '../lib/utils';

export const projectHistoryService = {
  saveProject: async (
    userId: string,
    name: string,
    options: ProjectOptions,
    files: FileNode[]
  ): Promise<SavedProject> => {
    try {
      const data = {
        user: userId,
        name,
        description: options.description.slice(0, 500),
        options,
        files,
      };

      const record = await pb.collection('projects').create(data);

      return {
        id: record.id,
        user: record.user,
        name: record.name,
        description: record.description,
        options: record.options as ProjectOptions,
        files: record.files as FileNode[],
        created: record.created,
        updated: record.updated,
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to save project');
    }
  },

  getUserProjects: async (userId: string, page = 1, perPage = 50): Promise<SavedProject[]> => {
    try {
      const records = await pb.collection('projects').getList(page, perPage, {
        filter: `user = "${escapeFilter(userId)}"`,
        sort: '-created',
      });

      return records.items.map(record => ({
        id: record.id,
        user: record.user,
        name: record.name,
        description: record.description,
        options: record.options as ProjectOptions,
        files: record.files as FileNode[],
        created: record.created,
        updated: record.updated,
      }));
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch projects');
    }
  },

  getProject: async (projectId: string): Promise<SavedProject | null> => {
    try {
      const record = await pb.collection('projects').getOne(projectId);

      return {
        id: record.id,
        user: record.user,
        name: record.name,
        description: record.description,
        options: record.options as ProjectOptions,
        files: record.files as FileNode[],
        created: record.created,
        updated: record.updated,
      };
    } catch {
      return null;
    }
  },

  deleteProject: async (projectId: string): Promise<void> => {
    try {
      await pb.collection('projects').delete(projectId);
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to delete project');
    }
  },

  updateProject: async (
    projectId: string,
    updates: Partial<SavedProject>
  ): Promise<SavedProject | null> => {
    try {
      const data: any = {};
      
      if (updates.name) data.name = updates.name;
      if (updates.description) data.description = updates.description;
      if (updates.options) data.options = updates.options;
      if (updates.files) data.files = updates.files;

      const record = await pb.collection('projects').update(projectId, data);

      return {
        id: record.id,
        user: record.user,
        name: record.name,
        description: record.description,
        options: record.options as ProjectOptions,
        files: record.files as FileNode[],
        created: record.created,
        updated: record.updated,
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update project');
    }
  },

  searchProjects: async (userId: string, query: string, page = 1, perPage = 50): Promise<SavedProject[]> => {
    try {
      const records = await pb.collection('projects').getList(page, perPage, {
        filter: `user = "${escapeFilter(userId)}" && (name ~ "${escapeFilter(query)}" || description ~ "${escapeFilter(query)}")`,
        sort: '-created',
      });

      return records.items.map(record => ({
        id: record.id,
        user: record.user,
        name: record.name,
        description: record.description,
        options: record.options as ProjectOptions,
        files: record.files as FileNode[],
        created: record.created,
        updated: record.updated,
      }));
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to search projects');
    }
  },
};
