// ==========================================
// FILE: src/lib/auth.ts
// ==========================================
import { User } from '@/types';

export const setAuth = (user: User, token?: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  if (token) {
    localStorage.setItem('token', token);
  }
};

export const getAuth = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  return {
    user: userStr ? JSON.parse(userStr) : null,
    token,
  };
};

export const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  const { user, token } = getAuth();
  return !!(user && token);
};

export const hasRole = (role: string): boolean => {
  const { user } = getAuth();
  return user?.role === role;
};





