
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
    console.log("Clearing all user data from localStorage");
    
    // Completely clear localStorage to ensure no data persists between sessions
    localStorage.clear();
    
    return Promise.resolve({ status: 200 });
  },
  
  getCurrentUser: () => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem("user_data");
        return null;
      }
    }
    return null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem("auth_token");
  },
  
  saveAuthData: (data: AuthResponse) => {
    console.log("Saving auth data for user:", data.user.username);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user_data", JSON.stringify(data.user));
  },
  
  checkAuth: async () => {
    if (!authService.isAuthenticated()) {
      console.log("No auth token found during checkAuth");
      return false;
    }
    
    try {
      const response = await api.get("/auth/me");
      console.log("Auth check result:", !response.error);
      return !response.error;
    } catch (error) {
      console.error("Auth check failed:", error);
      return false;
    }
  },
  
  changePassword: (data: PasswordChangeData) => {
    return api.post("/auth/change-password", data);
  },
};
