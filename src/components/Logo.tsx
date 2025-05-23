
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  white?: boolean;
}

const Logo = ({ size = "md", white = false }: LogoProps) => {
  const sizeClasses = {
    sm: "h-12",
    md: "h-20",
    lg: "h-28",
  };

  return (
    <div className="flex items-center justify-center">
      <img 
        src="/lovable-uploads/bcd3fe0d-5539-458e-b50c-292b9a4d9fad.png" 
        alt="FUNAAB Logo" 
        className={`${sizeClasses[size]} ${white ? "filter brightness-0 invert" : ""}`}
      />
    </div>
  );
};

export default Logo;
