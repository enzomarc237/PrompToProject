import { User } from '../types';

const USERS_STORAGE_KEY = 'app-users';
const CURRENT_USER_KEY = 'current-user';

interface StoredUser extends User {
  password: string;
}

export const authService = {
  register: async (email: string, password: string, name: string): Promise<User> => {
    const users = getStoredUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  login: async (email: string, password: string): Promise<User> => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    try {
      const userJson = localStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  },

  updateUser: (user: User): void => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  },
};

function getStoredUsers(): StoredUser[] {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch {
    return [];
  }
}
