import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLikeButtonProps {
  likesCount: number;
  isLiked: boolean;
  isLoading: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ImageLikeButton = ({
  likesCount,
  isLiked,
  isLoading,
  onToggle,
  size = 'md',
  className
}: ImageLikeButtonProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-1.5 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      aria-label={isLiked ? "Retirer le like" : "Aimer"}
    >
      <Heart
        className={cn(
          sizes[size],
          "transition-all",
          isLiked ? "fill-red-500 text-red-500" : "text-current"
        )}
      />
      <span className={cn("font-medium", textSizes[size])}>
        {likesCount}
      </span>
    </button>
  );
};
