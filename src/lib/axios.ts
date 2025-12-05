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

      const tenantSlug = localStorage.getItem("tenant");
      if (tenantSlug) {
        window.location.href = `/${tenantSlug}/auth/login`;
      } else {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

