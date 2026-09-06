import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("socially_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;

  const apiUrl = import.meta.env.VITE_API_URL || "";
  const backendOrigin = apiUrl.replace(/\/api\/?$/, "");

  if (imagePath.startsWith("/uploads/")) {
    return `${backendOrigin}${imagePath}`;
  }

  return `${backendOrigin}/${imagePath.replace(/^\/+/, "")}`;
};

export const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export default api;