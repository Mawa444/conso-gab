import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { useWebRTC } from '@/hooks/use-webrtc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioCallRoomProps {
  conversationId: string;
  userId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  isInitiator: boolean;
  onEndCall: () => void;
}

export const AudioCallRoom: React.FC<AudioCallRoomProps> = ({
  conversationId,
  userId,
  otherUserName = 'Utilisateur',
  otherUserAvatar,
  isInitiator,
  onEndCall
}) => {
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);

  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    toggleAudio,
    endCall
  } = useWebRTC({
    conversationId,
    userId,
    isInitiator,
    mediaType: 'audio'
  });

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (isConnected) {
      toast.success('Appel connecté');
    }
  }, [isConnected]);

  const handleToggleAudio = () => {
    toggleAudio();
    setIsAudioEnabled(prev => !prev);
  };

  const handleEndCall = () => {
    endCall();
    onEndCall();
    toast.info('Appel terminé');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center">
      {/* Audio distant (caché mais actif) */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Interface visuelle */}
      <div className="flex flex-col items-center gap-8">
        {/* Avatar de l'autre utilisateur */}
        <Avatar className="w-32 h-32">
          <AvatarImage src={otherUserAvatar} />
          <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
            {otherUserName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Nom et statut */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {otherUserName}
          </h2>
          <p className="text-muted-foreground">
            {isConnecting && 'Connexion en cours...'}
            {isConnected && 'Appel en cours'}
            {!isConnecting && !isConnected && 'En attente de connexion...'}
          </p>
        </div>

        {/* Indicateur de connexion */}
        {isConnected && (
          <div className="flex items-center gap-2 text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">Connecté</span>
          </div>
        )}

        {/* Contrôles */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={handleToggleAudio}
            size="lg"
            variant={isAudioEnabled ? 'default' : 'destructive'}
            className="rounded-full w-16 h-16"
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            onClick={handleEndCall}
            size="lg"
            variant="destructive"
            className="rounded-full w-16 h-16"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};
