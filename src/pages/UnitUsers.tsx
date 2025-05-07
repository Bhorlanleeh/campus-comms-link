
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserUnit, useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const UnitUsers = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUsersByUnit } = useUsers();
  
  if (!unitId) {
    navigate("/dashboard");
    return null;
  }
  
  const users = getUsersByUnit(unitId as UserUnit);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        title={`${unitId} Unit`} 
        showBackButton 
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">
          {users.length} {users.length === 1 ? "Person" : "People"} in {unitId}
        </h2>
        
        <div className="space-y-3">
          {users.map((unitUser) => (
            <Card 
              key={unitUser.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/chat/${unitUser.id}`)}
            >
              <CardContent className="p-4 flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarFallback className="bg-smartAudit-green text-white">
                    {unitUser.fullName.split(" ").map(name => name[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{unitUser.fullName}</h3>
                    {unitUser.id === user?.id && (
                      <Badge className="ml-2 bg-smartAudit-green">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{unitUser.position}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No users found in this unit</p>
          </div>
        )}
      </main>
      
      <BottomNav activeTab="find" />
    </div>
  );
};

export default UnitUsers;
