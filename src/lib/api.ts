// ==========================================
// FILE: src/lib/api.ts
// ==========================================
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vector-node-backend.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add token from localStorage if exists (backup to cookies)
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// API helper functions
export const api = {
  // Auth
  auth: {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    getMe: () => apiClient.get('/auth/me'),
  },

  // Shipments
  shipments: {
    list: (params?: any) => apiClient.get('/shipments', { params }),
    get: (id: string) => apiClient.get(`/shipments/${id}`),
    create: (data: any) => apiClient.post('/shipments', data),
    update: (id: string, data: any) => apiClient.put(`/shipments/${id}`, data),
    delete: (id: string) => apiClient.delete(`/shipments/${id}`),
    selectBid: (id: string, bidId: string) => 
      apiClient.post(`/shipments/${id}/select-bid`, { bidId }),
  },

  // Bids
  bids: {
    myBids: (params?: any) => apiClient.get('/bids/my-bids', { params }),
    create: (data: any) => apiClient.post('/bids', data),
    withdraw: (id: string) => apiClient.delete(`/bids/${id}`),
  },

  // Carriers
  carriers: {
    list: (params?: any) => apiClient.get('/carriers', { params }),
    get: (id: string) => apiClient.get(`/carriers/${id}`),
  },

  // Users
  users: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data: any) => apiClient.put('/users/profile', data),
    changePassword: (data: any) => apiClient.put('/users/change-password', data),
  },
};





