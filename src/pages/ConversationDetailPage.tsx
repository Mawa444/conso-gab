import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  MoreVertical
} from "lucide-react";
import QuickActions from "@/components/messaging/QuickActions";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

interface Message {
  id: string;
  content: string;
  message_type: string;
  sender_id: string;
  created_at: string;
  attachment_url?: string;
  content_json?: any;
}

interface Conversation {
  id: string;
  title: string;
  origin_type: string;
  origin_id: string;
  participants: Array<{
    user_id: string;
    role: string;
  }>;
}

export const ConversationDetailPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && user) {
      fetchConversation();
      fetchMessages();
    }
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants!inner(user_id, role)
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      setConversation(data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la conversation",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user?.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Update last_activity
      await supabase
        .from('conversations')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', conversationId);

      setNewMessage("");
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageTypeIcon = (type: string) => {
    const icons = {
      action: "🛒",
      location: "📍", 
      qr: "💳",
      system: "ℹ️"
    };
    return icons[type as keyof typeof icons] || null;
  };

  const renderQuickActions = () => (
    <QuickActions 
      conversationId={conversationId!} 
      onActionSent={() => {
        // Refresh messages when an action is sent
        fetchMessages();
      }}
    />
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">Conversation introuvable</h3>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card/80 backdrop-blur-xl noselect">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold truncate noselect">
              {conversation.title || "Conversation"}
            </h1>
            {conversation.origin_type && (
              <Badge variant="secondary" className="noselect">
                {conversation.origin_type}
              </Badge>
            )}
          </div>
        </div>
        
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
                
                 <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                   <div
                     className={`p-3 rounded-lg message-copyable ${
                       isOwn
                         ? 'bg-primary text-primary-foreground'
                         : 'bg-card border'
                     }`}
                     onContextMenu={(e) => {
                       e.preventDefault();
                       if (navigator.clipboard) {
                         navigator.clipboard.writeText(message.content);
                         toast({
                           title: "Message copié",
                           description: "Le message a été copié dans le presse-papiers",
                         });
                       }
                     }}
                     onDoubleClick={() => {
                       if (navigator.clipboard) {
                         navigator.clipboard.writeText(message.content);
                         toast({
                           title: "Message copié",
                           description: "Le message a été copié dans le presse-papiers",
                         });
                       }
                     }}
                   >
                     {getMessageTypeIcon(message.message_type) && (
                       <div className="flex items-center gap-2 mb-2 noselect">
                         <span className="text-sm noselect">{getMessageTypeIcon(message.message_type)}</span>
                         <span className="text-xs font-medium noselect">
                           {message.message_type === 'action' && 'Action'}
                           {message.message_type === 'location' && 'Position'}
                           {message.message_type === 'qr' && 'QR Code'}
                           {message.message_type === 'system' && 'Système'}
                         </span>
                       </div>
                     )}
                     
                     <p className="text-sm copyable">{message.content}</p>
                     
                     {message.attachment_url && (
                       <div className="mt-2 p-2 bg-black/10 rounded border noselect">
                         <p className="text-xs noselect">📎 Pièce jointe</p>
                       </div>
                     )}
                   </div>
                   
                   <span className="text-xs text-muted-foreground noselect">
                     {formatMessageTime(message.created_at)}
                   </span>
                 </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Message Input */}
      <div className="p-4 border-t bg-card/50 noselect">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 copyable"
          />
          
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="messages" onTabChange={(tab) => {
        if (tab === "home") navigate("/");
        else if (tab === "map") navigate("/?tab=map");
        else if (tab === "profile") navigate("/?tab=profile");
      }} />
    </div>
  );
};

export default ConversationDetailPage;