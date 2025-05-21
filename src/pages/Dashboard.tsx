
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { useUsers } from "@/context/UsersContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import Logo from "@/components/Logo";
import { User } from "@/context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getAllMessages, getUserById } = useUsers();
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const messages = await getAllMessages();
        
        // Filter and sort messages
        const userMessages = messages
          .filter(msg => msg.receiverId === user?.id || msg.senderId === user?.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 3);
        
        // Get user information for each message
        const messagesWithUsers = await Promise.all(
          userMessages.map(async (message) => {
            const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
            const otherUser = await getUserById(otherUserId);
            return {
              ...message,
              otherUser
            };
          })
        );
        
        setRecentMessages(messagesWithUsers);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [getAllMessages, getUserById, user?.id]);

  const units = [
    {
      name: "AUDIT",
      icon: "📊",
      description: "Audit unit personnel",
      bgColor: "bg-blue-100",
      color: "text-blue-700",
    },
    {
      name: "BURSARY",
      icon: "💰",
      description: "Bursary unit personnel",
      bgColor: "bg-green-100",
      color: "text-green-700",
    },
    {
      name: "REGISTRY",
      icon: "📋",
      description: "Registry unit personnel",
      bgColor: "bg-amber-100",
      color: "text-amber-700",
    },
  ];

  const handleUnitClick = (unit: string) => {
    navigate(`/unit/${unit}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DesktopNav />
      <Header title="Dashboard" />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <div className="mr-4">
            <Logo size="md" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.fullName}</h2>
            <p className="text-gray-600">
              {user?.position} • {user?.unit}
            </p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Units</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {units.map((unit) => (
              <Card
                key={unit.name}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleUnitClick(unit.name)}
              >
                <CardContent className="flex items-center p-6">
                  <div
                    className={`w-12 h-12 rounded-full ${unit.bgColor} ${unit.color} flex items-center justify-center text-2xl mr-4`}
                  >
                    {unit.icon}
                  </div>
                  <div>
                    <h4 className="font-bold">{unit.name}</h4>
                    <p className="text-sm text-gray-500">{unit.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-smartAudit-green"></div>
                </div>
              ) : recentMessages.length > 0 ? (
                <div className="divide-y">
                  {recentMessages.map(message => {
                    const otherUser = message.otherUser;
                    
                    return (
                      <div 
                        key={message.id} 
                        className="py-3 cursor-pointer hover:bg-gray-50 px-2 rounded-md"
                        onClick={() => navigate(`/chat/${otherUser?.id}`)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback className="bg-smartAudit-green text-white text-xs">
                              {otherUser?.fullName?.split(" ").map((name: string) => name[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium text-sm">{otherUser?.fullName}</p>
                              <span className="text-xs text-gray-500">
                                {format(new Date(message.timestamp), "h:mm a")}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {message.senderId === user?.id ? "You: " : ""}
                              {message.type === "text" ? message.content : 
                               message.type === "image" ? "Image" : 
                               message.type === "document" ? "Document" : "Voice Message"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Your recent communications will appear here
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Dashboard;
