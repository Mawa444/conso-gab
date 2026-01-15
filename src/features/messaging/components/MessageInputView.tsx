/**
 * Champ de saisie de message - Design Signal-like
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, Smile, Mic, Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageInputViewProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file', attachmentUrl?: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const MessageInputView: React.FC<MessageInputViewProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Écrivez un message..."
}) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [attachment, setAttachment] = useState<{ file: File; preview?: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setContent(textarea.value);

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to match the content (max 120px)
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!content.trim() && !attachment) return;

    if (attachment) {
      // TODO: Upload file first, then send with URL
      toast.info("L'envoi de fichiers arrive bientôt");
      setAttachment(null);
      return;
    }

    onSendMessage(content.trim(), 'text');
    setContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10MB)');
      return;
    }

    // Créer un aperçu pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachment({ file, preview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachment({ file });
    }
  };

  const canSend = content.trim().length > 0 || attachment;

  return (
    <div className="p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Aperçu de la pièce jointe */}
      {attachment && (
        <div className="mb-2 relative inline-block">
          {attachment.preview ? (
            <div className="relative">
              <img
                src={attachment.preview}
                alt="Aperçu"
                className="h-20 rounded-lg object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => setAttachment(null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <Paperclip className="w-4 h-4" />
              <span className="text-sm truncate max-w-[150px]">{attachment.file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setAttachment(null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Zone de saisie */}
        <div className={cn(
          "flex-1 flex items-end gap-1 bg-muted/50 rounded-3xl border transition-all",
          isFocused ? "border-primary/30 bg-muted/70" : "border-transparent"
        )}>
          {/* Bouton fichier */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "flex-1 bg-transparent border-0 resize-none py-2.5 px-1",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-0",
              "max-h-[120px] overflow-y-auto"
            )}
            style={{ minHeight: '40px' }}
          />

          {/* Bouton emoji */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Smile className="w-5 h-5" />
          </Button>
        </div>

        {/* Bouton envoyer / micro */}
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !canSend}
          className={cn(
            "h-10 w-10 rounded-full shadow-md transition-all",
            canSend 
              ? "bg-primary hover:bg-primary/90" 
              : "bg-muted text-muted-foreground hover:bg-muted"
          )}
        >
          {canSend ? (
            <Send className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
};
