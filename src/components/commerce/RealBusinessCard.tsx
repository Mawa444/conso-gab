import { MapPin, MessageCircle, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { RealBusiness } from "@/hooks/use-real-businesses";
import { MessageSheet } from "./MessageSheet";

interface RealBusinessCardProps {
  business: RealBusiness;
  onSelect?: (business: RealBusiness) => void;
  onMessage?: (business: RealBusiness) => void;
  variant?: "default" | "compact" | "featured";
}

export const RealBusinessCard = ({ 
  business, 
  onSelect, 
  onMessage,
  variant = "default"
}: RealBusinessCardProps) => {
  const [showMessageSheet, setShowMessageSheet] = useState(false);

  const handleCardClick = () => {
    onSelect?.(business);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMessageSheet(true);
  };

  return (
    <>
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md border border-border/50",
          "hover:border-primary/20 hover:bg-card/80",
          variant === "compact" && "p-2",
          variant === "featured" && "border-primary/30 bg-primary/5"
        )}
        onClick={handleCardClick}
      >
        <CardContent className={cn("p-4", variant === "compact" && "p-3")}>
          <div className="flex gap-4">
            {/* Avatar ou Image */}
            <div className="flex-shrink-0">
              <div className={cn(
                "rounded-lg bg-primary/10 flex items-center justify-center",
                variant === "compact" ? "w-12 h-12" : "w-16 h-16"
              )}>
                <Building className={cn(
                  "text-primary",
                  variant === "compact" ? "w-6 h-6" : "w-8 h-8"
                )} />
              </div>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-semibold text-foreground truncate",
                    variant === "compact" ? "text-sm" : "text-lg"
                  )}>
                    {business.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {business.category}
                    </Badge>
                    {business.is_active && (
                      <Badge variant="default" className="text-xs bg-green-500/10 text-green-700">
                        Actif
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {business.description && variant !== "compact" && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {business.description}
                </p>
              )}

              {/* Informations supplémentaires */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {business.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-32">{business.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Propriétaire</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={handleMessageClick}
                    className="h-8 px-2"
                  >
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Sheet */}
      <MessageSheet
        open={showMessageSheet}
        onClose={() => setShowMessageSheet(false)}
        commerce={{
          id: business.id,
          name: business.name,
          type: business.category,
          owner: "Propriétaire",
          category: business.category
        }}
      />
    </>
  );
};