/**
 * Carousel horizontal des stories business sur la page d'accueil
 */

import { useRef } from "react";
import { usePublicStories } from "../hooks/useStories";
import { StoryCard } from "./StoryCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StoriesCarouselProps {
  city?: string;
  limit?: number;
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onStoryClick?: (storyId: string) => void;
}

export const StoriesCarousel = ({ 
  city, 
  limit = 10, 
  title = "Annonces du jour",
  showViewAll = true,
  onViewAll,
  onStoryClick
}: StoriesCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: stories, isLoading } = usePublicStories({ city, limit });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
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
