import apiClient from "../lib/api-client";
import { LiveUser, User } from "../types/user";
import { ApiResponse, PaginatedResponse } from "../types/generic";

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: "viewer" | "creator";
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: "viewer" | "creator";
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>("/users");
    return response.data.data;
  },

  getLiveUsers: async (): Promise<LiveUser[]> => {
    const response = await apiClient.get<PaginatedResponse<LiveUser>>(
      "/users/live"
    );
    return response.data.data || [];
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>("/users", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
