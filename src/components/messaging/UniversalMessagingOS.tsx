import React, { createContext, useContext, useState, useEffect } from "react";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useAuth } from "@/components/auth/AuthProvider";
import { MessagingModeToggle } from "./core/MessagingModeToggle";
import { MessagingNavigation } from "./core/MessagingNavigation";
import { ConversationViewer } from "./core/ConversationViewer";
import { Conversation, Message } from "@/types/messaging-advanced";
import { ConversationFilter } from "@/types/messaging";

interface MessagingContextValue {
  currentView: 'inbox' | 'conversation' | 'settings' | 'analytics';
  setCurrentView: (view: 'inbox' | 'conversation' | 'settings' | 'analytics') => void;
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  isFullScreen: boolean;
  setIsFullScreen: (fullScreen: boolean) => void;
  filters: ConversationFilter[];
  activeFilter: ConversationFilter;
  setActiveFilter: (filter: ConversationFilter) => void;
}

const MessagingContext = createContext<MessagingContextValue | null>(null);

export const useMessagingContext = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessagingContext must be used within UniversalMessagingOS');
  }
  return context;
};

interface UniversalMessagingOSProps {
  children: React.ReactNode;
}

export const UniversalMessagingOS: React.FC<UniversalMessagingOSProps> = ({ children }) => {
  const { currentMode } = useProfileMode();
  const { user } = useAuth();
  
  const [currentView, setCurrentView] = useState<'inbox' | 'conversation' | 'settings' | 'analytics'>('inbox');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all');

  // Filtres disponibles selon le mode utilisateur
  const filters: ConversationFilter[] = currentMode === 'business' 
    ? ['all', 'unread', 'orders', 'quotes', 'reservations', 'support', 'archived']
    : ['all', 'unread', 'businesses', 'orders', 'reservations', 'archived'];

  const contextValue: MessagingContextValue = {
    currentView,
    setCurrentView,
    activeConversation,
    setActiveConversation,
    isFullScreen,
    setIsFullScreen,
    filters,
    activeFilter,
    setActiveFilter
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      <div className={`min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5 transition-all duration-500 ${
        isFullScreen ? 'fixed inset-0 z-50' : ''
      }`}>
        
        {/* Header universel avec bascule de mode */}
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-xl font-bold text-gaboma-gradient">
                  Messagerie {currentMode === 'business' ? 'Pro' : 'Client'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MessagingModeToggle />
              <MessagingNavigation />
            </div>
          </div>
        </div>

        {/* Interface principale */}
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {activeConversation ? (
            <ConversationViewer 
              conversation={activeConversation}
              onClose={() => setActiveConversation(null)}
            />
          ) : (
            <div className="flex-1 p-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </MessagingContext.Provider>
  );
};