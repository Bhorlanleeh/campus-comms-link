
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UsersProvider } from "./context/UsersContext";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UnitUsers from "./pages/UnitUsers";
import Chat from "./pages/Chat";
import AllChats from "./pages/AllChats";
import FindPeople from "./pages/FindPeople";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Handle email verification callbacks
const EmailVerificationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // If this component renders, it means we caught a verification URL
    // We should redirect to login with a success message
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    
    if (type === 'signup' || type === 'recovery' || type === 'invite') {
      // Set a flag to show success message on login page
      sessionStorage.setItem('emailVerified', 'true');
      navigate('/login');
    } else {
      // For any other unexpected verification, redirect to dashboard or login
      navigate('/dashboard');
    }
  }, [location.search, navigate]);
  
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smartAudit-green"></div>
    </div>
  );
};

// Protected route component with improved auth checking
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Check for login success flag on dashboard route to prevent redirect loops
  const isLoginSuccess = location.pathname === '/dashboard' && 
    sessionStorage.getItem('loginSuccess') === 'true';
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smartAudit-green"></div>
      </div>
    );
  }
  
  // If we have a user or this is right after login success, render the protected content
  if (user || isLoginSuccess) {
    // Clear login success flag after successful navigation
    if (isLoginSuccess) {
      sessionStorage.removeItem('loginSuccess');
    }
    return <>{children}</>;
  }
  
  // Check if we have a locally stored user as fallback
  const storedUser = localStorage.getItem("smartAuditUser");
  if (storedUser) {
    // We have a stored user, render the protected content
    return <>{children}</>;
  }
  
  // No authenticated user, redirect to login
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UsersProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Handle email verification */}
              <Route path="/verify" element={<EmailVerificationHandler />} />
              
              {/* Protected routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/unit/:unitId" 
                element={
                  <ProtectedRoute>
                    <UnitUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat/:userId" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chats" 
                element={
                  <ProtectedRoute>
                    <AllChats />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/find" 
                element={
                  <ProtectedRoute>
                    <FindPeople />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </UsersProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
