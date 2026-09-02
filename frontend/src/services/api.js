import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  logout: () => api.post('/auth/logout'),
};

export const threatService = {
  getThreats: (params) => api.get('/threats', { params }),
  getThreatStats: () => api.get('/threats/stats'),
  getThreat: (id) => api.get(`/threats/${id}`),
  updateStatus: (id, status) => api.put(`/threats/${id}/status`, { status }),
  reportThreat: (data) => api.post('/threats/report', data),
};
export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
  getTimeline: (days = 7) => api.get('/dashboard/timeline', { params: { days } }),
  getMapData: () => api.get('/dashboard/map'),
  getThreatTypes: () => api.get('/dashboard/types'),
  getAlerts: (limit = 20) => api.get('/dashboard/alerts', { params: { limit } }),
};
export default api;