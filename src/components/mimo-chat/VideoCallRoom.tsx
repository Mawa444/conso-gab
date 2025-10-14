import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useWebRTC } from '@/hooks/use-webrtc';
import { toast } from 'sonner';

interface VideoCallRoomProps {
  conversationId: string;
  userId: string;
  isInitiator: boolean;
  onEndCall: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  conversationId,
  userId,
  isInitiator,
  onEndCall
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);

  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    toggleAudio,
    toggleVideo,
    endCall
  } = useWebRTC({
    conversationId,
    userId,
    isInitiator,
    mediaType: 'video'
  });

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (isConnected) {
      toast.success('Appel vidéo connecté');
    }
  }, [isConnected]);

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoEnabled(prev => !prev);
  };

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
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      {/* Remote Video */}
      <div className="absolute inset-0">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <div className="text-center text-white">
              <Video className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {isConnecting ? 'Connexion en cours...' : 'En attente de connexion...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video */}
      <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-xl border-2 border-white/20">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <VideoOff className="w-8 h-8 text-white/50" />
          </div>
        )}
      </div>

      {/* Indicateur de connexion */}
      {isConnected && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-2 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white text-sm">Connecté</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <Button
          onClick={handleToggleVideo}
          size="lg"
          variant={isVideoEnabled ? 'default' : 'destructive'}
          className="rounded-full w-14 h-14"
        >
          {isVideoEnabled ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </Button>

        <Button
          onClick={handleToggleAudio}
          size="lg"
          variant={isAudioEnabled ? 'default' : 'destructive'}
          className="rounded-full w-14 h-14"
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
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};
