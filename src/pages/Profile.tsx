
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import {
  LogOut,
  Mail,
  Briefcase,
  Building,
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Profile" />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback className="bg-smartAudit-green text-white text-2xl">
              {user.fullName.split(" ").map((name) => name[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
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
