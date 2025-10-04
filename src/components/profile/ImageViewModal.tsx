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
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0 bg-black/95">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-medium">
                {imageTitle || (imageType === 'avatar' ? 'Photo de profil' : 'Image de couverture')}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center w-full h-full p-8">
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleLike}
              disabled={isLoading}
              className={cn(
                "text-white hover:bg-white/20 transition-all gap-3",
                isLiked && "text-red-500"
              )}
            >
              <Heart
                className={cn(
                  "w-6 h-6 transition-all",
                  isLiked && "fill-red-500"
                )}
              />
              <span className="text-lg font-medium">{likesCount}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
