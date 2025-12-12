import { useGeoRecommendations } from '@/features/geolocation/hooks/useGeoRecommendations';
import { UserListingCard } from './UserListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserListingsSection = () => {
  const navigate = useNavigate();
  const { data: listings, isLoading } = useGeoRecommendations({
    type: 'user_listing',
    limit: 10,
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="py-4 space-y-3">
        <div className="flex justify-between items-center px-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-3 overflow-hidden px-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-[160px] h-[220px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    // Optionnel: Cacher la section s'il n'y a pas d'annonces
    // Mais pour l'instant on veut peut-être inciter à publier ?
    return (
      <div className="py-6 px-4 text-center bg-gray-50 rounded-xl mx-4 my-4">
        <ShoppingBag className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <h3 className="font-semibold text-gray-600">Petites Annonces</h3>
        <p className="text-sm text-gray-400 mb-3">Aucune annonce autour de vous.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/listings/create')}>
              Publier une annonce
        </Button>
      </div>
    );
  }

  return (
    <section className="py-2">
      <div className="flex items-center justify-between px-0 mb-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            🤝 Vide-grenier Local
          </h2>
          <p className="text-xs text-muted-foreground">Offres de particuliers à proximité</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary gap-1" onClick={() => navigate('/listings')}>
          Tout voir <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {listings.map((item: any) => (
          <UserListingCard 
            key={item.id} 
            listing={{
              id: item.id,
              title: item.title,
              price: item.price,
              currency: item.currency || 'FCFA',
              images: item.images || [], // RPC returns images
              city: item.city,
              distance_meters: item.distance_meters,
              category: item.category,
              description: item.description,
            }}
            onClick={() => navigate(`/listings/${item.id}`)}
          />
        ))}
      </div>
    </section>
  );
};
