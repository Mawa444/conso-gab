import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, Video, Send } from 'lucide-react';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoCallRoom } from './VideoCallRoom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

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
    setShowVideoCall(true);
    await sendMessage('📞 Appel vidéo démarré', 'video');
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
      case 'video':
        return <p className="text-primary font-semibold">📞 {message.content}</p>;
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

  if (showVideoCall) {
    return (
      <VideoCallRoom
        conversationId={conversationId}
        onEndCall={() => setShowVideoCall(false)}
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
          
          <Button
            onClick={handleStartVideoCall}
            size="sm"
            variant="ghost"
            className="rounded-full"
          >
            <Video className="w-5 h-5 text-primary" />
          </Button>
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

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card p-4">
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Écrire un message..."
            className="flex-1"
          />

          <Button
            onClick={handleStartRecording}
            size="icon"
            variant="ghost"
            className="rounded-full flex-shrink-0"
          >
            <Mic className="w-5 h-5 text-primary" />
          </Button>

          <Button
            onClick={handleSendText}
            size="icon"
            className="rounded-full flex-shrink-0"
            disabled={!inputText.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
