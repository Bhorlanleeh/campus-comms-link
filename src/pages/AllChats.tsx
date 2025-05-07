
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import Logo from "@/components/Logo";

const AllChats = () => {
  const { user } = useAuth();
  const { getAllUsers, getUserById, getMessages } = useUsers();
  const navigate = useNavigate();
  
  const allUsers = getAllUsers().filter((u) => u.id !== user?.id);
  
  // Get users with messages first
  const usersWithActivity = allUsers.map((otherUser) => {
    const messages = getMessages(otherUser.id);
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    
    return {
      user: otherUser,
      lastMessage,
      hasMessages: messages.length > 0,
    };
  });
  
  // Sort by those with messages first, then by last message time
  const sortedUsers = usersWithActivity.sort((a, b) => {
    if (a.hasMessages && !b.hasMessages) return -1;
    if (!a.hasMessages && b.hasMessages) return 1;
    if (a.lastMessage && b.lastMessage) {
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    }
    return 0;
  });
  
  const handleUserClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DesktopNav activeTab="chats" />
      <Header title="Chats" />
      
      <main className="flex-1 overflow-y-auto px-4 py-2 pb-20">
        <div className="mb-4">
          <Logo size="sm" />
        </div>
        
        {sortedUsers.length > 0 ? (
          <div className="space-y-2 divide-y divide-gray-100">
            {sortedUsers.map(({ user: otherUser, lastMessage }) => (
              <div
                key={otherUser.id}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
                onClick={() => handleUserClick(otherUser.id)}
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarFallback className="bg-smartAudit-green text-white">
                    {otherUser.fullName.split(" ").map(name => name[0]).join("")}
                  </AvatarFallback>
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
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500">No chats yet</p>
          </div>
        )}
      </main>
      
      <BottomNav activeTab="chats" />
    </div>
  );
};

export default AllChats;
