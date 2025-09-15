
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Send,
  Heart,
  Share2,
  Flag,
  Truck,
  Percent,
  Package,
  Store
} from 'lucide-react';
import { BusinessVitrineTab } from '@/components/business/BusinessVitrineTab';
import { MessageSheet } from '@/components/commerce/MessageSheet';
import { AdvancedMessagingModal } from '@/components/messaging/AdvancedMessagingModal';
import { useCatalogComments, useCatalogLikes, useCatalogImageComments, useCatalogImageLikes } from '@/hooks/use-catalog-interactions';
import { useCatalogFavorites, useCatalogShares } from '@/hooks/use-catalog-favorites';
import { supabase } from '@/integrations/supabase/client';

interface Catalog {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  catalog_type: 'products' | 'services';
  images?: any[];
  cover_url?: string;
  cover_image_url?: string;
  business_id: string;
  geo_city?: string;
  geo_district?: string;
  keywords?: string[];
  on_sale?: boolean;
  sale_percentage?: number;
  delivery_available?: boolean;
  delivery_zones?: string[];
  delivery_cost?: number;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  business_hours?: any;
  businessName?: string;
}

interface CatalogInteractionModalProps {
  catalog: Catalog;
  open: boolean;
  onClose: () => void;
}

export const CatalogInteractionModal = ({ catalog, open, onClose }: CatalogInteractionModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newImageComment, setNewImageComment] = useState('');
  const [selectedImageForComment, setSelectedImageForComment] = useState<string | null>(null);
  const [commentRating, setCommentRating] = useState(5);
  const [messageSheetOpen, setMessageSheetOpen] = useState(false);
  const [showAdvancedMessaging, setShowAdvancedMessaging] = useState(false);
  
  // Hooks pour les interactions
  const { comments, addComment, isAdding } = useCatalogComments(catalog.id);
  const { likesCount, isLiked, toggleLike, isToggling } = useCatalogLikes(catalog.id);
  
  // Get current user for favorites
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);
  
  const { isFavorited, toggleFavorite, isToggling: isTogglingFavorite } = useCatalogFavorites(currentUser?.id);
  const { shareCatalog } = useCatalogShares();
  
  const images = catalog.images || [];
  const selectedImage = images[selectedImageIndex];
  
  // Hooks pour les interactions sur l'image sélectionnée
  const { 
    likesCount: imageLikesCount, 
    isLiked: isImageLiked, 
    toggleLike: toggleImageLike 
  } = useCatalogImageLikes(catalog.id, selectedImage?.url || '');
  
  const { 
    comments: imageComments, 
    addComment: addImageComment 
  } = useCatalogImageComments(catalog.id, selectedImage?.url || '');

  const handleSendComment = () => {
    if (newComment.trim()) {
      addComment({ comment: newComment, rating: commentRating });
      setNewComment('');
      setCommentRating(5);
    }
  };

  const handleSendImageComment = () => {
    if (newImageComment.trim() && selectedImageForComment) {
      addImageComment({ comment: newImageComment });
      setNewImageComment('');
      setSelectedImageForComment(null);
    }
  };

  const handleSendMessage = () => {
    setMessageSheetOpen(true);
  };

  const formatBusinessHours = (hours: any) => {
    if (!hours) return [];
    
    const dayNames = {
      monday: 'Lundi',
      tuesday: 'Mardi', 
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    };
    
    return Object.entries(hours).map(([day, info]: [string, any]) => ({
      day: dayNames[day as keyof typeof dayNames],
      ...info
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-[90vh] overflow-hidden">
          {/* Colonne gauche - Images */}
          <div className="relative bg-black">
            {images.length > 0 && selectedImage ? (
              <img 
                src={selectedImage.url} 
                alt={catalog.name}
                className="w-full h-full object-cover"
              />
            ) : catalog.cover_image_url || catalog.cover_url ? (
              <img 
                src={catalog.cover_image_url || catalog.cover_url} 
                alt={catalog.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                {catalog.catalog_type === 'products' ? (
                  <Package className="w-16 h-16 text-muted-foreground" />
                ) : (
                  <Store className="w-16 h-16 text-muted-foreground" />
                )}
                <span className="text-muted-foreground ml-2">Aucune image</span>
              </div>
            )}
            
            {/* Carousel avec swipe et plein écran */}
            {images.length > 1 && (
              <div className="absolute inset-0">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full h-full"
                  setApi={(api) => {
                    if (api) {
                      api.on('select', () => {
                        setSelectedImageIndex(api.selectedScrollSnap());
                      });
                    }
                  }}
                >
                  <CarouselContent className="-ml-0">
                    {images.map((image, index) => (
                      <CarouselItem key={index} className="pl-0">
                        <img
                          src={image.url}
                          alt={catalog.name}
                          className="catalog-image-fullscreen w-full h-full object-contain cursor-pointer"
                          onClick={() => {
                            // Mode plein écran au clic
                            const fullscreenElement = document.querySelector('.catalog-image-fullscreen');
                            if (fullscreenElement) {
                              if (document.fullscreenElement) {
                                document.exitFullscreen();
                              } else {
                                fullscreenElement.requestFullscreen();
                              }
                            }
                          }}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
                
                {/* Indicateurs de pagination */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions sur l'image */}
            {selectedImage && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className={`bg-white/90 hover:bg-white ${isImageLiked ? 'text-red-600' : ''}`}
                  onClick={() => toggleImageLike()}
                >
                  <Heart className={`w-4 h-4 ${isImageLiked ? 'fill-current' : ''}`} />
                  <span className="ml-1 text-xs">{imageLikesCount}</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/90 hover:bg-white"
                  onClick={() => setSelectedImageForComment(selectedImage?.url || null)}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="ml-1 text-xs">{imageComments.length}</span>
                </Button>
              </div>
            )}

            {/* Badges informatifs */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {catalog.catalog_type === 'services' && (
                <Badge className="bg-blue-500/90 text-white">
                  <Store className="w-3 h-3 mr-1" />
                  Services
                </Badge>
              )}
              {catalog.on_sale && catalog.sale_percentage && catalog.sale_percentage > 0 && (
                <Badge className="bg-red-500/90 text-white">
                  <Percent className="w-3 h-3 mr-1" />
                  -{catalog.sale_percentage}%
                </Badge>
              )}
              {catalog.delivery_available && (
                <Badge className="bg-green-500/90 text-white">
                  <Truck className="w-3 h-3 mr-1" />
                  Livraison
                </Badge>
              )}
            </div>
          </div>

          {/* Colonne droite - Informations et interactions */}
          <div className="flex flex-col h-full">
            <DialogHeader className="p-4 border-b flex-shrink-0">
              <DialogTitle className="text-xl flex items-center gap-2">
                {catalog.catalog_type === 'products' ? (
                  <Package className="w-5 h-5" />
                ) : (
                  <Store className="w-5 h-5" />
                )}
                {catalog.name}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{catalog.category}</span>
                {catalog.subcategory && (
                  <>
                    <span>•</span>
                    <span>{catalog.subcategory}</span>
                  </>
                )}
                {catalog.geo_city && (
                  <>
                    <span>•</span>
                    <span>{catalog.geo_city}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {likesCount} j'aime
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length} commentaires
                </span>
              </div>
            </DialogHeader>

            {/* Contenu principal avec scroll */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-3 mx-4 mt-2 flex-shrink-0">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="comments">Commentaires</TabsTrigger>
                  <TabsTrigger value="vitrine">Vitrine</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="flex-1 overflow-hidden mx-4 mt-2">
                  {/* Zone de scroll avec contour visible */}
                  <div className="h-full border-2 border-border/50 rounded-lg overflow-hidden">
                    <ScrollArea className="h-full px-4 py-4">
                      {catalog.description && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{catalog.description}</p>
                        </div>
                      )}

                      {catalog.delivery_available && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Livraison disponible
                          </h4>
                          <div className="space-y-2 text-sm">
                            {catalog.delivery_zones && catalog.delivery_zones.length > 0 && (
                              <div>
                                <strong>Zones:</strong> {catalog.delivery_zones.join(', ')}
                              </div>
                            )}
                            {catalog.delivery_cost && catalog.delivery_cost > 0 && (
                              <div>
                                <strong>Coût:</strong> {catalog.delivery_cost.toLocaleString()} FCFA
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {catalog.keywords && catalog.keywords.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Mots-clés</h4>
                          <div className="flex flex-wrap gap-2">
                            {catalog.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Horaires d'ouverture */}
                      {catalog.business_hours && (
                        <div className="mb-6">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Horaires d'ouverture
                          </h4>
                          <div className="space-y-2 text-sm bg-muted/30 p-4 rounded-lg">
                            {formatBusinessHours(catalog.business_hours).map((day, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="font-medium">{day.day}:</span>
                                <span className="text-muted-foreground">
                                  {day.closed ? 'Fermé' : `${day.open} - ${day.close}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="flex-1 overflow-hidden mx-4 mt-2">
                  <div className="h-full border-2 border-border/50 rounded-lg overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 px-4 py-4">
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-medium text-sm">Utilisateur</div>
                                  {comment.rating && (
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`w-3 h-3 ${i < comment.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm">{comment.comment}</div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(comment.created_at).toLocaleString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="border-t border-border p-4 space-y-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Note:</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCommentRating(i + 1)}
                              className="focus:outline-none"
                            >
                              <Star 
                                className={`w-4 h-4 ${i < commentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Textarea 
                          placeholder="Ajouter un commentaire..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button onClick={handleSendComment} disabled={isAdding} className="self-end">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vitrine" className="flex-1 overflow-hidden mx-4 mt-2">
                  <div className="h-full border-2 border-border/50 rounded-lg overflow-hidden">
                    <div className="h-full overflow-y-auto px-4 py-4">
                      <BusinessVitrineTab businessId={catalog.business_id} businessName={catalog.businessName || 'Commerce'} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Section Contact fixe en bas - HORS de la zone de scroll */}
            <div className="flex-shrink-0 space-y-3 px-4 py-4 bg-background border-t-2 border-border">
              <h4 className="font-medium mb-3">Contact</h4>
              
              {/* Adaptive layout based on number of available contact methods */}
              <div className="space-y-2">
                {/* WhatsApp and Call buttons row (if any available) */}
                {(catalog.contact_whatsapp || catalog.contact_phone) && (
                  <div className={`grid gap-2 ${
                    catalog.contact_whatsapp && catalog.contact_phone 
                      ? 'grid-cols-2' 
                      : 'grid-cols-1'
                  }`}>
                    {catalog.contact_whatsapp && (
                      <Button 
                        onClick={() => window.open(`https://wa.me/${catalog.contact_whatsapp}`, '_blank')}
                        className="bg-[hsl(var(--gaboma-green))] hover:bg-[hsl(var(--gaboma-green))]/90 text-white flex items-center gap-2 h-12"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                    )}
                    {catalog.contact_phone && (
                      <Button 
                        onClick={() => window.open(`tel:${catalog.contact_phone}`, '_blank')}
                        className="bg-[hsl(var(--gaboma-blue))] hover:bg-[hsl(var(--gaboma-blue))]/90 text-white flex items-center gap-2 h-12"
                      >
                        <Phone className="w-4 h-4" />
                        Appeler
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Advanced messaging button - Always present */}
                <Button 
                  onClick={() => setShowAdvancedMessaging(true)}
                  className="w-full bg-[hsl(var(--gaboma-yellow))] hover:bg-[hsl(var(--gaboma-yellow))]/90 text-black font-medium h-14"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messagerie • Rendez-vous • Devis • Géolocalisation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal pour commenter une image */}
        {selectedImageForComment && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-4 rounded-lg max-w-md w-full mx-4">
              <h3 className="font-medium mb-3">Commenter cette image</h3>
              <Textarea 
                placeholder="Votre commentaire..."
                value={newImageComment}
                onChange={(e) => setNewImageComment(e.target.value)}
                className="mb-3"
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedImageForComment(null);
                    setNewImageComment('');
                  }}
                >
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSendImageComment}>
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MessageSheet pour la messagerie interne */}
        <MessageSheet
          open={messageSheetOpen}
          onClose={() => setMessageSheetOpen(false)}
          commerce={{
            id: catalog.business_id,
            name: catalog.businessName || catalog.name,
            type: catalog.catalog_type,
            owner: 'Business Owner',
            category: catalog.category,
            subcategory: catalog.subcategory
          }}
        />

        {/* Advanced Messaging Modal */}
        <AdvancedMessagingModal
          open={showAdvancedMessaging}
          onClose={() => setShowAdvancedMessaging(false)}
          catalog={catalog}
        />
      </DialogContent>
    </Dialog>
  );
};