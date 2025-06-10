
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const NetworkStatus = () => {
  const { isOnline, isReconnecting } = useNetworkStatus();

  if (!isOnline || isReconnecting) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
        {isReconnecting ? 'Mencoba menyambung kembali...' : 'Tidak ada koneksi internet'}
      </div>
    );
  }

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NetworkStatus />
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
