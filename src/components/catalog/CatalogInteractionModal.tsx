import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CatalogInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: {
    id: string;
    name: string;
    description: string;
    images: string[];
    business: {
      id: string;
      name: string;
      avatar?: string;
    };
    stats: {
      likes: number;
      comments: number;
      views: number;
    };
  };
}

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
  imageIndex?: number;
}

export const CatalogInteractionModal = ({ isOpen, onClose, catalog }: CatalogInteractionModalProps) => {
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(catalog.stats.likes);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: { name: 'Marie Dupont', avatar: '/placeholder.svg' },
      text: 'Magnifique collection ! J\'adore les couleurs.',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      user: { name: 'Jean Martin' },
      text: 'Très belle présentation, bravo !',
      createdAt: '2024-01-15T09:15:00Z'
    }
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedImageComments, setSelectedImageComments] = useState<Comment[]>([
    {
      id: '3',
      user: { name: 'Sophie Leblanc' },
      text: 'Ce produit est exactement ce que je cherche !',
      createdAt: '2024-01-15T11:00:00Z',
      imageIndex: 0
    }
  ]);
  const [newImageComment, setNewImageComment] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast({
      title: isLiked ? "Like retiré" : "Catalogue liké !",
      description: isLiked ? "Vous n'aimez plus ce catalogue" : "Merci pour votre soutien"
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: { name: 'Vous' },
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
    toast({ title: "Commentaire ajouté !" });
  };

  const handleAddImageComment = () => {
    if (!newImageComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: { name: 'Vous' },
      text: newImageComment.trim(),
      createdAt: new Date().toISOString(),
      imageIndex: currentImageIndex
    };
    
    setSelectedImageComments([comment, ...selectedImageComments]);
    setNewImageComment('');
    toast({ title: "Commentaire sur l'image ajouté !" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    toast({
      title: "Message envoyé !",
      description: `Votre message a été envoyé à ${catalog.business.name}`
    });
    setNewMessage('');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % catalog.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + catalog.images.length) % catalog.images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={catalog.business.avatar} />
              <AvatarFallback>
                {catalog.business.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold">{catalog.name}</h3>
              <p className="text-sm text-muted-foreground">{catalog.business.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section images */}
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden">
                <img
                  src={catalog.images[currentImageIndex]}
                  alt={`${catalog.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {catalog.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Pagination dots */}
              <div className="flex justify-center mt-3 gap-2">
                {catalog.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {comments.length}
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="w-5 h-5 mr-2" />
                  {catalog.stats.views}
                </Button>
              </div>
              <Button variant="ghost" size="sm">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed">{catalog.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Section interactions */}
          <div className="space-y-4">
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comments">Commentaires</TabsTrigger>
                <TabsTrigger value="image-comments">Sur l'image</TabsTrigger>
                <TabsTrigger value="message">Message</TabsTrigger>
              </TabsList>

              {/* Commentaires généraux */}
              <TabsContent value="comments" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button onClick={handleAddComment} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.user.avatar} />
                          <AvatarFallback>
                            {comment.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Commentaires sur l'image actuelle */}
              <TabsContent value="image-comments" className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Commentaires sur l'image {currentImageIndex + 1}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Commenter cette image..."
                      value={newImageComment}
                      onChange={(e) => setNewImageComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddImageComment()}
                    />
                    <Button onClick={handleAddImageComment} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {selectedImageComments
                      .filter(c => c.imageIndex === currentImageIndex)
                      .map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user.avatar} />
                            <AvatarFallback>
                              {comment.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{comment.user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>

              {/* Message privé */}
              <TabsContent value="message" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Envoyer un message privé à {catalog.business.name}
                  </div>
                  
                  <Textarea
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                  />
                  
                  <Button onClick={handleSendMessage} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </Button>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    Votre message sera envoyé directement au propriétaire du catalogue
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};