import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  Smile, 
  Paperclip, 
  Star,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  FileText,
  Image as ImageIcon,
  File,
  QrCode,
  Settings
} from "lucide-react";
import { useMessaging } from "@/hooks/use-messaging";
import { QuickActionsNew } from "./QuickActionsNew";
import { RealTimeIndicators } from "./RealTimeIndicators";
import { Message, Conversation } from "@/types/messaging-advanced";

interface ConversationDetailsNewProps {
  conversationId: string;
  onBack: () => void;
}

export const ConversationDetailsNew: React.FC<ConversationDetailsNewProps> = ({
  conversationId,
  onBack
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    conversation, 
    messages, 
    loading, 
    error, 
    sendMessage, 
    markAsRead, 
    addReaction 
  } = useMessaging(conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversation && messages.length > 0) {
      markAsRead();
    }
  }, [conversation, messages, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        content: newMessage,
        message_type: 'text'
      });
      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationTypeIcon = () => {
    switch (conversation?.conversation_type) {
      case 'order': return <Package className="h-4 w-4" />;
      case 'reservation': return <Calendar className="h-4 w-4" />;
      case 'support': return <Settings className="h-4 w-4" />;
      case 'quote': return <FileText className="h-4 w-4" />;
      default: return null;
    }
  };

  const getConversationTypeLabel = () => {
    switch (conversation?.conversation_type) {
      case 'order': return 'Commande';
      case 'reservation': return 'Réservation';
      case 'support': return 'Support';
      case 'quote': return 'Devis';
      case 'group': return 'Groupe';
      default: return 'Conversation';
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMessageTypeIcon = (type: Message['message_type']) => {
    switch (type) {
      case 'audio': return <div className="text-primary">🎵</div>;
      case 'video': return <div className="text-primary">🎥</div>;
      case 'document': return <File className="h-4 w-4 text-primary" />;
      case 'quote': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'order': return <Package className="h-4 w-4 text-green-600" />;
      case 'reservation': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'system': return <Settings className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.is_own_message;
    const showDate = index === 0 || 
      new Date(message.created_at).toDateString() !== 
      new Date(messages[index - 1].created_at).toDateString();

    return (
      <div key={message.id} className="space-y-2">
        {showDate && (
          <div className="flex justify-center my-4">
            <Badge variant="outline" className="text-xs">
              {formatMessageDate(message.created_at)}
            </Badge>
          </div>
        )}
        
        <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          {!isOwnMessage && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage src={message.sender_avatar} />
              <AvatarFallback>
                {conversation?.business_profile?.business_name?.[0] || 'B'}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`max-w-[70%] ${isOwnMessage ? 'order-first' : ''}`}>
            <div className={`p-3 rounded-2xl ${
              isOwnMessage 
                ? 'bg-primary text-primary-foreground ml-auto' 
                : 'bg-secondary'
            }`}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  
                  {message.attachment_url && (
                    <div className="mt-2 p-2 rounded-lg bg-background/10">
                      <div className="flex items-center gap-2 text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span>Pièce jointe</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-xs text-muted-foreground">
                {formatMessageTime(message.created_at)}
              </span>
              
              {message.is_edited && (
                <Badge variant="outline" className="text-xs">
                  Modifié
                </Badge>
              )}
              
              {Object.keys(message.reactions || {}).length > 0 && (
                <div className="flex gap-1">
                  {Object.entries(message.reactions || {}).map(([userId, emoji]) => (
                    <span key={userId} className="text-xs bg-background rounded px-1">
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {isOwnMessage && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback>Vous</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Conversation introuvable</h3>
          <p className="text-muted-foreground">
            {error || "Cette conversation n'existe pas ou vous n'avez pas accès."}
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.business_profile?.logo_url} />
                <AvatarFallback>
                  {conversation.business_profile?.business_name?.[0] || 'B'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">
                    {conversation.business_profile?.business_name || 'Entreprise'}
                  </h3>
                  {getConversationTypeIcon()}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getConversationTypeLabel()}
                  </Badge>
                  
                  {conversation.priority !== 'medium' && (
                    <Badge 
                      variant={conversation.priority === 'urgent' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {conversation.priority}
                    </Badge>
                  )}
                  
                  {conversation.is_starred && (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <RealTimeIndicators />
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="min-h-[40px] resize-none"
              />
            </div>
            
            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Sheet open={showQuickActions} onOpenChange={setShowQuickActions}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[400px]">
                  <QuickActionsNew
                    conversationId={conversationId}
                    conversation={conversation}
                    onAction={(action) => {
                      console.log('Quick action:', action);
                      setShowQuickActions(false);
                    }}
                  />
                </SheetContent>
              </Sheet>
              
              <Button 
                size="sm" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};