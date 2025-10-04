import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Erreur d'accès au microphone",
        description: "Veuillez autoriser l'accès au microphone.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    setRecordingTime(0);
    onCancel();
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
      {!isRecording && !audioBlob && (
        <Button
          onClick={startRecording}
          size="sm"
          variant="secondary"
          className="gap-2"
        >
          <Mic className="w-4 h-4" />
          Enregistrer
        </Button>
      )}

      {isRecording && (
        <>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
          </div>
          <Button
            onClick={stopRecording}
            size="sm"
            variant="destructive"
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            Arrêter
          </Button>
        </>
      )}

      {audioBlob && !isRecording && (
        <>
          <span className="text-sm text-muted-foreground flex-1">
            Enregistrement: {formatTime(recordingTime)}
          </span>
          <Button
            onClick={handleCancel}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSend}
            size="sm"
            variant="default"
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Envoyer
          </Button>
        </>
      )}

      {!isRecording && !audioBlob && (
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
        >
          Annuler
        </Button>
      )}
    </div>
  );
};
