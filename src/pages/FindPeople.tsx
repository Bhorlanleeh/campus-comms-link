
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";

const FindPeople = () => {
  const { user } = useAuth();
  const { getAllUsers } = useUsers();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const allUsers = getAllUsers().filter((u) => u.id !== user?.id);
  
  const filteredUsers = allUsers.filter((u) => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleUserClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DesktopNav activeTab="find" />
      <Header title="Find People" showBackButton showHomeButton />
      
      <div className="p-4 bg-white shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Search by name, position or unit..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <main className="flex-1 overflow-y-auto px-4 py-2 pb-20">
        {filteredUsers.length > 0 ? (
          <div className="space-y-2 divide-y divide-gray-100">
            {filteredUsers.map((otherUser) => (
              <div
                key={otherUser.id}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
                onClick={() => handleUserClick(otherUser.id)}
              >
                <Avatar className="h-12 w-12 mr-3">
                  {otherUser.avatarUrl ? (
                    <AvatarImage src={otherUser.avatarUrl} alt={otherUser.fullName} />
                  ) : (
                    <AvatarFallback className="bg-smartAudit-green text-white">
                      {otherUser.fullName.split(" ").map(name => name[0]).join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex flex-col">
                  <h3 className="font-medium">{otherUser.fullName}</h3>
                  <p className="text-sm text-gray-500">
                    {otherUser.position} • {otherUser.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500">No users found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </main>
      
      <BottomNav activeTab="find" />
    </div>
  );
};

export default FindPeople;
