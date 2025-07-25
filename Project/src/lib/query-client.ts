
import { QueryClient } from "@tanstack/react-query";

// Create a QueryClient instance that will be used throughout the app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Don't keep any stale data
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// Helper function to clear all cache data
export const clearQueryCache = () => {
  queryClient.clear();
  console.log("Query cache cleared");
};
