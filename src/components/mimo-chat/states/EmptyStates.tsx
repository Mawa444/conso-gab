import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Search, Puzzle, Users, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'conversations' | 'search' | 'plugins' | 'contacts';
  searchTerm?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchTerm,
  onAction,
  className
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'conversations':
        return {
          icon: MessageCircle,
          title: "Aucune conversation",
          description: "Commencez votre première conversation et connectez-vous avec vos contacts.",
          actionLabel: "Démarrer une discussion",
          illustration: "💬"
        };
      
      case 'search':
        return {
          icon: Search,
          title: `Aucun résultat pour "${searchTerm}"`,
          description: "Essayez avec d'autres mots-clés ou vérifiez l'orthographe.",
          actionLabel: "Effacer la recherche",
          illustration: "🔍"
        };
      
      case 'plugins':
        return {
          icon: Puzzle,
          title: "Aucun plugin installé",
          description: "Personnalisez votre expérience MIMO Chat avec nos plugins exclusifs.",
          actionLabel: "Explorer le store",
          illustration: "🧩"
        };
      
      case 'contacts':
        return {
          icon: Users,
          title: "Aucun contact",
          description: "Ajoutez des contacts pour commencer à échanger sur MIMO Chat.",
          actionLabel: "Ajouter un contact",
          illustration: "👥"
        };
      
      default:
        return {
          icon: MessageCircle,
          title: "Rien ici",
          description: "Il n'y a encore rien à afficher.",
          actionLabel: "Rafraîchir",
          illustration: "📭"
        };
    }
  };

  const content = getEmptyStateContent();
  const IconComponent = content.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[400px] ${className}`}>
      {/* Illustration */}
      <div className="text-6xl mb-4 opacity-80">
        {content.illustration}
      </div>
      
      {/* Icon */}
      <div className="mb-4 p-3 bg-mimo-gray-100 rounded-full">
        <IconComponent className="w-8 h-8 text-mimo-gray-400" />
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-mimo-gray-900 mb-2">
        {content.title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-mimo-gray-500 mb-6 max-w-sm leading-relaxed">
        {content.description}
      </p>
      
      {/* Action Button */}
      {onAction && (
        <Button 
          onClick={onAction}
          className="bg-primary-500 text-white hover:bg-primary-600 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          {content.actionLabel}
        </Button>
      )}
    </div>
  );
};

// Composant spécialisé pour les suggestions de recherche
export const SearchSuggestions: React.FC<{ onSuggestionClick: (term: string) => void }> = ({ 
  onSuggestionClick 
}) => {
  const suggestions = [
    "Messages récents",
    "Conversations importantes", 
    "Fichiers partagés",
    "Photos et vidéos"
  ];

  return (
    <div className="p-4">
      <p className="text-sm font-medium text-mimo-gray-700 mb-3">Suggestions :</p>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left px-3 py-2 text-sm text-mimo-gray-600 hover:bg-mimo-gray-50 rounded-lg transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};