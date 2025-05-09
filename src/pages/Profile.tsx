
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import Logo from "@/components/Logo";
import {
  LogOut,
  Mail,
  Briefcase,
  Building,
  Upload,
  Home,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, logout, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
  
  // Ensure we're showing the latest avatar URL from both Supabase and local storage
  useEffect(() => {
    const fetchCurrentAvatar = async () => {
      if (!user) return;
      
      try {
        // Try to get the avatar directly from Supabase as a check
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
          
        if (profile?.avatar_url) {
          console.log("Found avatar URL in profile:", profile.avatar_url);
          setAvatarUrl(profile.avatar_url);
        } else {
          console.log("Using avatar URL from user object:", user.avatarUrl);
          setAvatarUrl(user.avatarUrl);
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
        // Fallback to the user object
        setAvatarUrl(user.avatarUrl);
      }
    };
    
    fetchCurrentAvatar();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile picture must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      await updateUserAvatar(file);
      // Update local state with the new avatar URL
      setAvatarUrl(user?.avatarUrl);
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
      console.error("Error uploading profile picture:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DesktopNav activeTab="profile" />
      <Header title="Profile" showBackButton />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Avatar className="h-24 w-24 mb-4">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user.fullName} />
              ) : (
                <AvatarFallback className="bg-smartAudit-green text-white text-2xl">
                  {user.fullName.split(" ").map((name) => name[0]).join("")}
                </AvatarFallback>
              )}
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-2 right-0 rounded-full bg-white p-1 shadow-md cursor-pointer hover:bg-gray-100 border border-gray-200"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 text-gray-600" />
              )}
              <input 
                id="avatar-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
          <Badge className="mt-2 bg-smartAudit-green">{user.unit}</Badge>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p>{user.position}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p>{user.unit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </main>
      
      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
