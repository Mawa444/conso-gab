import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';
import { useProfileImageLikes } from '@/hooks/use-profile-image-likes';
import { cn } from '@/lib/utils';

interface ImageViewModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  imageType: 'avatar' | 'cover';
  profileUserId: string;
  imageTitle?: string;
}

export const ImageViewModal = ({
  open,
  onClose,
  imageUrl,
  imageType,
  profileUserId,
  imageTitle
}: ImageViewModalProps) => {
  const { likesCount, isLiked, isLoading, toggleLike } = useProfileImageLikes(
    profileUserId,
    imageType
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] p-0 gap-0 bg-black/95 mb-20">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-white font-medium text-sm truncate">
            {imageTitle || (imageType === 'avatar' ? 'Photo de profil' : 'Image de couverture')}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center flex-1 p-4 overflow-hidden">
          <img
            src={imageUrl}
            alt={imageTitle || (imageType === 'avatar' ? 'Photo de profil' : 'Image de couverture')}
            className={cn(
              "max-w-full max-h-full object-contain",
              imageType === 'avatar' && "rounded-full"
            )}
          />
        </div>

        {/* Like Button */}
        <div className="flex items-center justify-center p-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            disabled={isLoading}
            className={cn(
              "text-white hover:bg-white/20 transition-all gap-2",
              isLiked && "text-red-500"
            )}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-all",
                isLiked && "fill-red-500"
              )}
            />
            <span className="font-medium">{likesCount}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
