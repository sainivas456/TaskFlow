
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
    // Clear all user data from localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    
    // Clear any cached data from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith("task-") || 
        key.startsWith("calendar-") || 
        key.startsWith("time-tracking-") ||
        key.startsWith("label-") ||
        key.startsWith("collaborator-")
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove cached items
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
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
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user_data", JSON.stringify(data.user));
  },
  
  checkAuth: async () => {
    if (!authService.isAuthenticated()) {
      return false;
    }
    
    try {
      const response = await api.get("/auth/me");
      return !response.error;
    } catch (error) {
      return false;
    }
  },
  
  changePassword: (data: PasswordChangeData) => {
    return api.post("/auth/change-password", data);
  },
};
