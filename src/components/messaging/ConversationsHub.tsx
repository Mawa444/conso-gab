import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  Users, 
  Pin,
  Archive,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Mic,
  Phone,
  Video,
  UserPlus,
  Star,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Mock data
interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  isPinned: boolean;
  type: "direct" | "group" | "channel";
  participants?: number;
  isTyping?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file" | "audio";
  isOwn: boolean;
  status: "sent" | "delivered" | "read";
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Restaurant Le Palmier",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Votre commande est prête à être récupérée",
    timestamp: "2024-01-20T10:30:00Z",
    unread: 2,
    isOnline: true,
    isPinned: true,
    type: "direct",
    isTyping: false
  },
  {
    id: "2", 
    name: "Équipe Marketing",
    lastMessage: "Alice: Le nouveau catalogue est maintenant disponible",
    timestamp: "2024-01-20T09:15:00Z",
    unread: 0,
    isOnline: false,
    isPinned: false,
    type: "group",
    participants: 8,
    isTyping: true
  },
  {
    id: "3",
    name: "Boutique Mode & Style",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Merci pour votre achat! Code promo: FIDELITE20",
    timestamp: "2024-01-19T16:45:00Z",
    unread: 1,
    isOnline: true,
    isPinned: false,
    type: "direct"
  },
  {
    id: "4",
    name: "Support ConsoGab",
    lastMessage: "Votre demande a été traitée avec succès",
    timestamp: "2024-01-19T14:20:00Z",
    unread: 0,
    isOnline: true,
    isPinned: false,
    type: "channel"
  }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      senderId: "restaurant",
      senderName: "Restaurant Le Palmier",
      content: "Bonjour! Votre table pour 4 personnes est confirmée pour ce soir à 19h30.",
      timestamp: "2024-01-20T09:00:00Z",
      type: "text",
      isOwn: false,
      status: "read"
    },
    {
      id: "2",
      senderId: "me",
      senderName: "Moi",
      content: "Parfait, merci! Est-ce que vous avez des plats végétariens?",
      timestamp: "2024-01-20T09:05:00Z",
      type: "text",
      isOwn: true,
      status: "read"
    },
    {
      id: "3",
      senderId: "restaurant",
      senderName: "Restaurant Le Palmier",
      content: "Oui bien sûr! Nous avons un menu végétarien complet. Je vous envoie la carte.",
      timestamp: "2024-01-20T09:07:00Z",
      type: "text",
      isOwn: false,
      status: "read"
    },
    {
      id: "4",
      senderId: "restaurant",
      senderName: "Restaurant Le Palmier",
      content: "Votre commande est prête à être récupérée",
      timestamp: "2024-01-20T10:30:00Z",
      type: "text",
      isOwn: false,
      status: "delivered"
    }
  ]
};

interface ConversationsHubProps {
  searchQuery: string;
}

export const ConversationsHub = ({ searchQuery }: ConversationsHubProps) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = MOCK_CONVERSATIONS.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = MOCK_CONVERSATIONS.find(c => c.id === selectedConversation);
  const messages = selectedConversation ? MOCK_MESSAGES[selectedConversation] || [] : [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator
  const handleTyping = (text: string) => {
    setNewMessage(text);
    if (!isTyping) {
      setIsTyping(true);
    }
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Here would be the actual send logic
    console.log("Sending message:", newMessage);
    setNewMessage("");
    setIsTyping(false);
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
      <Avatar className="w-6 h-6">
        <AvatarImage src={selectedConv?.avatar} />
        <AvatarFallback className="text-xs">{selectedConv?.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1">
        <span>en train d'écrire</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-border/50 flex flex-col bg-background/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Conversations</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => (
              <Card
                key={conv.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-0",
                  selectedConversation === conv.id 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 shadow-md" 
                    : "hover:bg-accent/5"
                )}
                onClick={() => setSelectedConversation(conv.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback className="text-sm">
                          {conv.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Online indicator */}
                      {conv.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                      
                      {/* Type indicator */}
                      <div className="absolute -top-1 -right-1">
                        {conv.type === "group" && (
                          <Badge className="w-4 h-4 p-0 text-xs bg-blue-500">
                            <Users className="w-2 h-2" />
                          </Badge>
                        )}
                        {conv.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{conv.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.timestamp), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          "text-xs truncate flex-1",
                          conv.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                        )}>
                          {conv.isTyping ? (
                            <span className="text-primary italic">en train d'écrire...</span>
                          ) : (
                            conv.lastMessage
                          )}
                        </p>
                        
                        {conv.unread > 0 && (
                          <Badge className="ml-2 bg-primary text-white text-xs px-2 py-0 h-5">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                      
                      {conv.participants && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {conv.participants} participants
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConv.avatar} />
                      <AvatarFallback>
                        {selectedConv.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConv.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{selectedConv.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {selectedConv.isTyping ? (
                        <span className="text-primary italic">en train d'écrire...</span>
                      ) : selectedConv.isOnline ? (
                        <span className="text-green-600">En ligne</span>
                      ) : (
                        <span>Dernière activité il y a 2h</span>
                      )}
                      {selectedConv.participants && (
                        <>
                          <span>•</span>
                          <span>{selectedConv.participants} participants</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 group",
                        message.isOwn && "flex-row-reverse"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        {showAvatar && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.isOwn ? "/api/placeholder/32/32" : selectedConv.avatar} />
                            <AvatarFallback className="text-xs">
                              {message.senderName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      <div className={cn(
                        "flex flex-col max-w-[70%] space-y-1",
                        message.isOwn && "items-end"
                      )}>
                        {showAvatar && (
                          <div className={cn(
                            "flex items-center gap-2 text-xs text-muted-foreground",
                            message.isOwn && "flex-row-reverse"
                          )}>
                            <span className="font-medium">{message.senderName}</span>
                            <span>
                              {formatDistanceToNow(new Date(message.timestamp), { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </span>
                          </div>
                        )}

                        <div className={cn(
                          "p-3 rounded-lg transition-all duration-200 group-hover:shadow-sm",
                          message.isOwn 
                            ? "bg-gradient-to-r from-primary to-accent text-white" 
                            : "bg-muted"
                        )}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>

                        {message.isOwn && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="flex">
                              <div className={cn(
                                "w-3 h-3 rounded-full transition-colors",
                                message.status === "sent" && "border border-muted-foreground",
                                message.status === "delivered" && "bg-muted-foreground",
                                message.status === "read" && "bg-primary"
                              )} />
                              {message.status === "read" && (
                                <div className="w-3 h-3 rounded-full bg-primary -ml-1" />
                              )}
                            </div>
                            <span className="capitalize">{message.status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {selectedConv.isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Button variant="ghost" size="sm" className="p-1">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    
                    <Button variant="ghost" size="sm" className="p-1">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {isTyping && (
                    <div className="text-xs text-muted-foreground mt-1 px-3">
                      En train d'écrire...
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Sélectionnez une conversation</h3>
                <p className="text-muted-foreground">
                  Choisissez une conversation pour commencer à échanger
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};