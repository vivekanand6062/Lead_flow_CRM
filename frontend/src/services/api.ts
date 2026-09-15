import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('leadflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 / session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response && error.response.status === 401) {
      // If we are not on public auth pages (/login, /setup, /forgot-password, /reset-password), clear storage and redirect
      const path = window.location.pathname;
      const isPublicAuthPage = path.includes('/login') || path.includes('/setup') || path.includes('/forgot-password') || path.includes('/reset-password');
      if (!isPublicAuthPage) {
        localStorage.removeItem('leadflow_token');
        localStorage.removeItem('leadflow_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
