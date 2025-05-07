
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Paperclip,
  Mic,
  Send,
  Image,
  File,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Chat = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserById, getMessages, sendMessage } = useUsers();
  const [message, setMessage] = useState("");
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<{
    type: "image" | "document" | null;
    file: File | null;
    preview: string | null;
  }>({ type: null, file: null, preview: null });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const chatUser = getUserById(userId || "");
  const messages = userId ? getMessages(userId) : [];
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if (!userId || !chatUser) {
    navigate("/dashboard");
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (message.trim() || attachment.file) {
      if (attachment.file) {
        if (attachment.type === "image") {
          sendMessage(
            chatUser.id,
            attachment.file.name,
            "image",
            attachment.preview || undefined
          );
        } else if (attachment.type === "document") {
          sendMessage(
            chatUser.id,
            attachment.file.name,
            "document",
            "#"
          );
        }
        setAttachment({ type: null, file: null, preview: null });
      }
      
      if (message.trim()) {
        sendMessage(chatUser.id, message, "text");
        setMessage("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        setAttachment({
          type: "image",
          file,
          preview: reader.result as string,
        });
      };
      
      reader.readAsDataURL(file);
      setIsAttachmentOpen(false);
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setAttachment({
        type: "document",
        file,
        preview: null,
      });
      
      setIsAttachmentOpen(false);
    }
  };

  const handleRecordToggle = () => {
    // In a real app, this would handle voice recording
    setIsRecording(!isRecording);
  };

  const cancelAttachment = () => {
    setAttachment({ type: null, file: null, preview: null });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        title={chatUser.fullName}
        subtitle={chatUser.position}
        showBackButton
        showAvatar
        avatarFallback={chatUser.fullName.split(" ").map(name => name[0]).join("")}
      />
      
      <main className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-4 pb-20">
          {messages.map((msg) => {
            const isCurrentUser = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarFallback className="bg-smartAudit-green text-white text-xs">
                      {chatUser.fullName.split(" ").map(name => name[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[75%] ${
                    isCurrentUser
                      ? "bg-smartAudit-green text-white"
                      : "bg-gray-100 text-gray-800"
                  } rounded-lg p-3`}
                >
                  {msg.type === "text" && <p>{msg.content}</p>}
                  
                  {msg.type === "image" && (
                    <div>
                      <img
                        src={msg.fileUrl || "https://via.placeholder.com/300"}
                        alt="Shared image"
                        className="rounded-md mb-1 w-full"
                      />
                      <p className="text-xs opacity-80">{msg.content}</p>
                    </div>
                  )}
                  
                  {msg.type === "document" && (
                    <div className="flex items-center">
                      <File className="mr-2 h-5 w-5" />
                      <span>{msg.content}</span>
                    </div>
                  )}
                  
                  {msg.type === "voice" && (
                    <div className="flex items-center">
                      <Mic className="mr-2 h-5 w-5" />
                      <span>Voice Message</span>
                    </div>
                  )}
                  
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? "text-gray-100" : "text-gray-500"
                    }`}
                  >
                    {format(msg.timestamp, "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm">
                Send a message to start the conversation
              </p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 pb-safe">
        {attachment.file && (
          <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center">
            {attachment.type === "image" && attachment.preview && (
              <img
                src={attachment.preview}
                alt="Selected"
                className="h-10 w-10 object-cover rounded mr-2"
              />
            )}
            {attachment.type === "document" && (
              <File className="h-8 w-8 mr-2 text-gray-500" />
            )}
            <span className="flex-1 truncate text-sm">
              {attachment.file.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={cancelAttachment}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Popover
            open={isAttachmentOpen}
            onOpenChange={setIsAttachmentOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="mb-1 p-2 w-auto">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-5 w-5 text-blue-500" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => docInputRef.current?.click()}
                >
                  <File className="h-5 w-5 text-amber-500" />
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageSelect}
          />
          
          <input
            type="file"
            ref={docInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={handleDocumentSelect}
          />
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          {message.trim() === "" && !attachment.file ? (
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isRecording ? "bg-red-500 text-white" : ""
              }`}
              onClick={handleRecordToggle}
            >
              <Mic className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="icon"
              className="rounded-full bg-smartAudit-green"
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="h-16 md:hidden"></div>
      <BottomNav activeTab="chats" />
    </div>
  );
};

export default Chat;
