import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getCurrentUser: () => api.get('/auth/me'),
};

export const songsAPI = {
  createSong: (data: any) => api.post('/songs', data),
  getMySongs: () => api.get('/songs/my-songs'),
  getPublicSongs: (page = 1, limit = 20) =>
    api.get(`/songs/public?page=${page}&limit=${limit}`),
  getSong: (id: string) => api.get(`/songs/${id}`),
  updateSong: (id: string, data: any) => api.put(`/songs/${id}`, data),
  deleteSong: (id: string) => api.delete(`/songs/${id}`),
  likeSong: (id: string) => api.post(`/songs/${id}/like`),
};

export default api;