import React, { useState } from "react";
import { useMessagingContext } from "../UniversalMessagingOS";
import { useConversations } from "@/hooks/use-conversations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  MessageCircle, 
  ShoppingBag, 
  Calendar,
  Star,
  Clock,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const ConsumerInbox: React.FC = () => {
  const { setActiveConversation, activeFilter, setActiveFilter } = useMessagingContext();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { conversations, loading } = useConversations({
    search: searchQuery,
    filter: activeFilter
  });

  const filters = [
    { id: 'all', label: 'Toutes', icon: MessageCircle },
    { id: 'unread', label: 'Non lues', icon: Clock },
    { id: 'businesses', label: 'Entreprises', icon: Star },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'reservations', label: 'Réservations', icon: Calendar }
  ];

  const getConversationIcon = (type?: string) => {
    switch (type) {
      case 'order': return '🛍️';
      case 'reservation': return '📅';
      case 'quote': return '💰';
      case 'support': return '🎧';
      default: return '💬';
    }
  };

  const getStatusBadge = (status: string, type?: string) => {
    if (status === 'unread') {
      return <Badge variant="default" className="bg-primary text-primary-foreground">Nouveau</Badge>;
    }
    if (type === 'order') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Commande</Badge>;
    }
    if (type === 'reservation') {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">RDV</Badge>;
    }
    return null;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Mes Conversations
          </CardTitle>
          <Badge variant="outline" className="bg-accent/10">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans vos conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => {
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
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de vos conversations...</p>
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
                  : "Commencez par contacter une entreprise"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {conversations.map((conversation, index) => (
              <div
                key={conversation.id}
                onClick={() => setActiveConversation(conversation as any)}
                className="p-4 hover:bg-accent/10 cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.business_logo} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conversation.business_name?.[0] || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-card flex items-center justify-center text-xs">
                      {getConversationIcon((conversation as any).type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">
                        {conversation.business_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(conversation.status, (conversation as any).type)}
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
                      <div className="flex items-center gap-2">
                      {(conversation as any).has_unread && (
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {(conversation as any).message_count || 1} message{(conversation as any).message_count !== 1 ? 's' : ''}
                      </span>
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