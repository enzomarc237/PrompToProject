import { User } from '../types';
import { pb } from '../lib/pocketbase';

export const authService = {
  register: async (email: string, password: string, name: string): Promise<User> => {
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
        name,
        emailVisibility: true,
      };

      const record = await pb.collection('users').create(data);
      
      await pb.collection('users').requestVerification(email);

      return {
        id: record.id,
        email: record.email,
        name: record.name,
        avatar: record.avatar,
        created: record.created,
        updated: record.updated,
      };
    } catch (error: any) {
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.email) {
          throw new Error('This email is already registered');
        }
        throw new Error(errorData.message || 'Registration failed');
      }
      throw new Error(error?.message || 'Registration failed');
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        avatar: authData.record.avatar,
        created: authData.record.created,
        updated: authData.record.updated,
      };
    } catch (error: any) {
      throw new Error('Invalid email or password');
    }
  },

  logout: () => {
    pb.authStore.clear();
  },

  getCurrentUser: (): User | null => {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return null;
    }

    const model = pb.authStore.model;
    return {
      id: model.id,
      email: model.email,
      name: model.name,
      avatar: model.avatar,
      created: model.created,
      updated: model.updated,
    };
  },

  updateUser: async (userId: string, data: Partial<{ name: string; email: string; avatar?: File }>): Promise<User> => {
    try {
      const payload: Record<string, any> = {};
      
      if (data.name !== undefined) payload.name = data.name;
      if (data.email !== undefined) payload.email = data.email;
      
      if (data.avatar) {
        const formData = new FormData();
        if (data.name !== undefined) formData.append('name', data.name);
        if (data.email !== undefined) formData.append('email', data.email);
        formData.append('avatar', data.avatar);
        
        const record = await pb.collection('users').update(userId, formData);
        
        return {
          id: record.id,
          email: record.email,
          name: record.name,
          avatar: record.avatar,
          created: record.created,
          updated: record.updated,
        };
      }
      
      const record = await pb.collection('users').update(userId, payload);
      
      return {
        id: record.id,
        email: record.email,
        name: record.name,
        avatar: record.avatar,
        created: record.created,
        updated: record.updated,
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update user');
    }
  },

  refreshAuth: async (): Promise<User | null> => {
    try {
      if (!pb.authStore.isValid) {
        return null;
      }

      const authData = await pb.collection('users').authRefresh();
      
      return {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        avatar: authData.record.avatar,
        created: authData.record.created,
        updated: authData.record.updated,
      };
    } catch {
      pb.authStore.clear();
      return null;
    }
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await pb.collection('users').requestPasswordReset(email);
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to send password reset email');
    }
  },

  confirmPasswordReset: async (
    token: string,
    password: string,
    passwordConfirm: string
  ): Promise<void> => {
    try {
      await pb.collection('users').confirmPasswordReset(
        token,
        password,
        passwordConfirm
      );
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to reset password');
    }
  },
};
