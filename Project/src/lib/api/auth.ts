
import { api } from "./client";

export interface User {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: (credentials: LoginCredentials) => {
    return api.post<AuthResponse>("/auth/login", credentials);
  },
  
  register: (userData: RegisterData) => {
    return api.post<AuthResponse>("/auth/register", userData);
  },
  
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    return Promise.resolve({ status: 200 });
  },
  
  getCurrentUser: () => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      return JSON.parse(userData) as User;
    }
    return null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem("auth_token");
  },
  
  saveAuthData: (data: AuthResponse) => {
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user_data", JSON.stringify(data.user));
  },
  
  changePassword: (data: PasswordChangeData) => {
    return api.post("/auth/change-password", data);
  },
};
