/**
 * Carte d'une story business avec badge et countdown
 */

import { useState } from "react";
import { BusinessStory, STORY_TYPE_CONFIG } from "../types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MapPin, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  story: BusinessStory;
  onClick?: () => void;
  compact?: boolean;
}

export const StoryCard = ({ story, onClick, compact = false }: StoryCardProps) => {
  const typeConfig = STORY_TYPE_CONFIG[story.story_type];
  const business = story.business_profiles;
  
  const timeLeft = formatDistanceToNow(new Date(story.expires_at), { 
    addSuffix: false, 
    locale: fr 
  });

  const hasDiscount = story.discount_percentage && story.discount_percentage > 0;
  const hasPromo = story.original_price && story.promo_price;
  
  const coverImage = story.cover_url || (story.images && story.images[0]) || null;

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className="flex items-center gap-3 p-3 rounded-xl bg-card border hover:bg-accent/50 cursor-pointer transition-all"
      >
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {coverImage ? (
            <img src={coverImage} alt={story.title || ''} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {typeConfig.icon}
            </div>
          )}
          <Badge 
            className={cn(
              "absolute top-1 left-1 text-[10px] px-1.5 py-0",
              typeConfig.bgColor, typeConfig.color
            )}
          >
            {typeConfig.icon}
          </Badge>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{story.title || 'Nouvelle annonce'}</p>
          <p className="text-xs text-muted-foreground truncate">{business?.business_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeLeft}
            </span>
            {hasDiscount && (
              <Badge variant="destructive" className="text-[10px]">
                -{story.discount_percentage}%
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      onClick={onClick}
      className="relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
    >
      {/* Image de couverture */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={story.title || ''} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-6xl">{typeConfig.icon}</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Badge type en haut */}
        <Badge 
          className={cn(
            "absolute top-3 left-3 font-semibold",
            typeConfig.bgColor, typeConfig.color
          )}
        >
          {typeConfig.icon} {typeConfig.label}
        </Badge>
        
        {/* Countdown en haut à droite */}
        <Badge 
          variant="secondary"
          className="absolute top-3 right-3 bg-black/60 text-white border-0"
        >
          <Clock className="w-3 h-3 mr-1" />
          {timeLeft}
        </Badge>
        
        {/* Badge réduction */}
        {hasDiscount && (
          <Badge 
            variant="destructive"
            className="absolute top-12 right-3 text-lg font-bold animate-pulse"
          >
            -{story.discount_percentage}%
          </Badge>
        )}
        
        {/* Contenu en bas */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {/* Prix promo */}
          {hasPromo && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-bold">{story.promo_price?.toLocaleString()} FCFA</span>
              <span className="text-sm line-through opacity-70">
                {story.original_price?.toLocaleString()} FCFA
              </span>
            </div>
          )}
          
          {/* Titre */}
          <h3 className="font-bold text-lg leading-tight line-clamp-2">
            {story.title || 'Nouvelle annonce'}
          </h3>
          
          {/* Description */}
          {story.description && (
            <p className="text-sm text-white/80 line-clamp-2 mt-1">
              {story.description}
            </p>
          )}
          
          {/* Business info */}
          <div className="flex items-center gap-2 mt-3">
            <Avatar className="w-6 h-6 border-2 border-white">
              <AvatarImage src={business?.logo_url || undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {business?.business_name?.charAt(0) || 'B'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{business?.business_name}</span>
          </div>
          
          {/* Location */}
          {(story.geo_city || story.geo_district) && (
            <div className="flex items-center gap-1 mt-2 text-xs text-white/70">
              <MapPin className="w-3 h-3" />
              {story.geo_district && <span>{story.geo_district},</span>}
              {story.geo_city && <span>{story.geo_city}</span>}
            </div>
          )}
        </div>
      </div>
      
      {/* Vues */}
      {story.view_count > 0 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-white/80 bg-black/40 px-2 py-1 rounded-full">
          <Eye className="w-3 h-3" />
          {story.view_count}
        </div>
      )}
    </Card>
  );
};
