
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [isLoading, user, navigate]);
  
  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <Logo size="lg" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-smartAudit-green">
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-white">
        <Logo size="lg" white />
        
        <div className="text-center mt-8">
          <h2 className="text-4xl font-bold">Welcome to</h2>
          <h1 className="text-6xl font-bold mt-2">FUNAAB</h1>
          <h3 className="text-3xl font-medium mt-2">SmartAudit</h3>
          <p className="mt-8 max-w-md px-4">
            A communication system for BURSARY, AUDIT, and REGISTRY units.
            Share documents and information seamlessly.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-xs">
          <Button
            variant="default"
            className="flex-1 bg-white text-smartAudit-green hover:bg-white/90"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-white text-white hover:bg-white/10"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </div>
        
        <p className="mt-12 text-sm opacity-80 text-center px-4">
          Powered by The Federal University of Agriculture, Abeokuta.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
