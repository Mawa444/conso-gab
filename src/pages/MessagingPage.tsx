import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { UniversalMessagingOS } from "@/components/messaging/UniversalMessagingOS";
import { MessagingConsumerInterface } from "@/components/messaging/consumer/MessagingConsumerInterface";
import { MessagingBusinessInterface } from "@/components/messaging/business/MessagingBusinessInterface";
import { Loader2 } from "lucide-react";

export type { ConversationFilter } from "@/types/messaging";

export const MessagingPage = () => {
  const { user } = useAuth();
  const { currentMode, loading: modeLoading } = useProfileMode();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!modeLoading) {
      setIsInitialized(true);
    }
  }, [modeLoading]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
        <div className="text-center space-y-6 p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 shadow-soft">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gaboma-gradient">Accès Universel</h2>
            <p className="text-muted-foreground text-lg">Connectez-vous pour accéder à l'écosystème de messagerie intelligente</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Initialisation de votre interface...</p>
        </div>
      </div>
    );
  }

  return (
    <UniversalMessagingOS>
      {currentMode === 'consumer' ? (
        <MessagingConsumerInterface />
      ) : (
        <MessagingBusinessInterface />
      )}
    </UniversalMessagingOS>
  );
};