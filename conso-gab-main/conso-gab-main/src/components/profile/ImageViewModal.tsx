import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useProfileImageLikes } from '@/hooks/use-profile-image-likes';
import { ImageLikeButton } from '@/components/shared/ImageLikeButton';
import { cn } from '@/lib/utils';

interface ImageViewModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  imageType: 'avatar' | 'cover';
  profileUserId: string;
  imageTitle?: string;
  uploadDate?: string | null;
}

export const ImageViewModal = ({
  open,
  onClose,
  imageUrl,
  imageType,
  profileUserId,
  imageTitle,
  uploadDate
}: ImageViewModalProps) => {
  const { likesCount, isLiked, isLoading, toggleLike } = useProfileImageLikes(
    profileUserId,
    imageType
  );

  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <div className="text-white/70 text-xs">
            {uploadDate && <span>Publié le {formatDate(uploadDate)}</span>}
          </div>
          <ImageLikeButton
            likesCount={likesCount}
            isLiked={isLiked}
            isLoading={isLoading}
            onToggle={toggleLike}
            size="lg"
            className="text-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
