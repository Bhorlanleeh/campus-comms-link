
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useUsers } from "@/context/UsersContext";

const FindPeople = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getAllUsers } = useUsers();
  
  const allUsers = getAllUsers().filter(u => u.id !== user?.id);
  
  const getUnitColor = (unit: string) => {
    switch (unit) {
      case "AUDIT":
        return "bg-blue-100 text-blue-700";
      case "REGISTRY":
        return "bg-amber-100 text-amber-700";
      case "BURSARY":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Find People" />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 grid grid-cols-3 gap-3 text-center">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/unit/AUDIT")}
          >
            <CardContent className="p-4">
              <p className="font-semibold">AUDIT</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/unit/BURSARY")}
          >
            <CardContent className="p-4">
              <p className="font-semibold">BURSARY</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/unit/REGISTRY")}
          >
            <CardContent className="p-4">
              <p className="font-semibold">REGISTRY</p>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">All Personnel</h2>
        
        <div className="space-y-3">
          {allUsers.map((person) => (
            <Card
              key={person.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/chat/${person.id}`)}
            >
              <CardContent className="p-4 flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarFallback className="bg-smartAudit-green text-white">
                    {person.fullName.split(" ").map((name) => name[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-start">
                    <h3 className="font-medium">{person.fullName}</h3>
                    <Badge className={`ml-2 ${getUnitColor(person.unit)}`}>
                      {person.unit}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{person.position}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      
      <BottomNav activeTab="find" />
    </div>
  );
};

export default FindPeople;
