import axios from "axios";
import { env } from "../config/env";

// Axios instance url backend (API)
const instance = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
});

// Function to read CSRF token from cookie
function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Request interceptor - Add CSRF token and handle cookies
instance.interceptors.request.use(
  (config) => {
    // Add CSRF token for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl: string = error.config?.url || '';
    const isSessionCheck = requestUrl.endsWith('/auth/me');

    // Handle 401 Unauthorized - try refresh token first
    if (error.response?.status === 401 && !isSessionCheck && !error.config._retry) {
      error.config._retry = true;

      // Try to refresh token using configured instance (includes CSRF and credentials)
      try {
        const tenantSlug = window.location.pathname.split('/')[1];
        const isValidSlug = tenantSlug && !['admin', 'super-admin'].includes(tenantSlug);
        const refreshUrl = isValidSlug ? `/${tenantSlug}/auth/refresh` : "/admin/auth/refresh";
        
        await instance.post(refreshUrl, {});
        
        // Retry original request
        return instance(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
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

    // Let the error propagate for handling by individual requests
    return Promise.reject(error);
  }
);

export default instance;

