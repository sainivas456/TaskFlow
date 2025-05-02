
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, authService } from "@/lib/api/auth";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Try to load user from local storage
    const loadUser = () => {
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.error || !response.data) {
        return false;
      }
      
      authService.saveAuthData(response.data);
      setCurrentUser(response.data.user);
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };
  
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.register({ username, email, password });
      
      if (response.error || !response.data) {
        return false;
      }
      
      authService.saveAuthData(response.data);
      setCurrentUser(response.data.user);
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };
  
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    toast.info("Logged out successfully");
  };
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
