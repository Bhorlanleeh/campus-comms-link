
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Search,
  User,
  Bell,
} from "lucide-react";

interface BottomNavProps {
  activeTab?: "chats" | "find" | "profile" | "notifications";
}

const BottomNav = ({ activeTab }: BottomNavProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-white flex items-center justify-around z-10 md:hidden">
      <button
        className={`flex flex-col items-center justify-center w-1/4 h-full ${
          activeTab === "chats" ? "text-smartAudit-green" : "text-gray-500"
        }`}
        onClick={() => navigate("/chats")}
      >
        <MessageSquare className="h-5 w-5 mb-1" />
        <span className="text-xs">Chats</span>
      </button>
      
      <button
        className={`flex flex-col items-center justify-center w-1/4 h-full ${
          activeTab === "notifications" ? "text-smartAudit-green" : "text-gray-500"
        }`}
        onClick={() => navigate("/notifications")}
      >
        <Bell className="h-5 w-5 mb-1" />
        <span className="text-xs">Notifications</span>
      </button>
      
      <button
        className={`flex flex-col items-center justify-center w-1/4 h-full ${
          activeTab === "find" ? "text-smartAudit-green" : "text-gray-500"
        }`}
        onClick={() => navigate("/find")}
      >
        <Search className="h-5 w-5 mb-1" />
        <span className="text-xs">Find</span>
      </button>
      
      <button
        className={`flex flex-col items-center justify-center w-1/4 h-full ${
          activeTab === "profile" ? "text-smartAudit-green" : "text-gray-500"
        }`}
        onClick={() => navigate("/profile")}
      >
        <User className="h-5 w-5 mb-1" />
        <span className="text-xs">Profile</span>
      </button>
    </div>
  );
};

export default BottomNav;
