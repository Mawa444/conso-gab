import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, MessageCircle, Star, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { QuickMessageModal } from "./QuickMessageModal";
interface EnhancedBusinessCardProps {
  business: {
    id: string;
    name: string;
    logo_url?: string;
    business_category?: string;
    description?: string;
    distance?: string;
    rating?: number;
    verified?: boolean;
    city?: string;
    whatsapp?: string;
  };
  className?: string;
}
export const EnhancedBusinessCard = ({
  business,
  className
}: EnhancedBusinessCardProps) => {
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const navigate = useNavigate();
  const handleVisit = () => {
    navigate(`/business/${business.id}`);
  };
  const handleWhatsApp = () => {
    if (business.whatsapp) {
      const cleanNumber = business.whatsapp.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };
  return <>
      <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Avatar */}
            <Avatar className="w-16 h-16 flex-shrink-0">
              <AvatarImage src={business.logo_url} alt={business.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {business.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              {/* Header avec nom et badges */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground truncate">
                    {business.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {business.verified && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        Vérifié
                      </Badge>}
                    {business.business_category && <Badge variant="outline" className="text-xs">
                        {business.business_category}
                      </Badge>}
                  </div>
                </div>

                {/* Note */}
                {business.rating && <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{business.rating}</span>
                  </div>}
              </div>

              {/* Distance et localisation */}
              {(business.distance || business.city) && <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {business.distance && `${business.distance}`}
                    {business.distance && business.city && ' • '}
                    {business.city}
                  </span>
                </div>}

              {/* Description */}
              {business.description && <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                  {business.description}
                </p>}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowQuickMessage(true)} className="flex-1 gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span className="hidden sm:inline">Message</span>
                </Button>

                {business.whatsapp && <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                    <Phone className="w-3 h-3" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </Button>}

                <Button size="sm" onClick={handleVisit} className="gap-1 text-white">
                  Visiter
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuickMessageModal open={showQuickMessage} onClose={() => setShowQuickMessage(false)} business={{
      id: business.id,
      name: business.name
    }} />
    </>;
};