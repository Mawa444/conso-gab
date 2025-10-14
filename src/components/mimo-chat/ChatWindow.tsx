import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, Video, Send, Paperclip, Smile, Phone } from 'lucide-react';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoCallRoom } from './VideoCallRoom';
import { AudioCallRoom } from './AudioCallRoom';
import { useMessageFileUpload } from '@/hooks/use-message-file-upload';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatWindowProps {
  conversationId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const { user } = useAuth();
  const { 
    messages, 
    activeConversation,
    sendMessage,
    fetchMessages,
    subscribeToConversation,
    unsubscribeFromConversation 
  } = useMessaging();
  const { uploadFile, uploading } = useMessageFileUpload();

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isCallInitiator, setIsCallInitiator] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      subscribeToConversation(conversationId);
    }

    return () => {
      unsubscribeFromConversation();
    };
  }, [conversationId]);

  const handleSendText = async () => {
    if (inputText.trim()) {
      await sendMessage(inputText.trim(), 'text');
      setInputText('');
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = async (voiceNoteUrl: string) => {
    await sendMessage('🎤 Note vocale', 'audio', voiceNoteUrl);
    setIsRecording(false);
  };

  const handleStartVideoCall = async () => {
    setIsCallInitiator(true);
    setShowVideoCall(true);
    await sendMessage('📹 Appel vidéo démarré', 'system');
  };

  const handleStartAudioCall = async () => {
    setIsCallInitiator(true);
    setShowAudioCall(true);
    await sendMessage('📞 Appel audio démarré', 'system');
  };

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      toast.info('Upload en cours...');
      const fileUrl = await uploadFile(file, 'document');
      
      if (fileUrl) {
        await sendMessage(`📎 ${file.name}`, 'document', fileUrl);
        toast.success('Fichier envoyé');
      }
    };
    input.click();
  };

  const renderMessageContent = (message: any) => {
    switch (message.message_type) {
      case 'text':
        return <p className="text-sm">{message.content}</p>;
      case 'audio':
        return (
          <audio controls src={message.attachment_url} className="max-w-full">
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        );
      case 'document':
      case 'file':
        return (
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            <a 
              href={message.attachment_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm underline hover:no-underline"
            >
              {message.content}
            </a>
          </div>
        );
      case 'image':
        return message.attachment_url ? (
          <img 
            src={message.attachment_url} 
            alt="Image" 
            className="max-w-full rounded-lg"
          />
        ) : <p className="text-sm">{message.content}</p>;
      case 'video':
        return message.attachment_url ? (
          <video 
            controls 
            src={message.attachment_url} 
            className="max-w-full rounded-lg"
          >
            Votre navigateur ne supporte pas la vidéo.
          </video>
        ) : <p className="text-primary font-semibold">📞 {message.content}</p>;
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  const getConversationTitle = () => {
    if (activeConversation?.title) return activeConversation.title;
    if (activeConversation?.business_context?.business_name) {
      return activeConversation.business_context.business_name;
    }
    return 'Conversation';
  };

  // Obtenir les infos de l'autre participant
  const otherParticipant = activeConversation?.participants?.find(
    p => p.user_id !== user?.id
  );

  if (showVideoCall) {
    return (
      <VideoCallRoom
        conversationId={conversationId}
        userId={user?.id || ''}
        isInitiator={isCallInitiator}
        onEndCall={() => {
          setShowVideoCall(false);
          setIsCallInitiator(false);
        }}
      />
    );
  }

  if (showAudioCall) {
    return (
      <AudioCallRoom
        conversationId={conversationId}
        userId={user?.id || ''}
        otherUserName={otherParticipant?.profile?.display_name}
        otherUserAvatar={otherParticipant?.profile?.avatar_url}
        isInitiator={isCallInitiator}
        onEndCall={() => {
          setShowAudioCall(false);
          setIsCallInitiator(false);
        }}
      />
    );
  }

  if (isRecording) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <VoiceRecorder
          onRecordingComplete={handleStopRecording}
          onCancel={() => setIsRecording(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{getConversationTitle()}</h2>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleStartAudioCall}
              size="sm"
              variant="ghost"
              className="rounded-full"
              title="Appel audio"
            >
              <Phone className="w-5 h-5 text-primary" />
            </Button>
            <Button
              onClick={handleStartVideoCall}
              size="sm"
              variant="ghost"
              className="rounded-full"
              title="Appel vidéo"
            >
              <Video className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender_id === user?.id;
            const senderName = msg.sender_profile?.display_name || 'Utilisateur';
            const senderAvatar = msg.sender_profile?.avatar_url;

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3',
                  isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={senderAvatar} alt={senderName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {senderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className={cn('flex flex-col max-w-[70%]', isCurrentUser && 'items-end')}>
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2',
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {renderMessageContent(msg)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Area - Enhanced */}
      <div className="flex-shrink-0 border-t border-border bg-card p-3 sm:p-4">
        <div className="flex gap-2 items-end">
          {/* Boutons supplémentaires */}
          <div className="flex flex-col gap-1">
            <Button
              onClick={handleFileUpload}
              size="icon"
              variant="ghost"
              className="rounded-full h-9 w-9"
              title="Joindre un fichier"
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Zone de saisie */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="relative flex items-center gap-2 bg-muted rounded-2xl px-4 py-2">
              <Input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendText()}
                placeholder="Écrire un message..."
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto min-h-[24px] max-h-[120px]"
              />
              <Button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                size="icon"
                variant="ghost"
                className="rounded-full h-8 w-8 flex-shrink-0"
                title="Emojis"
              >
                <Smile className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Boutons d'envoi */}
          <div className="flex gap-1">
            <Button
              onClick={handleStartRecording}
              size="icon"
              variant="ghost"
              className="rounded-full h-9 w-9"
              title="Note vocale"
            >
              <Mic className="w-4 h-4 text-primary" />
            </Button>

            <Button
              onClick={handleSendText}
              size="icon"
              className="rounded-full h-9 w-9"
              disabled={!inputText.trim()}
              title="Envoyer"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
