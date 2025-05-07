
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { format } from "date-fns";

const AllChats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAllUsers, getMessages } = useUsers();
  
  const allUsers = getAllUsers();
  
  // Filter out current user and sort users by last message time
  const chatUsers = allUsers
    .filter((u) => u.id !== user?.id)
    .map((u) => {
      const messages = getMessages(u.id);
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      return {
        ...u,
        lastMessage,
      };
    })
    .filter((u) => u.lastMessage) // Only users with messages
    .sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
    });
  
  const getLastMessagePreview = (type: string, content: string) => {
    switch (type) {
      case "text":
        return content.length > 30 ? `${content.substring(0, 30)}...` : content;
      case "image":
        return "📷 Image";
      case "document":
        return "📄 Document";
      case "voice":
        return "🎤 Voice Message";
      default:
        return "New message";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="All Chats" />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-3">
          {chatUsers.map((chatUser) => (
            <Card
              key={chatUser.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/chat/${chatUser.id}`)}
            >
              <CardContent className="p-4 flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarFallback className="bg-smartAudit-green text-white">
                    {chatUser.fullName.split(" ").map((name) => name[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{chatUser.fullName}</h3>
                    {chatUser.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {format(chatUser.lastMessage.timestamp, "MMM d")}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate">
                      {chatUser.lastMessage &&
                        getLastMessagePreview(
                          chatUser.lastMessage.type,
                          chatUser.lastMessage.content
                        )}
                    </p>
                    <span className="text-xs text-gray-500 ml-2">
                      {chatUser.lastMessage &&
                        format(chatUser.lastMessage.timestamp, "h:mm a")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {chatUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-gray-400 text-sm">
              Start a chat with someone from the Find People tab
            </p>
          </div>
        )}
      </main>
      
      <BottomNav activeTab="chats" />
    </div>
  );
};

export default AllChats;
