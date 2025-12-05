import axios from "axios";
// Axios instance url backend (API)
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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


// Response interceptor to handle 401 Unauthorized
instance.interceptors.response.use(
  (response) => response,
  (error) => {
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
        // Ensure we don't injecting a JSON object string if legacy data persists
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
    return Promise.reject(error);
  }
);

export default instance;

