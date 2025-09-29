import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users, className }) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} est en train d'écrire...`;
    } else if (users.length === 2) {
      return `${users[0].name} et ${users[1].name} sont en train d'écrire...`;
    } else {
      return `${users[0].name} et ${users.length - 1} autres sont en train d'écrire...`;
    }
  };

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      <div className="flex items-center gap-2">
        {/* Avatars des utilisateurs qui tapent */}
        <div className="flex -space-x-1">
          {users.slice(0, 3).map((user, index) => (
            <div
              key={user.id}
              className={cn(
                "w-6 h-6 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-medium",
                index > 0 && "ml-0"
              )}
              style={{ zIndex: users.length - index }}
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Animation de frappe */}
        <div className="flex items-center gap-1">
          <TypingDots />
          <span className="text-sm text-mimo-gray-600 italic">
            {getTypingText()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Composant pour l'animation des points
const TypingDots: React.FC = () => {
  return (
    <div className="flex space-x-1 items-center">
      {[0, 1, 2].map((dot) => (
        <div
          key={dot}
          className="w-1.5 h-1.5 bg-mimo-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: `${dot * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

// Hook pour gérer les indicateurs de frappe
export const useTypingIndicator = (conversationId: string) => {
  const [typingUsers, setTypingUsers] = useState<Array<{
    id: string;
    name: string;
    avatar?: string;
  }>>([]);

  // Simuler des utilisateurs qui tapent (à remplacer par la logique réelle)
  useEffect(() => {
    // Ici vous intégreriez avec votre système de WebSockets/Supabase Realtime
    // pour écouter les événements de frappe
    
    const mockTyping = () => {
      // Simulation d'un utilisateur qui tape
      setTypingUsers([
        { id: 'user1', name: 'Marie Dubois', avatar: '' }
      ]);

      // Arrêt après 3 secondes
      setTimeout(() => {
        setTypingUsers([]);
      }, 3000);
    };

    // Simuler un événement de frappe toutes les 10 secondes
    const interval = setInterval(mockTyping, 10000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const startTyping = () => {
    // Logique pour indiquer que l'utilisateur actuel tape
    // Envoyer un événement via Supabase Realtime
  };

  const stopTyping = () => {
    // Logique pour arrêter l'indicateur de frappe
  };

  return {
    typingUsers,
    startTyping,
    stopTyping
  };
};