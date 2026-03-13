import axios from "axios";

export const SERVER_URL = (
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.DEV ? "http://localhost:5005" : "")
).replace(/\/$/, "");

const api = axios.create({
  baseURL: SERVER_URL ? `${SERVER_URL}/api` : "/api",
});

// Request Interceptor: Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptorfor 401 errors
api.interceptors.response.use(
  (response) => response, // Everything is fine
  (error) => {
    // If the server returns 401 Unauthorized, the token is invalid or expired
    if (error.response && error.response.status === 401) {
      console.warn("Token expired or invalid. Redirecting to login...");
      
      // Remove the invalid token from storage
      localStorage.removeItem("authToken");
      
      // Force the user to the login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;