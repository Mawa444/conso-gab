/**
 * Carousel horizontal des stories business sur la page d'accueil
 */

import { useRef } from 'react';
// import { usePublicStories } from "../hooks/useStories"; // Deprecated for public feed
import { useGeoRecommendations } from '@/features/geolocation/hooks/useGeoRecommendations';
import { StoryCard } from './StoryCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BusinessStory, StoryType } from '../types';

interface StoriesCarouselProps {
  city?: string;
  limit?: number;
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onStoryClick?: (storyId: string) => void;
}

export const StoriesCarousel = ({ 
  limit = 10, 
  title = 'Annonces du jour',
  showViewAll = true,
  onViewAll,
  onStoryClick,
}: StoriesCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // New Geolocation Hook
  const { data: geoStories, isLoading } = useGeoRecommendations({
    type: 'story',
    limit,
    enabled: true,
  });

  // Map RPC result to BusinessStory type
  const stories: BusinessStory[] = (geoStories || []).map(s => ({
    id: s.id,
    business_id: s.business_id,
    title: s.caption || 'Story', // Caption is title for now
    description: s.caption,
    images: s.media_url ? [s.media_url] : [],
    cover_url: s.media_url,
    // Cast or default to 'announcement' if strictly typed
    story_type: (s.media_type as StoryType) || 'announcement', 
    original_price: null,
    promo_price: null,
    discount_percentage: null,
    promo_code: null,
    latitude: null, // Not needed for card display
    longitude: null,
    geo_city: null,
    geo_district: null,
    catalog_id: null,
    product_id: null,
    is_active: true,
    view_count: 0,
    created_at: s.created_at,
    expires_at: s.expires_at,
    updated_at: s.created_at,
    business_profiles: {
      id: s.business_id,
      business_name: s.business_name,
      logo_url: s.business_logo_url,
      business_category: 'Commerce', // Default
      city: null,
      quartier: null,
    },
  }));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-[200px] h-[280px] flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            ({stories.length} annonce{stories.length > 1 ? 's' : ''})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {showViewAll && (
            <Button variant="link" size="sm" onClick={onViewAll}>
              Voir tout
            </Button>
          )}
        </div>
      </div>
      
      {/* Carousel */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {stories.map((story) => (
          <div 
            key={story.id} 
            className="w-[200px] flex-shrink-0"
            style={{ scrollSnapAlign: 'start' }}
          >
            <StoryCard 
              story={story} 
              onClick={() => onStoryClick?.(story.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
