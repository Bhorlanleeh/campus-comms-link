import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/utils/supabaseUtils";

export type UserUnit = "AUDIT" | "REGISTRY" | "BURSARY";

export interface User {
  id: string;
  fullName: string;
  email: string;
  position: string;
  unit: UserUnit;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    fullName: string;
    email: string;
    password: string;
    position: string;
    unit: UserUnit;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserAvatar: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Mock users for fallback when not connected to Supabase
const mockUsers: User[] = [
  {
    id: "1",
    fullName: "John Doe",
    email: "john@example.com",
    position: "Accountant",
    unit: "AUDIT",
  },
  {
    id: "2",
    fullName: "Jane Smith",
    email: "jane@example.com",
    position: "Manager",
    unit: "REGISTRY",
  },
  {
    id: "3",
    fullName: "Bob Johnson",
    email: "bob@example.com",
    position: "Financial Analyst",
    unit: "BURSARY",
  },
  {
    id: "4",
    fullName: "Alice Brown",
    email: "alice@example.com",
    position: "Senior Auditor",
    unit: "AUDIT",
  },
  {
    id: "5",
    fullName: "Charlie Davis",
    email: "charlie@example.com",
    position: "Records Officer",
    unit: "REGISTRY",
  },
  {
    id: "6",
    fullName: "Eva Wilson",
    email: "eva@example.com",
    position: "Financial Controller",
    unit: "BURSARY",
  },
];

// Mock credentials for fallback
const mockCredentials: Record<string, string> = {
  "john@example.com": "password123",
  "jane@example.com": "password123",
  "bob@example.com": "password123",
  "alice@example.com": "password123",
  "charlie@example.com": "password123",
  "eva@example.com": "password123",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to get user from localStorage
  const getUserFromStorage = (): User | null => {
    const storedUser = localStorage.getItem("smartAuditUser");
    return storedUser ? JSON.parse(storedUser) : null;
  };

  useEffect(() => {
    // Initialize auth state from localStorage first for faster UI render
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile data after a short delay to prevent Supabase deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 10);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("smartAuditUser");
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", !!session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

// Improved function to fetch user profile
const fetchUserProfile = async (userId: string) => {
  try {
    console.log("Fetching user profile for:", userId);
    
    // Get user profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }

    // Get auth user data (for email and other metadata)
    const { data } = await supabase.auth.getUser();
    const authUser = data?.user;
    const userEmail = authUser?.email || '';
    const userMetadata = authUser?.user_metadata || {};
    
    // For users who just signed up, the profile might not be fully updated yet
    // Therefore we should prioritize metadata from the auth user if available
    const fullName = userMetadata.full_name || (profile?.full_name || 'User');

    // Fallback to mock data if no profile found
    if (!profile) {
      console.warn("No profile found, using fallback mock data");
      
      if (userEmail) {
        const mockUser = mockUsers.find(u => u.email === userEmail);
        if (mockUser) {
          const updatedUser = {
            ...mockUser,
            id: userId,
            fullName: userMetadata.full_name || mockUser.fullName
          };
          setUser(updatedUser);
          localStorage.setItem("smartAuditUser", JSON.stringify(updatedUser));
          return;
        }
      }
      
      // If no email match, use the first mock user
      const fallbackUser = { 
        ...mockUsers[0], 
        id: userId,
        fullName: userMetadata.full_name || 'User',
        email: userEmail
      };
      setUser(fallbackUser);
      localStorage.setItem("smartAuditUser", JSON.stringify(fallbackUser));
      return;
    }

    // Map profile data to User interface with improved handling
    const userData: User = {
      id: profile.id,
      fullName: fullName, // Use auth metadata preferentially for freshly created users
      email: userEmail, // This comes from auth.user, not from the profile
      position: profile.position || 'Staff',
      unit: profile.unit as UserUnit || 'AUDIT',
      avatarUrl: profile.avatar_url
    };

    console.log("Setting user data:", userData);
    setUser(userData);
    localStorage.setItem("smartAuditUser", JSON.stringify(userData));
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    // Still try to use localStorage if available
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
  } finally {
    setIsLoading(false);
  }
};

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Login attempt:", email);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn("Global signout failed:", err);
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.warn("Supabase auth failed, falling back to mock users:", error);
        
        // Check if email exists in our mock data
        const storedPassword = mockCredentials[email];
        if (!storedPassword || storedPassword !== password) {
          throw new Error("Invalid email or password");
        }

        // Find the user
        const foundUser = mockUsers.find((u) => u.email === email);
        if (!foundUser) {
          throw new Error("User not found");
        }

        // Set the user in state and localStorage
        setUser(foundUser);
        localStorage.setItem("smartAuditUser", JSON.stringify(foundUser));
      } else {
        console.log("Supabase login successful:", data);
        // Set the login success flag to prevent redirect loops
        sessionStorage.setItem('loginSuccess', 'true');
        
        // Force a full page reload to the dashboard
        window.location.href = '/dashboard';
        return; // Stop execution since we're reloading the page
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    fullName: string;
    email: string;
    password: string;
    position: string;
    unit: UserUnit;
  }) => {
    setIsLoading(true);
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
          },
        }
      });

      if (authError) {
        // Fall back to mock implementation if Supabase auth fails
        console.warn("Supabase signup failed, falling back to mock implementation:", authError);
        
        // Check if email is already used in mock data
        if (mockCredentials[userData.email]) {
          throw new Error("Email already exists");
        }

        // Create new user
        const newUser: User = {
          id: `${mockUsers.length + 1}`,
          fullName: userData.fullName,
          email: userData.email,
          position: userData.position,
          unit: userData.unit,
        };

        // Add user to mock data
        mockUsers.push(newUser);
        mockCredentials[userData.email] = userData.password;

        // Set the user in state and localStorage
        setUser(newUser);
        localStorage.setItem("smartAuditUser", JSON.stringify(newUser));
      } else if (authData.user) {
        console.log("Supabase signup successful:", authData);
        
        // Create a profile in the profiles table
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: userData.fullName,
          position: userData.position,
          unit: userData.unit,
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Try to continue anyway
        }
        
        // Set the login success flag to prevent redirect loops
        sessionStorage.setItem('loginSuccess', 'true');
        
        // Force a full page reload to the dashboard
        window.location.href = '/dashboard';
        return; // Stop execution since we're reloading the page
      }

      toast({
        title: "Account created",
        description: "You have successfully created an account!",
      });
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

const updateUserAvatar = async (file: File): Promise<void> => {
  if (!user) {
    throw new Error("No user logged in");
  }

  setIsLoading(true);
  try {
    // Upload to Supabase storage with improved error handling and logging
    console.log("Starting avatar upload for user:", user.id);
    
    try {
      const filePath = `${user.id}`;
      const bucket = 'avatars';
      
      // First ensure the bucket exists
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === bucket);
        
        if (!bucketExists) {
          console.log(`Bucket '${bucket}' doesn't exist, creating it...`);
          const { error } = await supabase.storage.createBucket(bucket, {
            public: true
          });
          
          if (error) throw error;
          console.log(`Bucket '${bucket}' created successfully`);
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
        // Continue anyway, the upload might still work
      }
      
      console.log(`Uploading avatar to ${bucket}/${filePath}`);
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL with proper bucket and path handling
      const { data: publicURL } = supabase.storage
        .from(bucket)
        .getPublicUrl(data?.path || filePath);
      
      const fileUrl = publicURL.publicUrl;
      console.log("Avatar uploaded successfully, URL:", fileUrl);
      
      // Update profile in Supabase
      console.log("Updating profile with new avatar URL");
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: fileUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Fetch fresh user data to ensure we have the latest avatar URL
      console.log("Refreshing user profile data");
      await fetchUserProfile(user.id);
      
      // Also update local user state as a backup
      const updatedUser = { ...user, avatarUrl: fileUrl };
      setUser(updatedUser);
      localStorage.setItem("smartAuditUser", JSON.stringify(updatedUser));
      
      console.log("Avatar update complete");
    } catch (error) {
      console.error("Supabase storage upload failed:", error);
      throw error; // Rethrow to be caught by the outer try/catch
    }
  } catch (error) {
    console.error("Error updating avatar:", error);
    toast({
      title: "Update failed",
      description: "Failed to update profile image. Please try again.",
      variant: "destructive",
    });
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear local state
      setUser(null);
      localStorage.removeItem("smartAuditUser");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Force a full page reload to clear any lingering state
      window.location.href = '/welcome';
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout issue",
        description: "There was a problem signing you out. Try clearing your browser cache.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
        updateUserAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
