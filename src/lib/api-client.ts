import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Clear auth tokens
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");

            // Redirect to login page if not already there
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
          break;
        case 403:
          console.error(
            "Forbidden: You do not have permission to access this resource"
          );
          break;
        case 404:
          break;
        case 500:
          break;
        default:
          console.error(
            "An error occurred:",
            error.response.data?.message || error.message
          );
      }
    } else if (error.request) {
    } else {
    }
    return Promise.reject(error);
  }
);

export default apiClient;
