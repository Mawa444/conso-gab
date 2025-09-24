import React, { useState } from "react";
import { useMessagingContext } from "../UniversalMessagingOS";
import { useConversations } from "@/hooks/use-conversations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  MessageCircle, 
  ShoppingBag, 
  Calendar,
  Star,
  Clock,
  ChevronRight,
  AlertCircle,
  FileText,
  Headphones,
  Users,
  Archive
} from "lucide-react";
import { ConversationItem } from "@/types/messaging";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const BusinessInbox: React.FC = () => {
  const { setActiveConversation, activeFilter, setActiveFilter } = useMessagingContext();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { conversations, loading } = useConversations({
    search: searchQuery,
    filter: activeFilter
  });

  const businessFilters = [
    { id: 'all', label: 'Toutes', icon: MessageCircle, count: 15 },
    { id: 'unread', label: 'Non lues', icon: Clock, count: 5 },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag, count: 8 },
    { id: 'quotes', label: 'Devis', icon: FileText, count: 3 },
    { id: 'reservations', label: 'Réservations', icon: Calendar, count: 4 },
    { id: 'support', label: 'Support', icon: Headphones, count: 2 },
    { id: 'archived', label: 'Archivées', icon: Archive, count: 23 }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Important</Badge>;
      default:
        return null;
    }
  };

  const getCustomerTypeIcon = (customerType: string) => {
    switch (customerType) {
      case 'vip': return '👑';
      case 'regular': return '⭐';
      case 'new': return '🆕';
      default: return '👤';
    }
  };

  const getConversationStatusColor = (status: string, type: string) => {
    if (status === 'unread') return 'border-l-primary';
    if (type === 'order') return 'border-l-green-500';
    if (type === 'quote') return 'border-l-yellow-500';
    if (type === 'reservation') return 'border-l-blue-500';
    if (type === 'support') return 'border-l-purple-500';
    return 'border-l-transparent';
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Centre de Conversations Business
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent/10">
              {conversations.length} active{conversations.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              5 en attente
            </Badge>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par client, type ou contenu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>

        {/* Business Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {businessFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <Button
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id as any)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background/50 border-border/50 hover:bg-accent/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                {filter.count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-accent/30">
                    {filter.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Aucune conversation</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery 
                  ? `Aucun résultat pour "${searchQuery}"`
                  : "Vos clients n'ont pas encore commencé de conversation"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {conversations.map((conversation, index) => (
              <div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation as any)}
                className={`p-4 hover:bg-accent/10 cursor-pointer transition-colors group border-l-4 ${
                  getConversationStatusColor(conversation.status, conversation.type)
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.customer_avatar} />
                      <AvatarFallback className="bg-secondary/20 text-secondary-foreground">
                        {conversation.customer_name?.[0] || conversation.business_name?.[0] || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-card flex items-center justify-center text-xs">
                      {getCustomerTypeIcon(conversation.customer_type || 'regular')}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">
                          {conversation.customer_name || conversation.business_name}
                        </h3>
                        {conversation.type === 'order' && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Commande
                          </Badge>
                        )}
                        {conversation.type === 'quote' && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Devis
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(conversation.priority)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.last_message_time), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {conversation.last_message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {conversation.has_unread && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="text-xs font-medium text-primary">
                              {conversation.unread_count} nouveau{conversation.unread_count !== 1 ? 'x' : ''}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {conversation.message_count} message{conversation.message_count !== 1 ? 's' : ''}
                        </span>
                        {conversation.type === 'order' && (
                          <Badge variant="outline" className="text-xs">
                            €{conversation.order_amount || 0}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};