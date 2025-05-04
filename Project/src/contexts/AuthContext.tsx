
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, authService } from "@/lib/api/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { queryClient } from "@/lib/query-client";

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
  const navigate = useNavigate();
  
  useEffect(() => {
    // Try to load user from local storage
    const loadUser = async () => {
      const user = authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        
        // Verify the token is still valid
        const isValid = await authService.checkAuth();
        if (!isValid) {
          handleLogout();
        }
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      if (response.error || !response.data) {
        toast.error(response.error || "Login failed. Please try again.");
        return false;
      }
      
      authService.saveAuthData(response.data);
      setCurrentUser(response.data.user);
      toast.success("Logged in successfully");
      
      // Clear any existing cached data before loading the user's data
      queryClient.clear();
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
      return false;
    }
  };
  
  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.register({ username, email, password });
      
      if (response.error || !response.data) {
        toast.error(response.error || "Registration failed. Please try again.");
        return false;
      }
      
      authService.saveAuthData(response.data);
      setCurrentUser(response.data.user);
      toast.success("Account created successfully");
      
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
      return false;
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    
    // Clear all React Query caches to ensure no data persists between users
    queryClient.clear();
    
    // Redirect to login
    navigate("/login");
  };
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout: handleLogout,
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
