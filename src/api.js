import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5005/api",
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