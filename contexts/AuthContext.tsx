import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { pb } from '../lib/pocketbase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        const refreshedUser = await authService.refreshAuth();
        setUser(refreshedUser);
      }
      
      setIsLoading(false);
    };

    initAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (model) {
        setUser({
          id: model.id,
          email: model.email,
          name: model.name,
          avatar: model.avatar,
          created: model.created,
          updated: model.updated,
        });
      } else {
        setUser(null);
      }
    });

    let refreshTimer: number | undefined;

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      
      const token = pb.authStore.token;
      if (!token) return;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const refreshAt = expiresAt - 60000;
        
        if (refreshAt > now) {
          refreshTimer = window.setTimeout(async () => {
            try {
              await authService.refreshAuth();
              scheduleRefresh();
            } catch {
              pb.authStore.clear();
              setUser(null);
            }
          }, refreshAt - now);
        }
      } catch {
        // Invalid token, ignore
      }
    };

    scheduleRefresh();

    return () => {
      unsubscribe();
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  const register = async (email: string, password: string, name: string) => {
    const user = await authService.register(email, password, name);
    await authService.login(email, password);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
