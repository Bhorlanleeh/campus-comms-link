
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showAvatar?: boolean;
  avatarFallback?: string;
}

const Header = ({
  title,
  subtitle,
  showBackButton = false,
  showAvatar = false,
  avatarFallback,
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 border-b bg-white sticky top-0 z-10 flex items-center px-4">
      <div className="flex items-center w-full max-w-screen-xl mx-auto">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="mr-2 -ml-2 p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {showAvatar && avatarFallback && (
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback className="bg-smartAudit-green text-white">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex-1">
          <h1 className="font-semibold">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default Header;
