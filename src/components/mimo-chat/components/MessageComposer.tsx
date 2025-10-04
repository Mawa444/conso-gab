import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  Send, 
  Plus, 
  Mic, 
  Camera, 
  Image, 
  FileText, 
  MapPin,
  Smile,
  X
} from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (content: string, type?: string) => void;
  onSendMedia?: (file: File, type: string, caption?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  replyTo?: { id: string; content: string; sender: string } | null;
  onCancelReply?: () => void;
  className?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onSendMedia,
  placeholder = 'Écrivez un message...',
  disabled = false,
  replyTo,
  onCancelReply,
  className
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'camera':
        input.accept = 'image/*';
        input.capture = 'environment';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt';
        break;
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onSendMedia) {
        onSendMedia(file, type);
      }
    };

    input.click();
    setShowAttachments(false);
  };

  const attachmentOptions = [
    { id: 'camera', label: 'Appareil photo', icon: Camera, color: 'bg-error' },
    { id: 'image', label: 'Galerie', icon: Image, color: 'bg-purple-500' },
    { id: 'document', label: 'Document', icon: FileText, color: 'bg-primary' },
    { id: 'location', label: 'Position', icon: MapPin, color: 'bg-success' }
  ];

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={cn(
      'bg-card border-t border-border p-3',
      'safe-area-pb',
      className
    )}>
      {/* Reply preview */}
      {replyTo && (
        <div className="mb-3 p-2 bg-muted rounded-lg border-l-2 border-primary flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">
              Réponse à {replyTo.sender}
            </p>
            <p className="text-sm text-foreground truncate">
              {replyTo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="p-1 h-6 w-6 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Attachments menu */}
      {showAttachments && (
        <div className="mb-3 p-2 bg-muted rounded-lg">
          <div className="grid grid-cols-4 gap-3">
            {attachmentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleFileSelect(option.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-card transition-colors"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white',
                    option.color
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAttachments(!showAttachments)}
          className={cn(
            'p-2 h-10 w-10 rounded-full',
            showAttachments 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-muted'
          )}
        >
          <Plus className={cn(
            'w-5 h-5 transition-transform duration-200',
            showAttachments && 'rotate-45'
          )} />
        </Button>

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'min-h-[40px] max-h-[120px] resize-none',
              'bg-input border-0 rounded-3xl',
              'focus:ring-2 focus:ring-ring focus:bg-card',
              'pr-10'
            )}
          />
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-6 w-6 text-muted-foreground"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Send/Record button */}
        {canSend ? (
          <Button
            onClick={handleSend}
            disabled={disabled}
            className="p-2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => setIsRecording(false)}
            className={cn(
              'p-2 h-10 w-10 rounded-full transition-all duration-200',
              isRecording 
                ? 'bg-error text-error-foreground scale-110' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center justify-center gap-2 text-error">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
          <span className="text-sm font-medium">Enregistrement en cours...</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
      />
    </div>
  );
};