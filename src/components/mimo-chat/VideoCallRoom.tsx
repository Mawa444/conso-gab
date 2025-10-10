import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallRoomProps {
  conversationId: string;
  onEndCall: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  conversationId,
  onEndCall
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    initializeMedia();

    return () => {
      cleanupMedia();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      toast.success('Appel vidéo connecté');
    } catch (error) {
      console.error('Erreur d\'accès aux médias:', error);
      toast.error('Impossible d\'accéder à la caméra ou au microphone');
      onEndCall();
    }
  };

  const cleanupMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    cleanupMedia();
    onEndCall();
    toast.info('Appel terminé');
  };

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      {/* Remote Video (Placeholder for now - will be implemented with WebRTC) */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
        <div className="text-center text-white">
          <Video className="w-24 h-24 mx-auto mb-4 opacity-50" />
          <p className="text-lg">En attente de connexion...</p>
          <p className="text-sm opacity-70 mt-2">WebRTC sera implémenté prochainement</p>
        </div>
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

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <Button
          onClick={toggleVideo}
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
          onClick={toggleAudio}
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

      {/* TODO: Implement WebRTC signaling for peer-to-peer connection */}
    </div>
  );
};
