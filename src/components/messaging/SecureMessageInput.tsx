import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Send, AlertTriangle, Paperclip } from 'lucide-react';
import { useSecureMessaging } from '@/hooks/use-secure-messaging';
import { validateFileUpload } from '@/lib/validation';
import { toast } from '@/hooks/use-toast';

interface SecureMessageInputProps {
  conversationId: string;
  onMessageSent?: () => void;
}

export const SecureMessageInput: React.FC<SecureMessageInputProps> = ({
  conversationId,
  onMessageSent
}) => {
  const [message, setMessage] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { sendSecureMessage, loading } = useSecureMessaging(conversationId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFileUpload(file);
    if (!validation.valid) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: validation.error,
      });
      return;
    }

    setAttachmentFile(file);
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !attachmentFile) return;

    setIsValidating(true);

    try {
      let attachmentUrl = undefined;
      
      // Handle file upload if there's an attachment
      if (attachmentFile) {
        // Note: In a real implementation, you would upload to Supabase Storage here
        // For now, we'll just simulate it
        console.log('Would upload file:', attachmentFile.name);
        // attachmentUrl = await uploadFileToStorage(attachmentFile);
      }

      await sendSecureMessage({
        content: message,
        message_type: attachmentFile ? 'document' : 'text',
        attachment_url: attachmentUrl,
      });

      // Reset form
      setMessage('');
      setAttachmentFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('attachment-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-4 p-4 border-t bg-background/50">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Messages are validated and sanitized for security. Avoid sharing sensitive information.
        </AlertDescription>
      </Alert>

      {attachmentFile && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <Paperclip className="h-4 w-4" />
          <span className="text-sm">{attachmentFile.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAttachmentFile(null)}
          >
            Remove
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send)"
            className="min-h-[80px] resize-none"
            maxLength={2000}
            disabled={loading || isValidating}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {message.length}/2000 characters
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div>
            <Input
              id="attachment-input"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt,.doc,.docx"
            />
            <Label htmlFor="attachment-input" asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={loading || isValidating}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </Label>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && !attachmentFile) || loading || isValidating}
            size="icon"
          >
            {loading || isValidating ? (
              <AlertTriangle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {(message.length > 1800 || (attachmentFile && message.length > 1500)) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Message is getting too long. Consider breaking it into multiple messages.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};