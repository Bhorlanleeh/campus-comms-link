
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/welcome");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Logo size="lg" />
        <h1 className="text-4xl font-bold mb-4 mt-6">Redirecting...</h1>
        <p className="text-xl text-gray-600">Please wait</p>
      </div>
    </div>
  );
};

export default Index;
