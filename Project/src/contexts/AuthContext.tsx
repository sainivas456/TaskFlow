
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, authService } from "@/lib/api/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
      try {
        const user = authService.getCurrentUser();
        if (user) {
          console.log("Found stored user data:", user.username);
          setCurrentUser(user);
          
          // Verify the token is still valid
          const isValid = await authService.checkAuth();
          if (!isValid) {
            console.log("Stored token is invalid, logging out");
            handleLogout(false);
          }
        } else {
          console.log("No stored user data found");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        handleLogout(false);
      } finally {
        setIsLoading(false);
      }
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
      
      // Clear any existing data before setting new user
      localStorage.clear();
      
      // Save new auth data
      authService.saveAuthData(response.data);
      setCurrentUser(response.data.user);
      toast.success("Logged in successfully");
      
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
      
      // Clear any existing data before setting new user
      localStorage.clear();
      
      // Save new auth data
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
  
  const handleLogout = (showToast = true) => {
    // Clear auth data
    authService.logout();
    setCurrentUser(null);
    
    // Clear all localStorage to prevent any data leakage
    localStorage.clear();
    
    if (showToast) {
      toast.success("Logged out successfully");
      // Redirect to login
      navigate("/login");
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout: () => handleLogout(true),
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
