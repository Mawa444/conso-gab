import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions?: Reaction[];
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  className?: string;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = [],
  onAddReaction,
  onRemoveReaction,
  className
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Émojis populaires pour les réactions rapides
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];
  
  const handleReactionClick = (emoji: string, hasReacted: boolean) => {
    if (hasReacted) {
      onRemoveReaction?.(emoji);
    } else {
      onAddReaction?.(emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onAddReaction?.(emoji);
    setShowEmojiPicker(false);
  };

  if (reactions.length === 0 && !onAddReaction) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1 mt-1", className)}>
      {/* Réactions existantes */}
      {reactions.map((reaction, index) => (
        <Button
          key={`${messageId}-${reaction.emoji}-${index}`}
          size="sm"
          variant={reaction.hasReacted ? "default" : "outline"}
          onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
          className={cn(
            "h-6 px-2 text-xs rounded-full transition-all duration-200 hover:scale-105",
            reaction.hasReacted 
              ? "bg-primary-100 text-primary-700 border-primary-200" 
              : "bg-white hover:bg-mimo-gray-50"
          )}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span className="text-xs">{reaction.count}</span>
        </Button>
      ))}

      {/* Bouton pour ajouter une réaction */}
      {onAddReaction && (
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-full hover:bg-mimo-gray-100 text-mimo-gray-400 hover:text-mimo-gray-600"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-auto p-2" 
            align="center"
            side="top"
          >
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

// Composant sélecteur d'émojis simple
const EmojiPicker: React.FC<{ onEmojiSelect: (emoji: string) => void }> = ({ 
  onEmojiSelect 
}) => {
  const categories = [
    {
      name: "Fréquents",
      emojis: ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉']
    },
    {
      name: "Smileys",
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰']
    },
    {
      name: "Gestes",
      emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️']
    },
    {
      name: "Cœurs", 
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖']
    }
  ];

  return (
    <div className="w-64 max-h-48 overflow-y-auto">
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-3">
          <h4 className="text-xs font-medium text-mimo-gray-600 mb-2 px-1">
            {category.name}
          </h4>
          <div className="grid grid-cols-8 gap-1">
            {category.emojis.map((emoji, emojiIndex) => (
              <button
                key={`${categoryIndex}-${emojiIndex}`}
                onClick={() => onEmojiSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-mimo-gray-100 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook pour gérer les réactions
export const useMessageReactions = (messageId: string) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const addReaction = async (emoji: string) => {
    // Logique pour ajouter une réaction via Supabase
    // Mise à jour optimiste
    setReactions(prev => {
      const existingReaction = prev.find(r => r.emoji === emoji);
      if (existingReaction) {
        return prev.map(r => 
          r.emoji === emoji 
            ? { ...r, count: r.count + 1, hasReacted: true }
            : r
        );
      } else {
        return [...prev, { emoji, count: 1, users: [], hasReacted: true }];
      }
    });
  };

  const removeReaction = async (emoji: string) => {
    // Logique pour supprimer une réaction via Supabase
    // Mise à jour optimiste
    setReactions(prev => 
      prev.map(r => 
        r.emoji === emoji 
          ? { ...r, count: Math.max(0, r.count - 1), hasReacted: false }
          : r
      ).filter(r => r.count > 0)
    );
  };

  return {
    reactions,
    addReaction,
    removeReaction
  };
};