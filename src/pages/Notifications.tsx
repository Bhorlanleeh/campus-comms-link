
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Bell, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  userId: string;
  relatedUserId: string;
  messageId: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender?: {
    id: string;
    fullName: string;
    position: string;
    avatarUrl?: string;
  };
}

const Notifications = () => {
  const { user } = useAuth();
  const { getUserById } = useUsers();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching notifications:", error);
          toast({
            title: "Error loading notifications",
            description: "Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        // Format and add sender data to notifications
        const formattedNotifications: Notification[] = await Promise.all(
          data.map(async (notif) => {
            let sender;
            if (notif.related_user_id) {
              sender = await getUserById(notif.related_user_id);
            }
            
            return {
              id: notif.id,
              userId: notif.user_id,
              relatedUserId: notif.related_user_id || "",
              messageId: notif.message_id || "",
              type: notif.type,
              content: notif.content,
              isRead: notif.is_read,
              createdAt: new Date(notif.created_at),
              sender: sender ? {
                id: sender.id,
                fullName: sender.fullName,
                position: sender.position,
                avatarUrl: sender.avatarUrl
              } : undefined
            };
          })
        );
        
        setNotifications(formattedNotifications);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Set up realtime listener
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id.eq.${user?.id}`
        },
        () => {
          // Refresh notifications when a new one arrives
          fetchNotifications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, getUserById]);
  
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);
        
      if (error) {
        console.error("Error marking notification as read:", error);
      } else {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }
    }
    
    // Navigate to the appropriate chat
    if (notification.relatedUserId) {
      navigate(`/chat/${notification.relatedUserId}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DesktopNav activeTab="notifications" />
      <Header 
        title="Notifications" 
        showAvatar 
        avatarUrl={user?.avatarUrl}
        avatarFallback={user?.fullName?.split(" ").map(name => name[0]).join("") || ""}
      />
      
      <main className="flex-1 overflow-y-auto px-4 py-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-smartAudit-green" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4 pb-20">
            {notifications.map(notification => {
              const sender = notification.sender;
              return (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white p-4 rounded-lg shadow-sm flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "border-l-4 border-smartAudit-green" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    {sender?.avatarUrl ? (
                      <AvatarImage src={sender.avatarUrl} alt={sender.fullName} />
                    ) : (
                      <AvatarFallback className="bg-smartAudit-green text-white">
                        {sender?.fullName.split(" ").map(name => name[0]).join("") || "??"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className={`font-medium ${!notification.isRead ? "text-smartAudit-green" : ""}`}>
                        {sender?.fullName || "Unknown"}
                      </p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(notification.createdAt), "h:mm a")}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.content}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(notification.createdAt), "MMM d, yyyy")}
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
