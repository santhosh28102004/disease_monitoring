import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Role, User } from '@/data/mockData';

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  token: string | null;
  login: (user: Partial<User> & { role: Role; token?: string }) => void;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'location'>>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_STORAGE_KEY = 'health-surveillance-user';
const TOKEN_STORAGE_KEY = 'health-surveillance-token';

const readStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (!readStoredToken()) return null;
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (u: Partial<User> & { role: Role; token?: string }) => {
    const defaults =
      u.role === 'citizen'
        ? { name: 'John Citizen', email: 'john@example.com', phone: '+91 98765 43210', location: 'Anna Nagar' }
        : { name: 'Dr. Priya Health Official', email: 'priya@health.gov', phone: '+91 90000 12345', location: 'Peelamedu' };

    const { token: authToken, ...userData } = u;
    const nextUser = { ...defaults, ...userData } as User;
    if (authToken) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setUser(nextUser);
    setToken(authToken ?? null);
  };

  const updateUser = (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'location'>>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, token, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
