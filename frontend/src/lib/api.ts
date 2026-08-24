import axios from "axios";

// Bulletproof API URL Normalizer
let rawUrl = (import.meta.env.VITE_API_URL || "/api").trim().replace(/\/+$/, "");

// Strip accidental trailing endpoints like /login or double /api
rawUrl = rawUrl.replace(/\/login$/i, "").replace(/\/api\/api$/i, "/api");

if (rawUrl.startsWith("http")) {
  if (!rawUrl.endsWith("/api")) {
    rawUrl = `${rawUrl}/api`;
  }
} else {
  rawUrl = "/api";
}

const api = axios.create({
  baseURL: rawUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sl-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sl-token");
      localStorage.removeItem("sl-user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
