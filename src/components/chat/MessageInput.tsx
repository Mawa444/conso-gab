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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useMediaUpload, MediaType } from '@/hooks/use-media-upload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from './VoiceRecorder';
import { MediaPreview } from './MediaPreview';
import { MessageType } from '@/types/chat.types';

interface MessageInputProps {
  onSendMessage: (content: string, type?: MessageType, attachmentUrl?: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Message",
  className
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { uploadFile, uploading, progress } = useMediaUpload();

  const handleSend = async () => {
    if (selectedFile && selectedMediaType) {
      toast.info('Upload en cours...');
      const url = await uploadFile(selectedFile, selectedMediaType);
      if (url) {
        const messageType = selectedMediaType === 'document' ? 'file' : selectedMediaType;
        await onSendMessage(message.trim() || selectedFile.name, messageType as MessageType, url);
        setSelectedFile(null);
        setSelectedMediaType(null);
        setMessage('');
      }
    } else {
      const trimmedMessage = message.trim();
      if (!trimmedMessage || disabled || uploading) return;

      setMessage('');
      await onSendMessage(trimmedMessage, 'text');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (type: MediaType) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/jpeg,image/png,image/webp,image/gif';
        break;
      case 'video':
        input.accept = 'video/mp4,video/webm,video/quicktime';
        break;
      case 'audio':
        input.accept = 'audio/mpeg,audio/wav,audio/ogg,audio/webm';
        break;
      case 'document':
        input.accept = '.pdf,.txt,.doc,.docx,.xls,.xlsx';
        break;
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        setSelectedMediaType(type);
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
    setIsRecording(true);
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
    toast.info('Upload en cours...');
    const url = await uploadFile(audioFile, 'audio');
    if (url) {
      await onSendMessage('🎤 Note vocale', 'audio', url);
      toast.success('Note vocale envoyée');
    }
    setIsRecording(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  if (isRecording) {
    return (
      <div className={cn("bg-card p-4", className)}>
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onCancel={() => setIsRecording(false)}
        />
      </div>
    );
  }

  return (
    <div className={cn("bg-card p-4", className)}>
      {uploading && (
        <div className="mb-3 px-3 py-2 bg-primary/10 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Upload en cours...</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {selectedFile && selectedMediaType && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
          <MediaPreview
            file={selectedFile}
            mediaType={selectedMediaType}
            onRemove={() => {
              setSelectedFile(null);
              setSelectedMediaType(null);
            }}
          />
        </div>
      )}

      <div className="flex items-end gap-2">
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
          <DropdownMenuContent align="start" className="w-48 bg-card z-50">
            <DropdownMenuItem onClick={() => handleFileSelect('image')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileSelect('video')}>
              <Video className="w-4 h-4 mr-2" />
              Vidéo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileSelect('audio')}>
              <FileText className="w-4 h-4 mr-2" />
              Audio
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

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || uploading}
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none pr-10",
              "focus-visible:ring-1 focus-visible:ring-primary"
            )}
            rows={1}
          />
          
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 bottom-1 h-8 w-8"
                disabled={disabled || uploading}
              >
                <Smile className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="end" 
              className="w-auto p-0 border-none shadow-lg"
              sideOffset={8}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={320}
                height={400}
              />
            </PopoverContent>
          </Popover>
        </div>

        {message.trim() || selectedFile ? (
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
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
