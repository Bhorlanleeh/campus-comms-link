
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      <Header title="Dashboard" />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Welcome, {user?.fullName}</h2>
          <p className="text-gray-600">
            {user?.position} • {user?.unit}
          </p>
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
              <p className="text-center text-gray-500 py-8">
                Your recent communications will appear here
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Dashboard;
