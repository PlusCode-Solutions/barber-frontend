import axios from "axios";
import { env } from "../config/env";

// In-memory store for the CSRF token
let csrfTokenMemory: string | null = null;

// Axios instance url backend (API)
const instance = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
});

// Request interceptor - Add CSRF token
instance.interceptors.request.use(
  (config) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
      if (csrfTokenMemory) {
        config.headers['x-csrf-token'] = csrfTokenMemory;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Capture CSRF token and handle errors
instance.interceptors.response.use(
  (response) => {
    // Sync CSRF token if present in headers
    const newToken = response.headers['x-csrf-token'];
    if (newToken) {
      csrfTokenMemory = newToken;
    }
    return response;
  },
  async (error) => {
    // Also try to sync token from error response headers
    const errorToken = error.response?.headers?.['x-csrf-token'];
    if (errorToken) {
      csrfTokenMemory = errorToken;
    }

    const requestUrl: string = error.config?.url || '';
    const isSessionCheck = requestUrl.endsWith('/auth/me');

    // Handle 401 Unauthorized - try refresh token first
    if (error.response?.status === 401 && !isSessionCheck && !error.config._retry) {
      error.config._retry = true;

      try {
        const tenantSlug = window.location.pathname.split('/')[1];
        const isValidSlug = tenantSlug && !['admin', 'super-admin'].includes(tenantSlug);
        const refreshUrl = isValidSlug ? `/${tenantSlug}/auth/refresh` : "/admin/auth/refresh";
        
        await instance.post(refreshUrl, {});
        
        return instance(error.config);
      } catch (refreshError) {
        let tenantSlug = window.location.pathname.split('/')[1];
        
        if (tenantSlug && !['admin', 'super-admin'].includes(tenantSlug)) {
          window.location.href = `/${tenantSlug}/auth/login`;
        } else if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default instance;

