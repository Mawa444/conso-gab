import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaUpload } from '@/hooks/use-media-upload';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { uploadFile, uploading } = useMediaUpload();

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
          type: 'audio/webm'
        });

        toast.info('Upload de la note vocale en cours...');
        const url = await uploadFile(audioFile, 'audio');
        
        if (url) {
          onRecordingComplete(url);
        } else {
          toast.error('Échec de l\'upload de la note vocale');
          onCancel();
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Enregistrement démarré');
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
      toast.error('Impossible d\'accéder au microphone');
      onCancel();
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-card rounded-lg shadow-lg">
      <div className="relative">
        <div className={`w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}>
          <Mic className="w-12 h-12 text-destructive" />
        </div>
        {isRecording && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full animate-pulse" />
        )}
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold font-mono">{formatTime(recordingTime)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {isRecording ? 'Enregistrement en cours...' : 'Upload en cours...'}
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleCancel}
          variant="outline"
          size="lg"
          className="rounded-full"
          disabled={uploading}
        >
          <X className="w-5 h-5 mr-2" />
          Annuler
        </Button>

        {isRecording && (
          <Button
            onClick={stopRecording}
            size="lg"
            className="rounded-full bg-destructive hover:bg-destructive/90"
          >
            <Square className="w-5 h-5 mr-2" />
            Arrêter
          </Button>
        )}
      </div>
    </div>
  );
};
