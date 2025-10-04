import React from 'react';
import { X, FileText, Music, Video, File } from 'lucide-react';
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
    if (mediaType === 'image' || mediaType === 'video') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, mediaType]);

  const getFileIcon = () => {
    switch (mediaType) {
      case 'audio':
        return <Music className="w-8 h-8 text-primary" />;
      case 'video':
        return <Video className="w-8 h-8 text-primary" />;
      case 'document':
        return <FileText className="w-8 h-8 text-primary" />;
      default:
        return <File className="w-8 h-8 text-primary" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="relative inline-block">
      <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
        {mediaType === 'image' && previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover"
          />
        )}

        {mediaType === 'video' && previewUrl && (
          <video
            src={previewUrl}
            className="w-32 h-32 object-cover"
            controls={false}
          />
        )}

        {(mediaType === 'audio' || mediaType === 'document') && (
          <div className="w-32 h-32 flex flex-col items-center justify-center gap-2 p-3">
            {getFileIcon()}
            <span className="text-xs text-center text-muted-foreground truncate w-full">
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </div>
        )}

        <Button
          onClick={onRemove}
          size="icon"
          variant="destructive"
          className="absolute top-1 right-1 h-6 w-6 rounded-full"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="mt-1 text-xs text-center text-muted-foreground truncate max-w-[8rem]">
        {file.name}
      </div>
    </div>
  );
};
