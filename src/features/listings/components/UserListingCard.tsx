import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface UserListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    images: string[];
    city: string;
    distance_meters: number;
    category: string;
    description: string;
  };
  onClick?: () => void;
}

export const UserListingCard = ({ listing, onClick }: UserListingCardProps) => {
  const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : null;
  const distanceFormatted = listing.distance_meters < 1000 
    ? `${Math.round(listing.distance_meters)}m` 
    : `${(listing.distance_meters / 1000).toFixed(1)}km`;

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-all w-[160px] flex-shrink-0"
      onClick={onClick}
    >
      <div className="aspect-square relative bg-gray-100">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={listing.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-black/50 text-white border-0">
          {distanceFormatted}
        </Badge>
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
        <p className="text-primary font-bold text-sm">
          {listing.price.toLocaleString()} {listing.currency}
        </p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground truncate">
          <MapPin className="w-3 h-3" />
          {listing.city || 'Proche'}
        </div>
      </CardContent>
    </Card>
  );
};
