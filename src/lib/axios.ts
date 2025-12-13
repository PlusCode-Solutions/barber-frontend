import axios from "axios";
import { env } from "../config/env";

// Axios instance url backend (API)
const instance = axios.create({
  baseURL: env.API_URL,
  withCredentials: false,
});

// Request interceptor to add JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      let tenantSlug = localStorage.getItem("tenant");
      const tenantData = localStorage.getItem("tenantData");

      // Try to get slug from tenantData object first (more reliable source)
      if (tenantData) {
        try {
          const parsed = JSON.parse(tenantData);
          if (parsed && parsed.slug) {
            tenantSlug = parsed.slug;
          }
        } catch (e) {
          console.error("Error parsing tenantData for redirect", e);
        }
      }

      if (tenantSlug) {
        // Ensure we don't inject a JSON object string if legacy data persists
        if (tenantSlug.startsWith("{")) {
          try {
            const parsed = JSON.parse(tenantSlug);
            tenantSlug = parsed.slug || "";
          } catch { }
        }

        if (tenantSlug) {
          window.location.href = `/${tenantSlug}/auth/login`;
        } else {
          window.location.href = "/";
        }
      } else {
        window.location.href = "/";
      }
    }
    
    // Let the error propagate for handling by individual requests
    // The error will be converted to ApiError by handleApiError when caught
    return Promise.reject(error);
  }
);

export default instance;

