// Type declarations for components used in template files
// These are stubs - in actual project, import from actual component files

declare module '@/components/ui/Button' {
  import React from 'react';
  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
  }
  export const Button: React.FC<ButtonProps>;
}

declare module '@/components/ui/Input' {
  import React from 'react';
  interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
  }
  export const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
}

declare module '@/components/ui/Select' {
  import React from 'react';
  interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
  }
  export const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
}

declare module '@/components/ui/Alert' {
  import React from 'react';
  interface AlertProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    children: React.ReactNode;
    className?: string;
  }
  export const Alert: React.FC<AlertProps>;
}

declare module '@/contexts/AuthContext' {
  import { User } from '@/types';
  interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
  }
  export function useAuth(): AuthContextType;
}

declare module '@/types' {
  export * from '../types';
}

declare module '@/lib/api' {
  export const api: any;
}

declare module '@/lib/auth' {
  import { User } from '@/types';
  export function setAuth(user: User, token?: string): void;
  export function getAuth(): { user: User | null; token: string | null };
  export function clearAuth(): void;
}

declare module '@/lib/utils' {
  export function cn(...inputs: any[]): string;
  export function formatDate(date: string | Date): string;
  export function formatDateTime(date: string | Date): string;
  export function formatCurrency(amount: number, currency?: string): string;
  export function formatWeight(kg: number): string;
  export function getStatusColor(status: string): string;
  export function getStatusLabel(status: string): string;
  export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
  export function truncate(str: string, length?: number): string;
}





