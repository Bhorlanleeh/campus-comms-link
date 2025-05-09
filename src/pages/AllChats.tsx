
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import Logo from "@/components/Logo";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AllChats = () => {
  const { user } = useAuth();
  const { getAllUsers, getUserById } = useUsers();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchChatsData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // First get all users
        const allUsers = await getAllUsers();
        
        // Then get unique chat partners
        const { data, error } = await supabase
          .from('messages')
          .select('sender_id, receiver_id, content, type, created_at, file_url')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching chats:", error);
          setIsLoading(false);
          return;
        }
        
        // Get unique user IDs the current user has chatted with
        const chatUserIds = new Set<string>();
        data.forEach(msg => {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          chatUserIds.add(partnerId);
        });
        
        // For each unique user, find the last message
        const chatData = await Promise.all(
          Array.from(chatUserIds).map(async (partnerId) => {
            const partnerUser = allUsers.find(u => u.id === partnerId);
            
            // Get latest message between these users
            const { data: latestMsg } = await supabase
              .from('messages')
              .select('*')
              .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            return {
              user: partnerUser,
              lastMessage: latestMsg ? {
                content: latestMsg.content,
                type: latestMsg.type,
                senderId: latestMsg.sender_id,
                timestamp: new Date(latestMsg.created_at)
              } : null,
              hasMessages: !!latestMsg
            };
          })
        );
        
        // Sort by last message time
        const sortedChats = chatData
          .filter(chat => chat.user) // Filter out undefined users
          .sort((a, b) => {
            if (a.lastMessage && b.lastMessage) {
              return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
            }
            if (a.lastMessage) return -1;
            if (b.lastMessage) return 1;
            return 0;
          });
          
        setChats(sortedChats);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatsData();
    
    // Set up realtime listener for new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user?.id},receiver_id.eq.${user?.id})`
        },
        () => {
          // Refresh chat list when new message arrives
          fetchChatsData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, getAllUsers, getUserById]);
  
  const handleUserClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };
  
  // Fallback for users without chats - show all users
  useEffect(() => {
    const showAllUsersIfNoChats = async () => {
      if (chats.length === 0 && !isLoading) {
        const allUsers = await getAllUsers();
        const otherUsers = allUsers.filter(u => u.id !== user?.id);
        
        const usersWithNoMessages = otherUsers.map(otherUser => ({
          user: otherUser,
          lastMessage: null,
          hasMessages: false
        }));
        
        setChats(usersWithNoMessages);
      }
    };
    
    showAllUsersIfNoChats();
  }, [chats.length, isLoading, getAllUsers, user?.id]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DesktopNav activeTab="chats" />
      <Header title="Chats" />
      
      <main className="flex-1 overflow-y-auto px-4 py-2 pb-20">
        <div className="mb-4">
          <Logo size="sm" />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-smartAudit-green" />
          </div>
        ) : chats.length > 0 ? (
          <div className="space-y-2 divide-y divide-gray-100">
            {chats.map(({ user: otherUser, lastMessage }) => (
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
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{otherUser.fullName}</h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">
                        {format(new Date(lastMessage.timestamp), "h:mm a")}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500 truncate max-w-[70%]">
                      {lastMessage ? (
                        lastMessage.senderId === user?.id ? "You: " : ""
                      ) : ""} 
                      {lastMessage ? (
                        lastMessage.type === "text" ? lastMessage.content : 
                        lastMessage.type === "image" ? "Image" : 
                        lastMessage.type === "document" ? "Document" : "Voice Message"
                      ) : 
                        `${otherUser.position} • ${otherUser.unit}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-500">No users available</p>
            <p className="text-gray-400 text-sm mt-1">
              Once users sign up, they'll appear here
            </p>
          </div>
        )}
      </main>
      
      <BottomNav activeTab="chats" />
    </div>
  );
};

export default AllChats;
