import axios from "axios";
// Axios instance url backend (API)
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

export default instance;
