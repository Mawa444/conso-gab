import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin, Store } from "lucide-react";

interface PublicCatalogCardProps {
  catalog: any; // Using any to handle the joined data structure easily
  onSelect?: () => void;
}

export const PublicCatalogCard = ({ catalog, onSelect }: PublicCatalogCardProps) => {
  const business = catalog.business_profiles;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={onSelect}>
      <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
        {catalog.cover_url ? (
          <img 
            src={catalog.cover_url} 
            alt={catalog.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
            <Store className="h-12 w-12" />
          </div>
        )}
        {catalog.category && (
          <Badge className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm">
            {catalog.category}
          </Badge>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="truncate text-lg">{catalog.name}</CardTitle>
        </div>
        {business && (
            <div className="flex items-center text-sm text-muted-foreground gap-1">
                <Store className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{business.business_name}</span>
            </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 py-2">
        <CardDescription className="line-clamp-2 text-sm">
          {catalog.description || "Aucune description"}
        </CardDescription>
        
        {business?.city && (
            <div className="flex items-center text-xs text-muted-foreground mt-2 gap-1">
                <MapPin className="w-3 h-3" />
                {business.city}
            </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-2">
        <Button variant="secondary" className="w-full" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Voir le catalogue
        </Button>
      </CardFooter>
    </Card>
  );
};
