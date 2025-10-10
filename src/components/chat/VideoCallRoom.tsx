import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface VideoCallRoomProps {
  conversationId: string;
  onEndCall: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  conversationId,
  onEndCall
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    initializeMedia();

    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsConnecting(false);
      toast.success('Caméra et microphone activés');

      // TODO: Implémenter la connexion WebRTC réelle avec signaling server
      // Pour l'instant, c'est une vue locale uniquement
      logger.info('Video call initialized', { conversationId });

    } catch (error) {
      logger.error('Failed to access media devices', error);
      toast.error('Impossible d\'accéder à la caméra ou au microphone');
      setIsConnecting(false);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    cleanup();
    onEndCall();
    toast.info('Appel terminé');
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden">
      {/* Video Grid */}
      <div className="flex-1 relative bg-muted">
        {/* Remote Video (Main) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Placeholder if no remote stream */}
          {!remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
              <Video className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">En attente de l'autre participant...</p>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg border-2 border-primary">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <VideoOff className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-6 bg-card border-t">
        <Button
          variant={audioEnabled ? 'outline' : 'destructive'}
          size="icon"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12"
        >
          {audioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant={videoEnabled ? 'outline' : 'destructive'}
          size="icon"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12"
        >
          {videoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={handleEndCall}
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>

      {/* Connection Status */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Connexion en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
};
