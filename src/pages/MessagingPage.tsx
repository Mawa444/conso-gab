import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, MessageSquare, ShoppingCart, Calendar, Phone, Headphones } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MessagingBottomNav } from "@/components/messaging/MessagingBottomNav";

interface Conversation {
  id: string;
  title: string;
  origin_type: string;
  last_activity: string;
  participants: Array<{
    user_id: string;
    role: string;
    last_read: string;
  }>;
  lastMessage?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count?: number;
}

export const MessagingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch conversations
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Filter conversations based on search and tab
  useEffect(() => {
    let filtered = conversations;
    
    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(conv => {
        switch (activeTab) {
          case "orders": return conv.origin_type === "order";
          case "reservations": return conv.origin_type === "reservation";
          case "appointments": return conv.origin_type === "appointment";
          case "support": return conv.origin_type === "support";
          default: return true;
        }
      });
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredConversations(filtered);
  }, [conversations, searchQuery, activeTab]);

  const fetchConversations = async () => {
    try {
      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .select(`
          conversation_id,
          conversations!inner(
            id,
            title,
            origin_type,
            last_activity,
            participants!inner(user_id, role, last_read)
          )
        `)
        .eq('user_id', user?.id);

      if (participantError) throw participantError;

      // Get last messages for each conversation
      const conversationIds = participantData?.map(p => p.conversation_id) || [];
      
      const { data: messagesData } = await supabase
        .from('messages')
        .select('conversation_id, content, sender_id, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      // Process conversations with last messages
      const processedConversations = participantData?.map(p => {
        const conv = p.conversations;
        const lastMessage = messagesData?.find(m => m.conversation_id === conv.id);
        
        return {
          ...conv,
          lastMessage,
          unread_count: 0 // TODO: Calculate based on last_read
        };
      }) || [];

      setConversations(processedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "orders": return <ShoppingCart className="w-4 h-4" />;
      case "reservations": return <Calendar className="w-4 h-4" />;
      case "appointments": return <Phone className="w-4 h-4" />;
      case "support": return <Headphones className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <MessageSquare className="w-8 h-8 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gaboma-gradient">Messagerie</h1>
          </div>
          
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="gap-2">
              {getTabIcon("all")}
              <span className="hidden sm:inline">Tous</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              {getTabIcon("orders")}
              <span className="hidden sm:inline">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="gap-2">
              {getTabIcon("reservations")}
              <span className="hidden sm:inline">Réservations</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              {getTabIcon("appointments")}
              <span className="hidden sm:inline">RDV</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              {getTabIcon("support")}
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[calc(100vh-270px)]">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">Aucune conversation</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Aucun résultat pour votre recherche" : "Commencez une nouvelle conversation"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                      onClick={() => navigate(`/messaging/conversation/${conversation.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {conversation.title || "Conversation"}
                            </h3>
                            {conversation.origin_type && (
                              <Badge variant="secondary" className="text-xs">
                                {conversation.origin_type}
                              </Badge>
                            )}
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.last_activity)}
                          </span>
                          {conversation.unread_count && conversation.unread_count > 0 && (
                            <Badge className="bg-primary text-primary-foreground min-w-[20px] h-5 text-xs px-1">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <MessagingBottomNav activeTab="messages" />
    </div>
  );
};

export default MessagingPage;