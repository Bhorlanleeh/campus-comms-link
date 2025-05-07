
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserUnit, useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";
import Logo from "@/components/Logo";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [position, setPosition] = useState("");
  const [unit, setUnit] = useState<UserUnit | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;
    if (!unit) return;
    
    setIsSubmitting(true);
    try {
      await signup({
        fullName,
        email,
        password,
        position,
        unit: unit as UserUnit,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Green background with logo */}
      <div className="hidden md:flex md:w-1/2 bg-smartAudit-green text-white items-center justify-center flex-col p-8">
        <Logo size="lg" />
        <div className="text-center mt-8">
          <h2 className="text-4xl font-bold">Welcome to</h2>
          <h1 className="text-6xl font-bold mt-4">FUNAAB</h1>
          <h3 className="text-3xl font-medium mt-2">SmartAudit</h3>
          <p className="mt-8 text-sm opacity-80">
            Powered by The Federal University of Agriculture, Abeokuta.
          </p>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo for mobile view */}
          <div className="md:hidden flex justify-center mb-6">
            <Logo size="md" />
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <h2 className="text-2xl font-bold text-center">Create Account</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="example@email.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="Accountant, Auditor, etc."
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={unit}
                    onValueChange={(value) => setUnit(value as UserUnit)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUDIT">AUDIT</SelectItem>
                      <SelectItem value="REGISTRY">REGISTRY</SelectItem>
                      <SelectItem value="BURSARY">BURSARY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {passwordError && (
                    <p className="text-destructive text-sm">{passwordError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-smartAudit-green hover:bg-smartAudit-green/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Account
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-smartAudit-green font-medium hover:underline"
                >
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
