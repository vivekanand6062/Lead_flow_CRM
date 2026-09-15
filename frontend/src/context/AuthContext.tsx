import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export type UserRole = 'ADMIN' | 'MANAGER' | 'SALES_AGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  targetQuota?: number;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  organizationId: string;
  organizationName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  getDashboardPath: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getRoleDashboard = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'MANAGER':
      return '/manager/dashboard';
    case 'SALES_AGENT':
      return '/sales/dashboard';
    default:
      return '/login';
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Hydrate session from localStorage
    const savedToken = localStorage.getItem('leadflow_token');
    const savedUser = localStorage.getItem('leadflow_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse cached user session');
        localStorage.removeItem('leadflow_token');
        localStorage.removeItem('leadflow_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<UserRole> => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('leadflow_token', receivedToken);
    localStorage.setItem('leadflow_user', JSON.stringify(receivedUser));

    const destination = getRoleDashboard(receivedUser.role);
    navigate(destination);
    return receivedUser.role;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('leadflow_token');
    localStorage.removeItem('leadflow_user');
    navigate('/login');
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('leadflow_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        getDashboardPath: getRoleDashboard
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
