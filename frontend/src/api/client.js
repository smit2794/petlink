import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Request Interceptor: attach JWT token if available
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("petlink_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config ? error.config.url || "" : "";
      // Don't auto-redirect on failed login or registration attempts
      if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
        localStorage.removeItem("petlink_token");
        // Only redirect if currently in a protected path
        const path = window.location.pathname;
        if (path.startsWith("/ngo") || path.startsWith("/vet") || path.startsWith("/parent")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;