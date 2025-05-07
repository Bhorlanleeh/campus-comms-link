
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export type UserUnit = "AUDIT" | "REGISTRY" | "BURSARY";

export interface User {
  id: string;
  fullName: string;
  email: string;
  position: string;
  unit: UserUnit;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
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

// Mock user credentials for demo purposes
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

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem("smartAuditUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
      toast({
        title: "Login successful",
        description: `Welcome back, ${foundUser.fullName}!`,
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if email is already used
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

      // Add user to mock data (in a real app, this would be an API call)
      mockUsers.push(newUser);
      mockCredentials[userData.email] = userData.password;

      // Set the user in state and localStorage
      setUser(newUser);
      localStorage.setItem("smartAuditUser", JSON.stringify(newUser));
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smartAuditUser");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isLoading,
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
