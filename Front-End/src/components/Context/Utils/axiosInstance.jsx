// src/utils/axiosInstance.js
import axios from "axios";
import { AuthContext } from "../AuthContext";

const { logout } = AuthContext();

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BACKEND_BASEURL,
  withCredentials: true,
});

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, call logout
      logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
