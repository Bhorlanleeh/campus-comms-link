
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserUnit, useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/utils/supabaseUtils";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: "text" | "voice" | "document" | "image";
  fileUrl?: string;
  sender?: User;
  is_read?: boolean;
}

interface UsersContextType {
  getUsersByUnit: (unit: UserUnit) => Promise<User[]>;
  getAllUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | undefined>;
  getMessages: (userId: string) => Promise<Message[]>;
  sendMessage: (receiverId: string, content: string, type: Message['type'], fileUrl?: string) => Promise<void>;
  getAllMessages: () => Promise<Message[]>;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Fetch users by unit from Supabase
  const getUsersByUnit = async (unit: UserUnit): Promise<User[]> => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('unit', unit);

      if (error) {
        console.error("Error fetching users by unit:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again later.",
          variant: "destructive",
        });
        return [];
      }

      // Map profiles to User format
      return profiles.map(profile => ({
        id: profile.id,
        fullName: profile.full_name || 'Unknown User',
        position: profile.position || '',
        unit: profile.unit as UserUnit,
        avatarUrl: profile.avatar_url,
        email: '' // We don't expose email in profile table
      }));
    } catch (err) {
      console.error("Failed to fetch users by unit:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get all users from Supabase
  const getAllUsers = async (): Promise<User[]> => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error("Error fetching all users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again later.",
          variant: "destructive",
        });
        return [];
      }

      // Map profiles to User format
      return profiles.map(profile => ({
        id: profile.id,
        fullName: profile.full_name || 'Unknown User',
        position: profile.position || '',
        unit: profile.unit as UserUnit,
        avatarUrl: profile.avatar_url,
        email: '' // We don't expose email in profile table
      }));
    } catch (err) {
      console.error("Failed to fetch all users:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get a single user by ID from Supabase
  const getUserById = async (id: string): Promise<User | undefined> => {
    if (!id) return undefined;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !profile) {
        console.error("Error fetching user by ID:", error);
        return undefined;
      }

      return {
        id: profile.id,
        fullName: profile.full_name || 'Unknown User',
        position: profile.position || '',
        unit: profile.unit as UserUnit,
        avatarUrl: profile.avatar_url,
        email: '' // We don't expose email in profile table
      };
    } catch (err) {
      console.error("Failed to fetch user by ID:", err);
      return undefined;
    }
  };

  // Get messages between current user and a specific user
  const getMessages = async (userId: string): Promise<Message[]> => {
    if (!user?.id || !userId) return [];
    
    try {
      setLoading(true);
      
      // Get messages where current user is sender or receiver and the other user is the specified userId
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again later.",
          variant: "destructive",
        });
        return [];
      }

      // Map database messages to Message format
      const formattedMessages: Message[] = await Promise.all(messages.map(async (msg) => {
        const sender = await getUserById(msg.sender_id);
        
        return {
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          content: msg.content || '',
          timestamp: new Date(msg.created_at),
          type: msg.type as "text" | "voice" | "document" | "image",
          fileUrl: msg.file_url,
          sender,
          is_read: msg.is_read
        };
      }));

      return formattedMessages;
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Send a message to another user
  const sendMessage = async (
    receiverId: string, 
    content: string, 
    type: Message['type'], 
    fileUrl?: string
  ): Promise<void> => {
    if (!user?.id || !receiverId) return;

    try {
      let finalFileUrl = fileUrl;
      
      // Handle file upload if it's a file message and we have a File object
      if ((type === 'image' || type === 'document' || type === 'voice') && !fileUrl && content) {
        try {
          // Convert base64 to File if necessary
          const file = await fetch(content).then(res => res.blob());
          const fileName = `${uuidv4()}.${type === 'image' ? 'png' : type === 'document' ? 'pdf' : 'mp3'}`;
          const uploadedFile = new File([file], fileName, { type: file.type });
          
          // Upload to Supabase
          finalFileUrl = await uploadFile('chat_media', `${user.id}/${fileName}`, uploadedFile);
        } catch (err) {
          console.error("Failed to upload file:", err);
          toast({
            title: "Error",
            description: "Failed to upload file. Please try again later.",
            variant: "destructive",
          });
          return;
        }
      }

      // Insert message into database
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          type,
          file_url: finalFileUrl
        });

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get all messages for the current user
  const getAllMessages = async (): Promise<Message[]> => {
    if (!user?.id) return [];
    
    try {
      setLoading(true);
      
      // Get all messages where current user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching all messages:", error);
        return [];
      }

      // Map database messages to Message format with sender info
      const formattedMessages: Message[] = await Promise.all(messages.map(async (msg) => {
        const sender = await getUserById(msg.sender_id);
        
        return {
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          content: msg.content || '',
          timestamp: new Date(msg.created_at),
          type: msg.type as "text" | "voice" | "document" | "image",
          fileUrl: msg.file_url,
          sender,
          is_read: msg.is_read
        };
      }));

      return formattedMessages;
    } catch (err) {
      console.error("Failed to fetch all messages:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return (
    <UsersContext.Provider
      value={{
        getUsersByUnit,
        getAllUsers,
        getUserById,
        getMessages,
        sendMessage,
        getAllMessages,
        loading
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};
