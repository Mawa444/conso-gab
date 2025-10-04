import React from 'react';
import { X, FileIcon, Music, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaType } from '@/hooks/use-media-upload';

interface MediaPreviewProps {
  file: File;
  mediaType: MediaType;
  onRemove: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  file,
  mediaType,
  onRemove
}) => {
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const renderPreview = () => {
    switch (mediaType) {
      case 'image':
        return (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-32 rounded-lg object-cover"
          />
        );
      case 'video':
        return (
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center gap-3">
            <FileIcon className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex items-center gap-3 p-3 bg-muted rounded-lg">
      {renderPreview()}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-2 right-2 w-6 h-6 rounded-full"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
