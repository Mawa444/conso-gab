import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, MessageSquare, ShoppingCart, Calendar, Phone, Headphones, ArrowLeft, CheckCheck, Check, Clock, User, Users, Mic, Image, FileText, MapPin, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useConversations } from "@/hooks/use-conversations";
import { NewConversationModal } from "@/components/messaging/NewConversationModal";
import { GabonLoading } from "@/components/ui/gabon-loading";
import { MessageHomePage } from "@/components/messaging/MessageHomePage";
import { ConversationSkeleton, MessageHomePageSkeleton } from "@/components/messaging/ConversationSkeleton";

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
  const navigate = useNavigate();
  const { section } = useParams(); // conversations, orders, reservations, etc.
  const location = useLocation();
  const { conversations, loading } = useConversations();
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showNewConversation, setShowNewConversation] = useState(false);

  // Déterminer la vue actuelle
  const isHomePage = !section || section === 'home';
  const isConversationsPage = section === 'conversations';

  // Filter conversations based on search and tab (only for conversations section)
  useEffect(() => {
    if (!isConversationsPage) return;
    
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
  }, [conversations, searchQuery, activeTab, isConversationsPage]);

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

  const getConversationAvatar = (conversation: any) => {
    if (conversation.conversation_type === 'private' && conversation.members?.length > 0) {
      const otherMember = conversation.members.find((m: any) => m.user_id !== user?.id);
      return otherMember?.user_profile?.profile_picture_url;
    }
    return null;
  };

  const getConversationName = (conversation: any) => {
    if (conversation.title && conversation.title !== 'Conversation privée') {
      return conversation.title;
    }
    
    if (conversation.conversation_type === 'private' && conversation.members?.length > 0) {
      const otherMember = conversation.members.find((m: any) => m.user_id !== user?.id);
      return otherMember?.user_profile?.pseudo || 'Utilisateur';
    }
    
    return conversation.title || "Conversation";
  };

  const getConversationInitials = (conversation: any) => {
    const name = getConversationName(conversation);
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'image': return <Image className="w-3 h-3" />;
      case 'audio': return <Mic className="w-3 h-3" />;
      case 'document': return <FileText className="w-3 h-3" />;
      case 'location': return <MapPin className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: string, isOwnMessage: boolean) => {
    if (!isOwnMessage) return null;
    
    switch (status) {
      case 'sending': return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent': return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-primary" />;
      default: return null;
    }
  };

  const groupConversationsByDate = (conversations: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    conversations.forEach(conv => {
      const date = new Date(conv.last_activity);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      let groupKey = '';
      if (diffDays === 0) {
        groupKey = "Aujourd'hui";
      } else if (diffDays === 1) {
        groupKey = 'Hier';
      } else if (diffDays < 7) {
        groupKey = 'Cette semaine';
      } else if (diffDays < 30) {
        groupKey = 'Ce mois-ci';
      } else {
        groupKey = 'Plus ancien';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conv);
    });
    
    return groups;
  };

  // Afficher la page d'accueil si on n'est pas dans une section spécifique
  if (isHomePage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gaboma-gradient">Messagerie</h1>
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <MessageHomePageSkeleton />
          ) : (
            <MessageHomePage />
          )}
        </div>

        <BottomNavigation activeTab="messages" onScannerClick={() => {}} />
      </div>
    );
  }

  if (loading && isConversationsPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 pb-20">
        {/* Header skeleton */}
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/messaging")}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gaboma-gradient">Conversations</h1>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau
            </Button>
          </div>
          
          {/* Search Bar skeleton */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les conversations..."
                className="pl-10"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <ConversationSkeleton />
        </div>

        <BottomNavigation activeTab="messages" onScannerClick={() => {}} />
      </div>
    );
  }

  // Retour à la page précédente si pas de conversations dans cette section
  if (isConversationsPage && !loading && filteredConversations.length === 0 && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/messaging")}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gaboma-gradient">Conversations</h1>
            </div>
          </div>
        </div>

        <div className="p-4 text-center space-y-4 mt-20">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Aucune conversation</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Commencez une nouvelle conversation pour démarrer
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowNewConversation(true)}
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>

        <BottomNavigation activeTab="messages" onScannerClick={() => {}} />

        <NewConversationModal 
          open={showNewConversation}
          onOpenChange={setShowNewConversation}
        />
      </div>
    );
  }

  // Page des conversations
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/messaging")}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gaboma-gradient">
              {section === 'conversations' ? 'Conversations' : 
               section === 'orders' ? 'Commandes' :
               section === 'reservations' ? 'Réservations' :
               section === 'appointments' ? 'Rendez-vous' :
               section === 'support' ? 'Support' : 'Messagerie'}
            </h1>
          </div>
          
          <Button size="sm" className="gap-2" onClick={() => setShowNewConversation(true)}>
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
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-muted to-accent/20 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Aucune conversation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? "Aucun résultat pour votre recherche" : "Commencez une nouvelle conversation"}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewConversation(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle conversation
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {Object.entries(groupConversationsByDate(filteredConversations)).map(([dateGroup, groupConversations]) => (
                    <div key={dateGroup} className="space-y-1">
                      {activeTab === "all" && (
                        <>
                          <div className="px-4 py-2">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {dateGroup}
                            </h4>
                          </div>
                          <Separator className="mx-4" />
                        </>
                      )}
                      
                      {groupConversations.map((conversation: any) => (
                        <div
                          key={conversation.id}
                          className="group relative mx-2 rounded-lg hover:bg-accent/5 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                          onClick={() => navigate(`/messaging/conversation/${conversation.id}`)}
                        >
                          <div className="flex items-center gap-3 p-3">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-accent/20 transition-all">
                                <AvatarImage 
                                  src={getConversationAvatar(conversation)} 
                                  alt={getConversationName(conversation)}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-medium">
                                  {conversation.conversation_type === 'group' ? (
                                    <Users className="w-5 h-5" />
                                  ) : (
                                    getConversationInitials(conversation)
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              
                              {/* Online indicator (placeholder) */}
                              {conversation.conversation_type === 'private' && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm truncate pr-2">
                                  {getConversationName(conversation)}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                  {conversation.lastMessage && getStatusIcon(
                                    conversation.lastMessage.status, 
                                    conversation.lastMessage.sender_id === user?.id
                                  )}
                                  <span>{formatTime(conversation.last_activity)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                  {conversation.lastMessage && (
                                    <>
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        {getMessageTypeIcon(conversation.lastMessage.message_type)}
                                      </div>
                                      <p className="text-sm text-muted-foreground truncate">
                                        {conversation.lastMessage.message_type === 'text' 
                                          ? conversation.lastMessage.content 
                                          : conversation.lastMessage.message_type === 'image' 
                                            ? '📷 Image'
                                            : conversation.lastMessage.message_type === 'audio'
                                              ? '🎵 Audio'
                                              : conversation.lastMessage.message_type === 'document'
                                                ? '📄 Document'
                                                : conversation.lastMessage.message_type === 'location'
                                                  ? '📍 Position'
                                                  : 'Message'
                                        }
                                      </p>
                                    </>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  {/* Origin type badge */}
                                  {conversation.origin_type && (
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                                      {conversation.origin_type === 'order' && '🛒'}
                                      {conversation.origin_type === 'reservation' && '📅'}
                                      {conversation.origin_type === 'appointment' && '📞'}
                                      {conversation.origin_type === 'support' && '🎧'}
                                    </Badge>
                                  )}
                                  
                                  {/* Unread count */}
                                  {conversation.unread_count && conversation.unread_count > 0 && (
                                    <Badge className="bg-primary text-primary-foreground min-w-[20px] h-5 text-xs px-1.5 rounded-full">
                                      {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Subtle separator */}
                          <div className="absolute bottom-0 left-16 right-4 h-px bg-border/30"></div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="messages" onScannerClick={() => {}} />

      {/* New Conversation Modal */}
      <NewConversationModal 
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
      />
    </div>
  );
};

export default MessagingPage;