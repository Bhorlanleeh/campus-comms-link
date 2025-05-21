
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    position: '',
    unit: '',
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    position?: string;
    unit?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUnitChange = (value: string) => {
    setFormData(prev => ({ ...prev, unit: value }));
    if (errors.unit) {
      setErrors(prev => ({ ...prev, unit: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }
    
    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            position: formData.position,
            unit: formData.unit,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user?.id,
          full_name: formData.fullName,
          position: formData.position,
          unit: formData.unit,
        });
      
      if (profileError) {
        throw profileError;
      }
      
      // Show the email confirmation alert instead of redirecting
      setShowConfirmation(true);
      setUserEmail(formData.email);
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return to login page
  const handleBackToLogin = () => {
    navigate('/login');
  };

  // If showing confirmation screen
  if (showConfirmation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 flex items-center flex-col">
            <Logo size="md" />
            <CardTitle className="text-2xl mt-4">Check Your Email</CardTitle>
            <CardDescription>
              Verification email sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              <AlertTitle className="text-blue-700">Email Confirmation Required</AlertTitle>
              <AlertDescription className="text-blue-600">
                We've sent a verification email to <strong>{userEmail}</strong>. Please check your inbox and click on the confirmation link to activate your account.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-center text-gray-600">
              <p>Didn't receive an email? Check your spam folder or</p>
              <Button variant="link" className="p-0 h-auto text-smartAudit-green" onClick={() => setIsSubmitting(false)}>
                try using a different email address
              </Button>
            </div>
            
            <Button 
              className="w-full"
              onClick={handleBackToLogin}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex items-center flex-col">
          <Logo size="md" />
          <CardTitle className="text-2xl mt-4">Create an account</CardTitle>
          <CardDescription>
            Sign up to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                placeholder="e.g. Accountant, Manager"
                value={formData.position}
                onChange={handleInputChange}
              />
              {errors.position && <p className="text-red-500 text-xs">{errors.position}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={handleUnitChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUDIT">Audit</SelectItem>
                  <SelectItem value="BURSARY">Bursary</SelectItem>
                  <SelectItem value="REGISTRY">Registry</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-red-500 text-xs">{errors.unit}</p>}
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
          <div className="text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-smartAudit-green hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
