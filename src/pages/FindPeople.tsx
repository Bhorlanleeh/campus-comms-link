
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { supabase } from "@/integrations/supabase/client";
import { User, UserUnit } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const FindPeople = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [realUsers, setRealUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uniqueUnits, setUniqueUnits] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Fetch real users from Supabase with improved error handling
  useEffect(() => {
    const fetchRealUsers = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching users from Supabase...");
        
        // Fetch profiles from Supabase with better error handling
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          console.error("Error fetching profiles:", error);
          toast({
            title: "Error fetching users",
            description: "Could not load the user directory. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        if (profiles && profiles.length > 0) {
          console.log(`Successfully fetched ${profiles.length} profiles`);
          
          // Map profiles to User format
          const formattedUsers: User[] = profiles.map(profile => ({
            id: profile.id,
            fullName: profile.full_name || 'Unknown User',
            email: '', // We don't display emails for privacy
            position: profile.position || 'Staff',
            unit: (profile.unit || 'AUDIT') as UserUnit,
            avatarUrl: profile.avatar_url
          }));
          
          // Filter out current user
          const filteredUsers = formattedUsers.filter(u => u.id !== user?.id);
          setRealUsers(filteredUsers);
          
          // Extract all unique units for the filter
          const units = [...new Set(formattedUsers.map(u => u.unit))].filter(Boolean);
          setUniqueUnits(units);
          
          console.log("Users set in state:", filteredUsers.length);
        } else {
          console.log("No profiles found in Supabase");
          setRealUsers([]);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast({
          title: "Error loading users",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRealUsers();
  }, [user?.id, toast]);
  
  // Apply filters to users - fix handling of search term
  const filteredUsers = React.useMemo(() => {
    return realUsers.filter((u) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      const matchesSearch = 
        u.fullName.toLowerCase().includes(lowerSearchTerm) || 
        u.position.toLowerCase().includes(lowerSearchTerm) ||
        u.unit.toLowerCase().includes(lowerSearchTerm);
      
      const matchesUnit = unitFilter && unitFilter !== "all" ? u.unit === unitFilter : true;
      
      return matchesSearch && matchesUnit;
    });
  }, [realUsers, searchTerm, unitFilter]);
  
  const handleUserClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DesktopNav activeTab="find" />
      <Header title="Find People" showBackButton showHomeButton />
      
      <div className="p-4 bg-white shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Search by name, position or unit..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        <Select 
          value={unitFilter} 
          onValueChange={(val) => setUnitFilter(val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            {uniqueUnits.map((unit) => (
              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <main className="flex-1 overflow-y-auto px-4 py-2 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smartAudit-green"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
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
            <p className="text-sm text-gray-400 mt-1">Try a different search term or filter</p>
          </div>
        )}
      </main>
      
      <BottomNav activeTab="find" />
    </div>
  );
};

export default FindPeople;
