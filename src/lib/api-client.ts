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
          localStorage.removeItem("authToken");
          break;
        case 403:
          console.error(
            "Forbidden: You do not have permission to access this resource"
          );
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error: Please try again later");
          break;
        default:
          console.error(
            "An error occurred:",
            error.response.data?.message || error.message
          );
      }
    } else if (error.request) {
      console.error("Network error: Please check your connection");
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
