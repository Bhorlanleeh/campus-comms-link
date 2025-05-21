
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, MessageSquare, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/context/UsersContext";
import { Badge } from "@/components/ui/badge";

interface DesktopNavProps {
  activeTab?: "chats" | "find" | "profile" | "notifications";
}

const DesktopNav = ({ activeTab }: DesktopNavProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAllMessages } = useUsers();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get unread notifications (in a real app, we'd filter by read status)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      
      try {
        const messages = await getAllMessages();
        const unread = messages.filter(msg => msg.receiverId === user?.id && !msg.is_read);
        setUnreadCount(unread.length);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
  }, [getAllMessages, user?.id]);
  
  const navItems = [
    { 
      label: "Chats", 
      icon: MessageSquare, 
      route: "/chats", 
      active: activeTab === "chats" 
    },
    { 
      label: "Notifications", 
      icon: Bell, 
      route: "/notifications", 
      active: activeTab === "notifications",
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { 
      label: "Find People", 
      icon: Search, 
      route: "/find", 
      active: activeTab === "find" 
    },
    { 
      label: "Profile", 
      icon: User, 
      route: "/profile", 
      active: activeTab === "profile" 
    },
  ];

  return (
    <div className="hidden md:flex h-16 border-b bg-white items-center px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
        <div className="flex items-center">
          <div onClick={() => navigate("/dashboard")} className="cursor-pointer">
            <Logo size="sm" />
          </div>
          <h1 className="ml-4 font-bold text-xl text-smartAudit-green">SmartAudit</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.route}
              variant="ghost"
              className={`flex items-center gap-2 ${
                item.active ? "text-smartAudit-green" : "text-gray-600"
              }`}
              onClick={() => navigate(item.route)}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden lg:inline">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
          
          {user && (
            <Avatar 
              className="h-8 w-8 cursor-pointer" 
              onClick={() => navigate("/profile")}
            >
              <AvatarFallback className="bg-smartAudit-green text-white">
                {user.fullName?.split(" ").map(name => name[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopNav;
