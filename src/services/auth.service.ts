import apiClient from "../lib/api-client";
import {
  AuthResponse,
  CurrentUserResponse,
  RegisterDto,
  UpdateUserDto,
  UpdateUserResponse,
} from "../types/auth";

export const AuthService = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);

    if (response.data.success) {
      localStorage.setItem("authToken", response.data.data.accessToken);
      localStorage.setItem("refreshToken", response.data.data.refreshToken);
    }

    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      username,
      password,
    });

    if (response.data.success) {
      localStorage.setItem("authToken", response.data.data.accessToken);
      localStorage.setItem("refreshToken", response.data.data.refreshToken);
    }

    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await apiClient.get<CurrentUserResponse>(
      "/auth/currentUser"
    );
    return response.data;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },

  update: async (data: UpdateUserDto): Promise<UpdateUserResponse> => {
    const response = await apiClient.post<UpdateUserResponse>(
      "/auth/update",
      data
    );
    return response.data;
  },
};
