"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "../types/user";
import { AuthService } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const response = await AuthService.getCurrentUser();
          console.log("Auth Context - Full Response:", response);
          if (response.success) {
            setUser(response.data);
            console.log("Auth Context - User set to:", response.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch current user", error);
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(username, password);
      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error?.message || "Login failed");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const response = await AuthService.register({
        email,
        username,
        password,
      });
      if (response.success) {
        setUser(response.data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
