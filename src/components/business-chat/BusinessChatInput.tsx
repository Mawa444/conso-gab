import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Paperclip,
  Send,
  Smile,
  Mic,
  Image as ImageIcon,
  Video,
  FileText,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BusinessChatInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location', attachmentUrl?: string) => Promise<void>;
  disabled?: boolean;
  businessId: string;
}

export const BusinessChatInput: React.FC<BusinessChatInputProps> = ({
  onSendMessage,
  disabled = false,
  businessId
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useMediaUpload();

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || uploading) return;

    setMessage('');
    await onSendMessage(trimmedMessage, 'text');
    
    // Réinitialiser la hauteur du textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (type: 'image' | 'video' | 'document') => {
    if (!fileInputRef.current) return;

    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/jpeg,image/png,image/webp,image/gif';
        break;
      case 'video':
        input.accept = 'video/mp4,video/webm,video/quicktime';
        break;
      case 'document':
        input.accept = '.pdf,.txt,.doc,.docx,.xls,.xlsx';
        break;
    }

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      toast.info('Upload en cours...');
      
      const url = await uploadFile(file, type);
      if (url) {
        const messageType = type === 'document' ? 'file' : type;
        await onSendMessage(file.name, messageType as any, url);
      }
    };

    input.click();
  };

  const handleLocationShare = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          await onSendMessage(
            `📍 Position partagée`,
            'location',
            JSON.stringify(locationData)
          );
          toast.success('Position partagée');
        },
        (error) => {
          toast.error('Impossible de récupérer votre position');
          console.error('Erreur géolocalisation:', error);
        }
      );
    } else {
      toast.error('Géolocalisation non supportée');
    }
  };

  const handleVoiceRecord = () => {
    // TODO: Implémenter l'enregistrement vocal
    toast.info('Fonctionnalité en cours de développement');
    setIsRecording(!isRecording);
  };

  // Auto-resize du textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end gap-2">
        {/* Bouton Attachements */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              disabled={disabled || uploading}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => handleFileSelect('image')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileSelect('video')}>
              <Video className="w-4 h-4 mr-2" />
              Vidéo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileSelect('document')}>
              <FileText className="w-4 h-4 mr-2" />
              Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLocationShare}>
              <MapPin className="w-4 h-4 mr-2" />
              Position
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Champ de texte */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            disabled={disabled || uploading}
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none pr-10",
              "focus-visible:ring-1 focus-visible:ring-primary"
            )}
            rows={1}
          />
          
          {/* Bouton Emoji (dans le textarea) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1 h-8 w-8"
            disabled={disabled || uploading}
            onClick={() => toast.info('Sélecteur d\'emoji en cours de développement')}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Bouton Envoyer ou Micro */}
        {message.trim() ? (
          <Button
            onClick={handleSend}
            disabled={disabled || uploading}
            className="flex-shrink-0 rounded-full w-10 h-10 p-0"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            disabled={disabled || uploading}
            onClick={handleVoiceRecord}
          >
            <Mic className={cn(
              "w-5 h-5",
              isRecording && "text-red-500 animate-pulse"
            )} />
          </Button>
        )}
      </div>

      {/* Indicateur d'upload */}
      {uploading && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Upload en cours...</span>
        </div>
      )}

      {/* Indicateur d'enregistrement */}
      {isRecording && (
        <div className="mt-2 text-xs text-red-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Enregistrement en cours...</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" className="hidden" />
    </div>
  );
};
