import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Send,
  Volume2 
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onSendRecording: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export const AudioRecorder = ({ onSendRecording, onCancel, disabled }: AudioRecorderProps) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioLevel,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    formatTime
  } = useAudioRecorder();

  const [audioPreview, setAudioPreview] = useState<{
    url: string;
    blob: Blob;
    duration: number;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartRecording = async () => {
    const success = await startRecording();
    if (success) {
      setAudioPreview(null);
    }
  };

  const handleStopRecording = async () => {
    const recording = await stopRecording();
    if (recording) {
      setAudioPreview({
        url: recording.url,
        blob: recording.blob,
        duration: recording.duration
      });
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      cancelRecording();
    }
    setAudioPreview(null);
    onCancel?.();
  };

  const handleSend = () => {
    if (audioPreview) {
      onSendRecording(audioPreview.blob, audioPreview.duration);
      setAudioPreview(null);
    }
  };

  const playPreview = () => {
    if (!audioPreview) return;

    const audio = new Audio(audioPreview.url);
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  // Mode enregistrement
  if (isRecording || audioPreview) {
    return (
      <Card className="p-4 space-y-4">
        {/* Visualiseur audio en temps réel */}
        {isRecording && (
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full bg-red-500 animate-pulse",
              isPaused && "animate-none bg-yellow-500"
            )} />
            
            {/* Barres de niveau audio */}
            <div className="flex items-end gap-1 h-8 flex-1">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="bg-primary/20 w-1 transition-all duration-75"
                  style={{
                    height: `${Math.max(10, audioLevel * 100 * (1 - i * 0.05))}%`,
                    opacity: audioLevel > (i * 0.05) ? 1 : 0.3
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono text-muted-foreground">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        )}

        {/* Preview audio */}
        {audioPreview && (
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={playPreview}
              className="p-2"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="text-sm font-medium">
                Enregistrement audio
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(audioPreview.duration)}
              </div>
            </div>
          </div>
        )}

        {/* Contrôles */}
        <div className="flex justify-center gap-2">
          {isRecording ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={isPaused ? resumeRecording : pauseRecording}
                disabled={disabled}
              >
                {isPaused ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopRecording}
                disabled={disabled}
              >
                <Square className="w-4 h-4" />
              </Button>
            </>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {audioPreview && (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={disabled}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Bouton d'enregistrement initial
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStartRecording}
      disabled={disabled}
      className="p-2"
    >
      <Mic className="w-4 h-4" />
    </Button>
  );
};