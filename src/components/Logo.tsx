
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  white?: boolean;
}

const Logo = ({ size = "md", white = false }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 ${
          white ? "border-white text-white" : "border-smartAudit-green text-smartAudit-green"
        } flex items-center justify-center font-bold`}
      >
        SA
      </div>
    </div>
  );
};

export default Logo;
