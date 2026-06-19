import axios from "axios";
import { env } from "../config/env";
import { handleApiError } from "./errorHandler";

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
    const errorToken = error.response?.headers?.['x-csrf-token'];
    if (errorToken) csrfTokenMemory = errorToken;

    const apiError = handleApiError(error);
    const status = apiError.statusCode;
    const requestUrl: string = error.config?.url || '';
    const isSessionCheck = requestUrl.endsWith('/auth/me');
    const isLoginRequest = requestUrl.endsWith('/auth/login');
    const isRefreshRequest = requestUrl.endsWith('/auth/refresh');

    const isOnLoginPage = window.location.pathname.includes('/auth/login') || window.location.pathname.endsWith('/login');

    const handleRedirect = () => {
      if (isOnLoginPage) {
        return;
      }

      const pathSegments = window.location.pathname.split('/');
      const firstSegment = pathSegments[1];
      const isAdminPath = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/super-admin');

      if (isAdminPath) {
        window.location.href = '/admin/login';
      } else if (firstSegment && !['login', 'auth', 'admin', 'super-admin'].includes(firstSegment)) {
        window.location.href = `/${firstSegment}/auth/login`;
      } else {
        window.location.href = "/";
      }
    };

    if (status === 401 && !isSessionCheck && !isLoginRequest && !isRefreshRequest && !error.config._retry) {
      error.config._retry = true;
      try {
        const tenantSlug = window.location.pathname.split('/')[1];
        const isValidSlug = tenantSlug && !['admin', 'super-admin'].includes(tenantSlug);
        const refreshUrl = isValidSlug ? `/${tenantSlug}/auth/refresh` : "/admin/auth/refresh";

        await instance.post(refreshUrl, {});
        return instance(error.config);
      } catch (refreshError) {
        handleRedirect();
        return Promise.reject(apiError);
      }
    }

    if (status === 403 || (status === 500 && isSessionCheck)) {
      handleRedirect();
    }

    return Promise.reject(apiError);
  }
);

export default instance;

