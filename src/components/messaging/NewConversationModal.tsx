import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, MessageSquare, X } from "lucide-react";
import { useConversations } from "@/hooks/use-conversations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewConversationModal = ({ open, onOpenChange }: NewConversationModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createPrivateConversation } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rechercher des utilisateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchUsers(value);
  };

  const startPrivateConversation = async (targetUserId: string, firstName: string, lastName: string) => {
    setCreating(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      const conversationId = await createPrivateConversation(targetUserId, `Conversation avec ${fullName}`);
      
      if (conversationId) {
        onOpenChange(false);
        navigate(`/messaging/conversation/${conversationId}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Nouvelle conversation
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Options rapides */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => {
                // TODO: Implémenter la création de groupe
                toast({
                  title: "Bientôt disponible",
                  description: "La création de groupes sera disponible prochainement"
                });
              }}
            >
              <Users className="w-4 h-4" />
              Créer un groupe
            </Button>
          </div>

          {/* Résultats de recherche */}
          <ScrollArea className="max-h-60">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Recherche en cours...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "Aucun utilisateur trouvé" : "Tapez pour rechercher un utilisateur"}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/5 cursor-pointer transition-colors"
                    onClick={() => startPrivateConversation(user.user_id, user.first_name || 'Utilisateur', user.last_name || '')}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {(user.first_name || 'U').charAt(0).toUpperCase()}{(user.last_name || '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {user.first_name || 'Utilisateur'} {user.last_name || ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Démarrer une conversation
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={creating}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};