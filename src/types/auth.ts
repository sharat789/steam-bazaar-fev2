import { User } from "./user";

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data: AuthData;
  error?: {
    message: string;
    code?: string;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  data: User;
  error?: {
    message: string;
    code?: string;
  };
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  role?: "viewer" | "creator";
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: User;
  error?: {
    message: string;
    code?: string;
  };
}
