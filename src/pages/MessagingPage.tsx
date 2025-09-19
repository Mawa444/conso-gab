import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CommunicationCenter } from "@/components/messaging/CommunicationCenter";

export type { ConversationFilter } from "@/types/messaging";

export const MessagingPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Accès restreint</h2>
          <p className="text-muted-foreground">Connectez-vous pour accéder à la messagerie</p>
        </div>
      </div>
    );
  }

  return <CommunicationCenter />;
};