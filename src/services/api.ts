import axios from 'axios';
import { AnalyticsData, Camera, CameraActivity, LoginActivity, User } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: Partial<User> & { password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Camera API
export const cameraAPI = {
  getCameras: async (): Promise<Camera[]> => {
    const response = await api.get('/cameras');
    return response.data;
  },

  createCamera: async (formData: FormData): Promise<Camera> => {
    const response = await api.post('/cameras', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCamera: async (id: string, formData: FormData): Promise<Camera> => {
    const response = await api.put(`/cameras/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCamera: async (id: string): Promise<void> => {
    await api.delete(`/cameras/${id}`);
  },

  getCamera: async (id: string): Promise<Camera> => {
    const response = await api.get(`/cameras/${id}`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardData: async (filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    cameraId?: string;
  }): Promise<AnalyticsData> => {
    const response = await api.get('/analytics/dashboard', { params: filters });
    return response.data;
  },

  getLoginActivity: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<LoginActivity[]> => {
    const response = await api.get('/analytics/login-activity', { params: filters });
    return response.data;
  },

  getCameraActivity: async (filters?: {
    startDate?: string;
    endDate?: string;
    cameraId?: string;
  }): Promise<CameraActivity[]> => {
    const response = await api.get('/analytics/camera-activity', { params: filters });
    return response.data;
  },

  getVideoActivity: async (filters?: {
    startDate?: string;
    endDate?: string;
    cameraId?: string;
    userId?: string;
  }): Promise<CameraActivity[]> => {
    const response = await api.get('/analytics/video-logs', { params: filters });
    return response.data;
  },


  // videoStatus: async (id: string): Promise<any> => {
  //   const response = await api.post(`/stream/buffer/${id}`);
  //   return JSON.parse(response?.data.strBuffer);;
  // },
};



export default api;