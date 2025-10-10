import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Phone } from 'lucide-react';
import { VideoCallRoom } from './VideoCallRoom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoCallButtonProps {
  conversationId: string;
  onCallStart?: () => void;
  className?: string;
}

export const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  conversationId,
  onCallStart,
  className
}) => {
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [inCall, setInCall] = useState(false);

  const handleStartCall = () => {
    setShowCallDialog(true);
    setInCall(true);
    onCallStart?.();
  };

  const handleEndCall = () => {
    setInCall(false);
    setShowCallDialog(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleStartCall}
        className={className}
        title="Lancer un appel vidéo"
      >
        <Video className="w-5 h-5" />
      </Button>

      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-4xl h-[600px]">
          <DialogHeader>
            <DialogTitle>Appel vidéo</DialogTitle>
            <DialogDescription>
              Appel en cours...
            </DialogDescription>
          </DialogHeader>
          
          {inCall && (
            <VideoCallRoom
              conversationId={conversationId}
              onEndCall={handleEndCall}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
