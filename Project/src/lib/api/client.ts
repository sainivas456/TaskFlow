
import { toast } from "sonner";

// In production this would be an environment variable
const API_BASE_URL = "http://localhost:5000/api"; 

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  rawError?: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`API Request: ${options.method || 'GET'} ${url}`);
  
  // Create a new headers object to avoid TypeScript issues
  const headersObj: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };
  
  // Add auth token if available
  const token = localStorage.getItem("auth_token");
  if (token) {
    headersObj["Authorization"] = `Bearer ${token}`;
    console.log("Using auth token:", `Bearer ${token.substring(0, 10)}...`);
  } else {
    console.log("No auth token available");
  }
  
  try {
    console.log("Sending request with options:", { 
      method: options.method,
      headers: { ...headersObj, Authorization: headersObj.Authorization ? "Bearer [REDACTED]" : undefined },
      body: options.body ? "[BODY DATA]" : undefined 
    });
    
    const response = await fetch(url, {
      ...options,
      headers: headersObj,
    });
    
    // Log response status
    console.log(`API Response: ${response.status} for ${url}`);
    
    // Handle unauthorized errors specifically
    if (response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      
      // Only show toast if we were previously logged in
      if (token) {
        toast.error("Session expired. Please log in again.");
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      return { 
        error: "Unauthorized", 
        status: response.status 
      };
    }
    
    // Handle JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Parsed JSON response:", data);
      
      if (!response.ok) {
        // Log the error for debugging
        console.error("API Error:", data);
        
        // Handle error responses
        toast.error(data.message || "An error occurred");
        return { 
          error: data.message || "An error occurred", 
          status: response.status,
          rawError: data
        };
      }
      
      return { data, status: response.status };
    }
    
    // Handle non-JSON responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Non-JSON Error Response:", response, errorText);
      toast.error("An error occurred");
      return { 
        error: "An error occurred", 
        status: response.status,
        rawError: errorText
      };
    }
    
    return { status: response.status };
  } catch (error) {
    console.error("API request failed:", error);
    toast.error("Network error. Please try again later.");
    return { 
      error: "Network error", 
      status: 0,
      rawError: error
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: "GET" }),
  
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, { 
      ...options, 
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, { 
      ...options, 
      method: "PUT",
      body: JSON.stringify(data),
    }),
  
  delete: <T = any>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
  
  // For file uploads
  upload: <T = any>(endpoint: string, formData: FormData, options?: RequestInit) => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      headers: {},  // Let the browser set the Content-Type with correct boundary
    });
  },
};
