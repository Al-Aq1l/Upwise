import axios from "axios";

let rawUrl = (import.meta.env.VITE_API_URL || "/api").trim();
if (rawUrl.startsWith("http") && !rawUrl.endsWith("/api") && !rawUrl.endsWith("/api/")) {
  rawUrl = `${rawUrl.replace(/\/+$/, "")}/api`;
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
