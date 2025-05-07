
import React from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const { user } = useAuth();
  const { getAllMessages } = useUsers();
  const navigate = useNavigate();
  
  // Get all messages sent to the current user
  const allMessages = getAllMessages();
  
  // Filter and sort notifications (newest first)
  const notifications = allMessages
    .filter(message => message.receiverId === user?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const handleNotificationClick = (senderId: string) => {
    navigate(`/chat/${senderId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DesktopNav activeTab="notifications" />
      <Header 
        title="Notifications" 
        showAvatar 
        avatarFallback={user?.fullName?.split(" ").map(name => name[0]).join("") || ""}
      />
      
      <main className="flex-1 overflow-y-auto px-4 py-2">
        {notifications.length > 0 ? (
          <div className="space-y-4 pb-20">
            {notifications.map(notification => {
              const sender = notification.sender;
              return (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.senderId)}
                  className="bg-white p-4 rounded-lg shadow-sm flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-smartAudit-green text-white">
                      {sender?.fullName.split(" ").map(name => name[0]).join("") || "??"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{sender?.fullName || "Unknown"}</p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(notification.timestamp), "h:mm a")}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.type === "text" && notification.content}
                      {notification.type === "image" && "Sent you an image"}
                      {notification.type === "document" && `Sent you a document: ${notification.content}`}
                      {notification.type === "voice" && "Sent you a voice message"}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(notification.timestamp), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-lg">No notifications yet</h3>
            <p className="text-gray-500 text-sm mt-2">
              When you receive new messages, they'll appear here
            </p>
          </div>
        )}
      </main>
      
      <div className="h-16 md:hidden"></div>
      <BottomNav activeTab="notifications" />
    </div>
  );
};

export default Notifications;
