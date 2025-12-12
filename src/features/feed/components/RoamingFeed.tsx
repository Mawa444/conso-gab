import { useRoamingFeed } from '../hooks/useRoamingFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const RoamingFeed = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useRoamingFeed();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = data?.pages.flatMap(page => page) || [];

  if (items.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>Rien à signaler aux alentours...</p>
        <p className="text-sm">Déplacez-vous pour capter de nouveaux signaux ! 📡</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
           📡 Radar Local
        </h2>
        <Badge variant="outline" className="animate-pulse bg-green-50 text-green-700 border-green-200">
          En direct
        </Badge>
      </div>

      {items.map((item) => (
        <div 
          key={`${item.item_type}-${item.id}`} 
          className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => {
            if (item.item_type === 'business') navigate(`/business/${item.id}`);
            if (item.item_type === 'listing') navigate(`/listings/${item.id}`);
            // if (item.item_type === 'story') // Open story viewer
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (item.item_type === 'business') navigate(`/business/${item.id}`);
              if (item.item_type === 'listing') navigate(`/listings/${item.id}`);
            }
          }}
        >
          {/* Header */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={
                item.item_type === 'story' ? 'default' : 
                  item.item_type === 'listing' ? 'secondary' : 'outline'
              }>
                {item.item_type === 'story' && 'Story'}
                {item.item_type === 'listing' && 'Annonce'}
                {item.item_type === 'business' && 'Commerce'}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
              </span>
            </div>
            <div className="text-xs font-bold text-primary flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.distance_meters < 1000 
                ? `${Math.round(item.distance_meters)}m` 
                : `${(item.distance_meters/1000).toFixed(1)}km`}
            </div>
          </div>

          {/* Media */}
          <div className="aspect-video bg-muted relative">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-10 h-10 opacity-20" />
              </div>
            )}
            
            {/* Overlay Title for Stories */}
            {item.item_type === 'story' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                  <p className="text-white/80 text-sm">{item.subtitle}</p>
                </div>
              </div>
            )}
          </div>

          {/* Body for Listings/Businesses */}
          {item.item_type !== 'story' && (
            <div className="p-4">
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              
              {item.item_type === 'listing' && item.data.price && (
                <div className="mt-2 text-primary font-bold text-lg">
                  {item.data.price.toLocaleString()} {item.data.currency}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {hasNextPage && (
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Chargement...' : 'Voir plus loin 🔭'}
        </Button>
      )}
    </div>
  );
};
