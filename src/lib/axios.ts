import axios from "axios";
// Axios instance url backend (API)
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/"; // Redirect to home/login
    }
    return Promise.reject(error);
  }
);

export default instance;
