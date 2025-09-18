import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingCart, 
  Calendar, 
  CreditCard, 
  Clock, 
  Package, 
  MessageCircle,
  Star,
  Archive,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { ConversationFilter } from "@/pages/MessagingPage";

export interface ConversationItem {
  id: string;
  business_name: string;
  business_logo?: string;
  customer_name?: string;
  customer_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  conversation_type: "direct" | "order" | "reservation" | "payment" | "appointment" | "catalog" | "support";
  status: "active" | "pending" | "completed" | "cancelled" | "archived";
  catalog_product?: {
    name: string;
    image?: string;
    price?: number;
  };
  badges: Array<{
    type: "order" | "reservation" | "payment" | "appointment" | "stock" | "unread" | "urgent";
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }>;
}

interface ConversationsListProps {
  conversations: ConversationItem[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  activeFilter: ConversationFilter;
}

const getConversationIcon = (type: ConversationItem["conversation_type"]) => {
  switch (type) {
    case "order":
      return <ShoppingCart className="w-3 h-3" />;
    case "reservation":
      return <Calendar className="w-3 h-3" />;
    case "payment":
      return <CreditCard className="w-3 h-3" />;
    case "appointment":
      return <Clock className="w-3 h-3" />;
    case "catalog":
      return <Package className="w-3 h-3" />;
    case "support":
      return <AlertCircle className="w-3 h-3" />;
    default:
      return <MessageCircle className="w-3 h-3" />;
  }
};

const getBadgeVariant = (type: ConversationItem["badges"][0]["type"]) => {
  switch (type) {
    case "urgent":
    case "payment":
      return "destructive";
    case "order":
    case "appointment":
      return "default";
    case "stock":
      return "secondary";
    default:
      return "outline";
  }
};

export const ConversationsList = ({
  conversations,
  loading,
  selectedId,
  onSelect,
  searchQuery,
  activeFilter
}: ConversationsListProps) => {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Aucune conversation</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? "Aucun résultat pour votre recherche" 
                : "Vos conversations apparaîtront ici"
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50",
              selectedId === conversation.id && "bg-accent border border-primary/20"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar with type indicator */}
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={conversation.business_logo || conversation.customer_avatar} 
                    alt={conversation.business_name || conversation.customer_name}
                  />
                  <AvatarFallback className="text-xs">
                    {(conversation.business_name || conversation.customer_name || "?")
                      .split(" ")
                      .map(n => n[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                
                {/* Type indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background border border-border rounded-full flex items-center justify-center">
                  {getConversationIcon(conversation.conversation_type)}
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                {/* Name and time */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">
                    {conversation.business_name || conversation.customer_name}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conversation.last_message_time), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                </div>

                {/* Product preview if catalog conversation */}
                {conversation.catalog_product && (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                    {conversation.catalog_product.image && (
                      <div className="w-6 h-6 rounded bg-background border overflow-hidden">
                        <img 
                          src={conversation.catalog_product.image} 
                          alt={conversation.catalog_product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span className="font-medium truncate">
                      {conversation.catalog_product.name}
                    </span>
                    {conversation.catalog_product.price && (
                      <span className="text-primary font-medium ml-auto">
                        {conversation.catalog_product.price.toLocaleString()} FCFA
                      </span>
                    )}
                  </div>
                )}

                {/* Last message */}
                <p className={cn(
                  "text-sm text-muted-foreground truncate",
                  conversation.unread_count > 0 && "font-medium text-foreground"
                )}>
                  {conversation.last_message}
                </p>

                {/* Badges */}
                <div className="flex items-center gap-1 flex-wrap">
                  {conversation.badges.map((badge, index) => (
                    <Badge
                      key={index}
                      variant={getBadgeVariant(badge.type)}
                      className="text-xs px-2 py-0 h-5"
                    >
                      {badge.label}
                    </Badge>
                  ))}
                  
                  {conversation.unread_count > 0 && (
                    <Badge variant="default" className="text-xs px-2 py-0 h-5 bg-primary">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};