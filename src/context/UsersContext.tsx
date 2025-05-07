
import React, { createContext, useContext, useState } from "react";
import { User, UserUnit, useAuth } from "./AuthContext";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: "text" | "voice" | "document" | "image";
  fileUrl?: string;
  sender?: User;
}

interface UsersContextType {
  getUsersByUnit: (unit: UserUnit) => User[];
  getAllUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  getMessages: (userId: string) => Message[];
  sendMessage: (receiverId: string, content: string, type: Message['type'], fileUrl?: string) => void;
  getAllMessages: () => Message[];
}

// Mock messages for demo purposes
const mockMessages: Record<string, Message[]> = {
  "1_2": [
    {
      id: "m1",
      senderId: "1",
      receiverId: "2",
      content: "Hello Jane, can you send me the audit report?",
      timestamp: new Date(2025, 4, 1, 10, 30),
      type: "text",
    },
    {
      id: "m2",
      senderId: "2",
      receiverId: "1",
      content: "Sure, I'll send it right away.",
      timestamp: new Date(2025, 4, 1, 10, 32),
      type: "text",
    },
    {
      id: "m3",
      senderId: "2",
      receiverId: "1",
      content: "Annual Audit Report.pdf",
      timestamp: new Date(2025, 4, 1, 10, 35),
      type: "document",
      fileUrl: "#",
    },
  ],
  "1_3": [
    {
      id: "m4",
      senderId: "1",
      receiverId: "3",
      content: "Hi Bob, when will the financial report be ready?",
      timestamp: new Date(2025, 4, 2, 9, 15),
      type: "text",
    },
    {
      id: "m5",
      senderId: "3",
      receiverId: "1",
      content: "I'm working on it. Should be done by EOD.",
      timestamp: new Date(2025, 4, 2, 9, 20),
      type: "text",
    },
  ],
  "2_3": [
    {
      id: "m6",
      senderId: "2",
      receiverId: "3",
      content: "Bob, do you have the budget forecast?",
      timestamp: new Date(2025, 4, 3, 14, 5),
      type: "text",
    },
    {
      id: "m7",
      senderId: "3",
      receiverId: "2",
      content: "Yes, here's the latest version.",
      timestamp: new Date(2025, 4, 3, 14, 10),
      type: "text",
    },
    {
      id: "m8",
      senderId: "3",
      receiverId: "2",
      content: "Budget Forecast Q2 2025.xlsx",
      timestamp: new Date(2025, 4, 3, 14, 12),
      type: "document",
      fileUrl: "#",
    },
  ],
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  
  // These would come from an API in a real application
  const mockUsers: User[] = [
    {
      id: "1",
      fullName: "John Doe",
      email: "john@example.com",
      position: "Accountant",
      unit: "AUDIT",
    },
    {
      id: "2",
      fullName: "Jane Smith",
      email: "jane@example.com",
      position: "Manager",
      unit: "REGISTRY",
    },
    {
      id: "3",
      fullName: "Bob Johnson",
      email: "bob@example.com",
      position: "Financial Analyst",
      unit: "BURSARY",
    },
    {
      id: "4",
      fullName: "Alice Brown",
      email: "alice@example.com",
      position: "Senior Auditor",
      unit: "AUDIT",
    },
    {
      id: "5",
      fullName: "Charlie Davis",
      email: "charlie@example.com",
      position: "Records Officer",
      unit: "REGISTRY",
    },
    {
      id: "6",
      fullName: "Eva Wilson",
      email: "eva@example.com",
      position: "Financial Controller",
      unit: "BURSARY",
    },
  ];

  const getUsersByUnit = (unit: UserUnit) => {
    return mockUsers.filter((u) => u.unit === unit);
  };

  const getAllUsers = () => {
    return mockUsers;
  };

  const getUserById = (id: string) => {
    return mockUsers.find((u) => u.id === id);
  };

  const getMessages = (userId: string) => {
    if (!user) return [];
    
    const key1 = `${user.id}_${userId}`;
    const key2 = `${userId}_${user.id}`;
    
    const messages = [...(mockMessages[key1] || []), ...(mockMessages[key2] || [])];
    
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  // Add this new function to get all messages
  const getAllMessages = () => {
    if (!user) return [];
    
    // Flatten all messages into a single array
    const allMessages = Object.values(mockMessages).flat();
    
    // Add sender information to each message
    const messagesWithSenders = allMessages.map(message => {
      const sender = getUserById(message.senderId);
      return { ...message, sender };
    });
    
    // Filter messages for current user (sent to or received by)
    return messagesWithSenders.filter(
      message => message.senderId === user.id || message.receiverId === user.id
    );
  };

  const sendMessage = (receiverId: string, content: string, type: Message['type'], fileUrl?: string) => {
    if (!user) return;
    
    const key = `${user.id}_${receiverId}`;
    if (!mockMessages[key]) {
      mockMessages[key] = [];
    }
    
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: user.id,
      receiverId,
      content,
      timestamp: new Date(),
      type,
      fileUrl,
    };
    
    mockMessages[key].push(newMessage);
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
