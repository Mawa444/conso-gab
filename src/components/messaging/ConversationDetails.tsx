import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Phone,
  Video,
  User,
  Star,
  MapPin,
  ShoppingCart,
  Calendar,
  CreditCard,
  Package,
  FileText,
  QrCode,
  Truck,
  Check,
  X,
  Image as ImageIcon,
  Play,
  Download
} from "lucide-react";
import { QuickActions } from "./QuickActions";
import { useMessaging } from "@/hooks/use-messaging";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Message, Conversation } from "@/types/messaging-advanced";


interface ConversationDetailsProps {
  conversationId: string;
  onRefetch?: () => void;
}

const getActionIcon = (type: string) => {
  switch (type) {
    case "order_created":
      return <ShoppingCart className="w-4 h-4" />;
    case "payment_validated":
      return <CreditCard className="w-4 h-4" />;
    case "stock_updated":
      return <Package className="w-4 h-4" />;
    case "reservation_cancelled":
      return <X className="w-4 h-4" />;
    case "appointment_confirmed":
      return <Check className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getActionColor = (type: string) => {
  switch (type) {
    case "order_created":
      return "bg-blue-50 border-blue-200 text-blue-800";
    case "payment_validated":
      return "bg-green-50 border-green-200 text-green-800";
    case "stock_updated":
      return "bg-orange-50 border-orange-200 text-orange-800";
    case "reservation_cancelled":
      return "bg-red-50 border-red-200 text-red-800";
    case "appointment_confirmed":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
};

export const ConversationDetails = ({ conversationId, onRefetch }: ConversationDetailsProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { conversation, messages, loading, sendMessage, markAsRead } = useMessaging(conversationId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId) {
      markAsRead();
    }
  }, [conversationId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage({
      content: newMessage,
      message_type: "text"
    });
    
    setNewMessage("");
    onRefetch?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="font-medium">Conversation non trouvée</p>
          <p className="text-sm text-muted-foreground">
            Cette conversation n'existe pas ou a été supprimée
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.business_profile?.logo_url} alt={conversation.business_profile?.business_name} />
              <AvatarFallback>
                {conversation.business_profile?.business_name?.split(" ").map(n => n[0]).slice(0, 2).join("") || 'B'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="font-semibold">{conversation.business_profile?.business_name || 'Entreprise'}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {conversation.conversation_type}
                </Badge>
                <span>•</span>
                <span>Conversation active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {conversation.business_profile?.phone && (
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Business Info Banner */}
        <Card className="mt-3 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-3 h-3" />
                  <span className="font-medium">Client</span>
                </div>
                {conversation.business_profile?.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {conversation.business_profile.phone}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  Profil
                </Button>
                <Button variant="ghost" size="sm">
                  Catalogue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const showDate = index === 0 || 
              format(new Date(messages[index - 1].created_at), 'yyyy-MM-dd') !== 
              format(new Date(message.created_at), 'yyyy-MM-dd');

            return (
              <div key={message.id}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex items-center gap-4 my-6">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground bg-background px-2">
                      {format(new Date(message.created_at), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                )}

                {/* Message */}
                <div className={cn(
                  "flex gap-3",
                  message.is_own_message && "flex-row-reverse"
                )}>
                  {!message.is_own_message && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.sender_avatar} alt={message.sender_name} />
                      <AvatarFallback className="text-xs">
                        {message.sender_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn(
                    "max-w-[70%] space-y-1",
                    message.is_own_message && "items-end"
                  )}>
                    {/* System Message */}
                    {message.message_type === "system" && (
                      <div className={cn(
                        "p-3 rounded-lg border-2 border-dashed",
                        "bg-gray-50 border-gray-200 text-gray-800"
                      )}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            {message.content}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Regular Message */}
                    {message.message_type !== "system" && (
                      <div className={cn(
                        "p-3 rounded-lg",
                        message.is_own_message 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {/* Document Message */}
                        {message.message_type === "document" && message.attachment_url && (
                          <div className="mb-2">
                            <img
                              src={message.attachment_url}
                              alt="Image partagée"
                              className="max-w-full h-auto rounded"
                            />
                          </div>
                        )}

                        {/* Audio Message */}
                        {message.message_type === "audio" && message.attachment_url && (
                          <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="sm" className="p-1">
                              <Play className="w-4 h-4" />
                            </Button>
                            <div className="flex-1 h-2 bg-background/20 rounded-full">
                              <div className="h-full w-1/3 bg-background/60 rounded-full" />
                            </div>
                            <span className="text-xs">0:45</span>
                          </div>
                        )}

                        {/* Video Message */}
                        {message.message_type === "video" && message.attachment_url && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-background/10 rounded">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm flex-1">Document.pdf</span>
                            <Button variant="ghost" size="sm" className="p-1">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {/* Order/Quote Message */}
                        {(message.message_type === "order" || message.message_type === "quote") && (
                          <div className="flex items-center gap-2 mb-2">
                            <QrCode className="w-4 h-4" />
                            <span className="text-sm">Code QR de validation</span>
                          </div>
                        )}

                        {/* Text Content */}
                        {message.content && (
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message metadata */}
                    <div className={cn(
                      "flex items-center gap-2 text-xs text-muted-foreground",
                      message.is_own_message && "justify-end"
                    )}>
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </span>
                      {message.is_own_message && (
                        <div className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <Check className="w-3 h-3 -ml-1 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions Panel */}
      <Sheet open={showQuickActions} onOpenChange={setShowQuickActions}>
        <SheetContent side="bottom" className="h-[50vh]">
          <QuickActions
            conversationId={conversationId}
            conversation={conversation as any}
            onAction={(action) => {
              console.log("Quick action:", action);
              setShowQuickActions(false);
              onRefetch?.();
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Message Input */}
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <Input
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <SheetTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setShowQuickActions(true)}>
              <Package className="w-4 h-4" />
            </Button>
          </SheetTrigger>

          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};