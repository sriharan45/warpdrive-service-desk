import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (preset: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('warpdrive_token');
      const storedUser = localStorage.getItem('warpdrive_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
          // Validate with server
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('warpdrive_user', JSON.stringify(currentUser));
        } catch (error) {
          console.warn('Session expired or invalid, clearing local session.');
          localStorage.removeItem('warpdrive_token');
          localStorage.removeItem('warpdrive_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    const handleAuthChange = () => {
      setToken(localStorage.getItem('warpdrive_token'));
      const u = localStorage.getItem('warpdrive_user');
      setUser(u ? JSON.parse(u) : null);
    };

    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('warpdrive_token', res.access_token);
      localStorage.setItem('warpdrive_user', JSON.stringify(res.user));
      addToast(`Welcome back, ${res.user.full_name}!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('warpdrive_token');
      localStorage.removeItem('warpdrive_user');
      setToken(null);
      setUser(null);
      addToast('Logged out successfully', 'info');
    }
  };

  const quickLogin = async (preset: string) => {
    const presets: Record<string, { email: string; pass: string }> = {
      'employee': { email: 'employee@warpdrive.com', pass: 'EmployeePass123!' },
      'john': { email: 'john.doe@warpdrive.com', pass: 'EmployeePass123!' },
      'admin_it': { email: 'admin.it@warpdrive.com', pass: 'AdminPass123!' },
      'admin_tech': { email: 'admin.tech@warpdrive.com', pass: 'AdminPass123!' },
      'admin_hr': { email: 'admin.hr@warpdrive.com', pass: 'AdminPass123!' },
      'admin_accounts': { email: 'admin.accounts@warpdrive.com', pass: 'AdminPass123!' },
      'admin_maint': { email: 'admin.maint@warpdrive.com', pass: 'AdminPass123!' },
      'org_admin': { email: 'org.admin@warpdrive.com', pass: 'OrgAdminPass123!' },
    };

    const target = presets[preset];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, quickLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
