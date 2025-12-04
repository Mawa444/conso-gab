import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Edit2, Check, X, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface ReviewReply {
  id: string;
  reply_text: string;
  created_at: string;
  updated_at: string;
}

interface ReviewReplySectionProps {
  review: Review;
  businessId: string;
  businessName: string;
}

export const ReviewReplySection = ({ review, businessId, businessName }: ReviewReplySectionProps) => {
  const [reply, setReply] = useState<ReviewReply | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReply();
  }, [review.id]);

  const fetchReply = async () => {
    try {
      const { data, error } = await supabase
        .from('review_replies')
        .select('*')
        .eq('review_id', review.id)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors du chargement de la réponse:', error);
        return;
      }

      if (data) {
        setReply(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error("Veuillez saisir une réponse");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('review_replies')
        .insert({
          review_id: review.id,
          business_id: businessId,
          reply_text: replyText.trim()
        })
        .select()
        .single();

      if (error) {
        toast.error("Erreur lors de l'envoi de la réponse");
        return;
      }

      // Logger l'activité
      await supabase.rpc('log_user_activity', {
        action_type_param: 'REVIEW_REPLIED',
        action_description_param: `Réponse à un avis de ${review.user}`,
        business_id_param: businessId,
        metadata_param: {
          review_id: review.id,
          reviewer: review.user,
          rating: review.rating,
          business_name: businessName
        }
      });

      setReply(data);
      setReplyText("");
      setIsReplying(false);
      toast.success("Réponse publiée avec succès");
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReply = async () => {
    if (!replyText.trim() || !reply) {
      toast.error("Veuillez saisir une réponse");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('review_replies')
        .update({ reply_text: replyText.trim() })
        .eq('id', reply.id)
        .select()
        .single();

      if (error) {
        toast.error("Erreur lors de la modification");
        return;
      }

      // Logger l'activité
      await supabase.rpc('log_user_activity', {
        action_type_param: 'REVIEW_REPLY_UPDATED',
        action_description_param: `Modification d'une réponse à l'avis de ${review.user}`,
        business_id_param: businessId,
        metadata_param: {
          review_id: review.id,
          reviewer: review.user,
          reply_id: reply.id
        }
      });

      setReply(data);
      setIsEditing(false);
      toast.success("Réponse modifiée avec succès");
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    setReplyText(reply?.reply_text || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setReplyText("");
    setIsEditing(false);
    setIsReplying(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Avis original */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white font-semibold">
              {review.user[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{review.user}</p>
                {review.verified && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                    Vérifié
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < review.rating 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{review.date}</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>

        {/* Réponse existante */}
        {reply && !isEditing && (
          <>
            <Separator className="mb-4" />
            <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {businessName}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(reply.created_at)}
                    {reply.updated_at !== reply.created_at && " (modifié)"}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditing}
                  className="h-6 px-2 text-xs"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Modifier
                </Button>
              </div>
              <p className="text-sm">{reply.reply_text}</p>
            </div>
          </>
        )}

        {/* Formulaire de réponse/modification */}
        {(isReplying || isEditing) && (
          <>
            <Separator className="mb-4" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {isEditing ? "Modifier votre réponse" : "Répondre à cet avis"}
                </span>
              </div>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Écrivez votre réponse professionnelle..."
                className="min-h-[80px] border-blue-200 focus:border-blue-400"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {replyText.length}/500 caractères
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={isEditing ? handleUpdateReply : handleSubmitReply}
                    disabled={isLoading || !replyText.trim()}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                    ) : isEditing ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    {isEditing ? "Modifier" : "Répondre"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bouton pour commencer à répondre */}
        {!reply && !isReplying && (
          <>
            <Separator className="mb-4" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsReplying(true)}
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Répondre à cet avis
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
