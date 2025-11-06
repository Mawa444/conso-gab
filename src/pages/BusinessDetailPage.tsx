import { useState, useEffect } from "react";
import { ArrowLeft, Star, MapPin, Phone, Clock, Share, Heart, ThumbsUp, ThumbsDown, MessageCircle, Navigation, ExternalLink, Users, Award, Camera, Settings, Store, Bell, Shield, Headphones, FileText, HelpCircle, LogOut, Trash2, History, Moon, BarChart, Target, MessageSquare, AlertTriangle, Megaphone } from "lucide-react";
import { BusinessImageViewModal } from "@/components/business/BusinessImageViewModal";
import { BusinessProfileEditor } from "@/components/business/BusinessProfileEditor";
import { useBusinessImageLikes } from "@/hooks/use-business-image-likes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessCatalogView } from "@/components/business/BusinessCatalogView";
import { ProfessionalDashboard } from "@/components/professional/ProfessionalDashboard";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import FavoritesSection from "@/components/profile/FavoritesSection";
import { BusinessToolsSection } from "@/components/business/BusinessToolsSection";
import { DeleteBusinessModal } from "@/components/business/DeleteBusinessModal";
import { ActivityLog } from "@/components/business/ActivityLog";
import { SleepModeToggle } from "@/components/business/SleepModeToggle";
import { ReviewReplySection } from "@/components/reviews/ReviewReplySection";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProfileMode } from "@/hooks/use-profile-mode";
import { useAuthCleanup } from "@/hooks/use-auth-cleanup";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProfileModeSwitch } from "@/components/profile/ProfileModeSwitch";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { ProfilePageSkeleton } from "@/components/ui/skeleton-screens";
import { ChatWindow } from "@/components/mimo-chat/ChatWindow";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { useStartConversation } from "@/hooks/use-start-conversation";
import { CarouselImagesManager } from "@/components/business/CarouselImagesManager";
import { AdvertisingDashboard } from "@/components/business/AdvertisingDashboard";
interface BusinessDetail {
  id: string;
  name: string;
  type: string;
  owner: string;
  address: string;
  rating: number;
  verified: boolean;
  employees: string[];
  image?: string;
  distance?: string;
  reviewCount: number;
  phone: string;
  whatsapp?: string;
  website?: string;
  email?: string;
  description: string;
  openingHours: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  certifications: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}
const defaultBusiness: BusinessDetail = {
  id: "",
  name: "",
  type: "",
  owner: "",
  address: "",
  rating: 4.5,
  verified: false,
  employees: [],
  reviewCount: 0,
  phone: "",
  whatsapp: "",
  website: "",
  email: "",
  description: "",
  openingHours: "Lundi à Vendredi : 8h00 - 18h00",
  socialMedia: {},
  certifications: [],
  coordinates: {
    lat: 0.4162,
    lng: 9.4673
  }
};
const reviews: any[] = [];
const images = ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400&text=Intérieur", "/placeholder.svg?height=300&width=400&text=Équipe", "/placeholder.svg?height=300&width=400&text=Spécialités"];
export const BusinessDetailPage = () => {
  const navigate = useNavigate();
  const {
    businessId
  } = useParams<{
    businessId: string;
  }>();
  const {
    user
  } = useAuth();
  const {
    canAccessBusinessPro
  } = useProfileMode();
  const [isLoading, setIsLoading] = useState(true);
  const {
    secureSignOut
  } = useAuthCleanup();
  const { startBusinessConversation } = useStartConversation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("catalog");
  const [proSubTab, setProSubTab] = useState("dashboard");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessData, setBusinessData] = useState({
    isSleeping: false,
    isScheduledForDeletion: false,
    deletionDate: null as string | null
  });
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    type: 'logo' | 'cover';
    title: string;
  } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [logoUploadDate, setLogoUploadDate] = useState<string | null>(null);
  const [coverUploadDate, setCoverUploadDate] = useState<string | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  // Vérifier si l'utilisateur peut accéder à l'onglet Pro
  const canAccessPro = businessId ? canAccessBusinessPro(businessId) : false;

  // Hooks pour les likes des images
  const logoLikes = useBusinessImageLikes(businessId || '', 'logo');
  const coverLikes = useBusinessImageLikes(businessId || '', 'cover');
  useEffect(() => {
    fetchBusinessData();
  }, [businessId, user]);
  const fetchBusinessData = async () => {
    if (!user || !businessId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.from('business_profiles').select('id, business_name, business_category, address, phone, whatsapp, website, email, description, is_sleeping, deactivation_scheduled_at, is_deactivated, logo_url, cover_image_url, logo_updated_at, cover_updated_at, carousel_images').eq('id', businessId).single();
      if (error) {
        console.error('Erreur lors du chargement du profil business:', error);
        toast.error("Impossible de charger le profil business");
        setIsLoading(false);
        return;
      }
      if (data) {
        // Créer l'objet business avec les vraies données de la DB
        setBusiness({
          ...defaultBusiness,
          id: data.id,
          name: data.business_name || 'Commerce sans nom',
          type: data.business_category || 'Activité non spécifiée',
          address: data.address || 'Adresse non renseignée',
          phone: data.phone || '',
          whatsapp: data.whatsapp || undefined,
          website: data.website || undefined,
          email: data.email || undefined,
          description: data.description || 'Aucune description disponible'
        });

        // Mettre à jour l'état d'activité
        setBusinessData({
          isSleeping: data.is_sleeping || false,
          isScheduledForDeletion: !!data.deactivation_scheduled_at,
          deletionDate: data.deactivation_scheduled_at
        });

        // Stocker les URLs des images
        setLogoUrl(data.logo_url || null);
        setCoverUrl(data.cover_image_url || null);
        setLogoUploadDate(data.logo_updated_at || null);
        setCoverUploadDate(data.cover_updated_at || null);
        
        // Charger les images du carrousel
        const carouselData = Array.isArray(data.carousel_images) ? data.carousel_images as string[] : [];
        setCarouselImages(carouselData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };
  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: `Découvrez ${business.name} sur ConsoGab`,
        url: window.location.href
      });
    }
  };
  const handleGetDirections = () => {
    const {
      lat,
      lng
    } = business.coordinates;
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };
  const handleCall = () => {
    window.open(`tel:${business.phone}`, '_self');
  };
  const handleWhatsApp = () => {
    if (business.whatsapp) {
      window.open(`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`, '_blank');
    }
  };
  if (!business) {
    return <ProfilePageSkeleton />;
  }
  return <PageWithSkeleton isLoading={isLoading} skeleton={<ProfilePageSkeleton />}>
      <div className="min-h-screen bg-background">
      {/* Header avec image de couverture */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20 cursor-pointer group" onClick={() => coverUrl && setViewingImage({
        url: coverUrl,
        type: 'cover',
        title: `Couverture de ${business.name}`
      })}>
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            navigate(-1);
          }} className="bg-white/90 hover:bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          
          <ProfileModeSwitch className="bg-white/90 hover:bg-white" />
        </div>

        {/* Image de couverture */}
        <div className="relative w-full h-full overflow-hidden">
          {coverUrl ? <>
              <img src={coverUrl} alt={`Couverture de ${business.name}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <Camera className="w-12 h-12 text-muted-foreground" />
            </div>}
          
          {/* Like button pour la couverture */}
          {coverUrl && <div className="absolute bottom-4 right-4">
              <button onClick={e => {
              e.stopPropagation();
              coverLikes.toggleLike();
            }} disabled={coverLikes.isLoading} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors", coverLikes.isLiked && "text-red-500")}>
                <Heart className={cn("w-4 h-4", coverLikes.isLiked && "fill-red-500")} />
                <span className="text-sm font-medium text-white">{coverLikes.likesCount}</span>
              </button>
            </div>}
        </div>
      </div>

      <div className="px-4 pb-24">
        {/* Info principale */}
        <div className="bg-card rounded-t-2xl -mt-6 relative z-10 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Logo cliquable */}
              <div className="relative cursor-pointer group" onClick={() => logoUrl && setViewingImage({
                url: logoUrl,
                type: 'logo',
                title: `Logo de ${business.name}`
              })}>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full overflow-hidden flex items-center justify-center border-4 border-background ring-4 ring-background">
                  {logoUrl ? <>
                      <img src={logoUrl} alt={`Logo de ${business.name}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-full" />
                    </> : <span className="text-white font-bold text-xl">{business.name[0]}</span>}
                </div>
                {/* Like button pour le logo */}
                {logoUrl && <button onClick={e => {
                  e.stopPropagation();
                  logoLikes.toggleLike();
                }} disabled={logoLikes.isLoading} className={cn("absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors border border-border text-xs", logoLikes.isLiked && "text-red-500 border-red-500")}>
                    <Heart className={cn("w-3 h-3", logoLikes.isLiked && "fill-red-500")} />
                    <span className="font-medium">{logoLikes.likesCount}</span>
                  </button>}
              </div>
              <div>
                <h1 className="font-bold text-xl">{business.name}</h1>
                <p className="text-muted-foreground">{business.type}</p>
                {/* Bouton S'abonner */}
                <Button className="mt-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  S'abonner à ce commerce
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)} className="p-2">
              <Heart className={cn("w-5 h-5", isFavorite ? "fill-red-500 text-red-500" : "")} />
            </Button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                <span className="font-semibold bg-inherit">{business.rating}</span>
                <span className="text-sm text-muted-foreground bg-[009e5e] bg-[#009e5e]/[0.97]">({business.reviewCount} avis)</span>
              </div>
              {business.verified && <Badge variant="outline" className="text-xs border-[hsl(var(--gaboma-green))] text-[hsl(var(--gaboma-green))]">
                  <Award className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>}
            </div>
            <Badge className="bg-gradient-to-r from-primary to-accent text-white">
              Top 3 de la semaine
            </Badge>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className={cn("p-2 h-10 w-10", isLiked && "bg-[hsl(var(--gaboma-blue))] text-white")} onClick={handleLike}>
                <ThumbsUp className={cn("w-4 h-4", isLiked ? "fill-current" : "")} />
              </Button>
              
              <Button variant="ghost" size="sm" className={cn("p-2 h-10 w-10", isDisliked && "bg-[hsl(var(--gaboma-yellow))] text-black")} onClick={handleDislike}>
                <ThumbsDown className={cn("w-4 h-4", isDisliked ? "fill-current" : "")} />
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2 h-10 w-10" onClick={handleShare}>
                <Share className="w-4 h-4" />
              </Button>
            </div>
            
            <Button onClick={() => businessId && startBusinessConversation(businessId)} className="bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90 px-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter
            </Button>
          </div>

          {/* Actions de contact */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="outline" onClick={handleGetDirections} className="flex items-center justify-center gap-2">
              <Navigation className="w-4 h-4" />
              Itinéraire
            </Button>
            <Button onClick={handleCall} className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90">
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
          </div>
        </div>

        {/* Tabs de contenu */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${canAccessPro ? 'grid-cols-6' : 'grid-cols-5'}`}>
              <TabsTrigger value="catalog" className="text-xs">
                Catalogues
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs">Infos</TabsTrigger>
              <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">Avis</TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs">Favoris</TabsTrigger>
              {canAccessPro && <TabsTrigger value="pro" className="text-xs">Pro</TabsTrigger>}
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              {/* Informations détaillées */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{business.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{business.openingHours}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{business.phone}</span>
                  </div>

                  {business.website && <div className="flex items-center gap-2 text-muted-foreground">
                      <ExternalLink className="w-4 h-4" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Site web
                      </a>
                    </div>}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">À propos</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {business.description}
                  </p>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {business.certifications.map((cert, index) => <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>)}
                  </div>
                </CardContent>
              </Card>

              {/* Réseaux sociaux */}
              {(business.socialMedia.facebook || business.socialMedia.instagram || business.socialMedia.telegram) && <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Suivez-nous</h3>
                    <div className="space-y-2">
                      {business.socialMedia.facebook && <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          📘 Facebook
                        </a>}
                      {business.socialMedia.instagram && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          📷 {business.socialMedia.instagram}
                        </div>}
                      {business.socialMedia.telegram && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          📱 {business.socialMedia.telegram}
                        </div>}
                    </div>
                  </CardContent>
                </Card>}
            </TabsContent>

            <TabsContent value="catalog" className="mt-6">
              <BusinessCatalogView businessId={businessId || business.id} businessName={business.name} />
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <MessagingProvider>
                    <ChatWindow conversationId={businessId || business.id} />
                  </MessagingProvider>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-6">
              {reviews.map(review => <ReviewReplySection key={review.id} review={review} businessId={business.id} businessName={business.name} />)}
            </TabsContent>


            <TabsContent value="favorites" className="mt-6">
              <FavoritesSection />
            </TabsContent>

            <TabsContent value="pro" className="mt-6">
              <div className="space-y-6">
                {/* Alerte suppression programmée */}
                {businessData.isScheduledForDeletion && businessData.deletionDate && <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-800 mb-1">
                            Suppression programmée
                          </h3>
                          <p className="text-sm text-red-700 mb-3">
                            Votre entreprise sera supprimée définitivement le {new Date(businessData.deletionDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          </p>
                          <Button size="sm" variant="outline" className="border-red-600 text-red-600 hover:bg-red-100" onClick={async () => {
                          try {
                            await supabase.rpc('cancel_business_deletion', {
                              business_profile_id: business.id
                            });
                            toast.success("Suppression annulée");
                            fetchBusinessData();
                          } catch (error) {
                            toast.error("Erreur lors de l'annulation");
                          }
                        }}>
                            Annuler la suppression
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>}

                {/* Sous-onglets Pro */}
                <Tabs value={proSubTab} onValueChange={setProSubTab}>
                  <div className="space-y-2">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="dashboard" className="text-xs">Tableau</TabsTrigger>
                      <TabsTrigger value="tools" className="text-xs">Outils</TabsTrigger>
                      <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                      <TabsTrigger value="activity" className="text-xs">Journal</TabsTrigger>
                      <TabsTrigger value="settings" className="text-xs">Paramètres</TabsTrigger>
                    </TabsList>
                    
                    <TabsList className="grid w-full grid-cols-1">
                      <TabsTrigger value="advertising" className="text-xs">
                        <Megaphone className="w-4 h-4 mr-2" />
                        Publicité
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="dashboard" className="space-y-6 mt-6">
                    <ProfessionalDashboard businessId={business.id} businessName={business.name} businessCategory={business.type} userType="owner" />
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-6 mt-6">
                    <BusinessToolsSection businessName={business.name} />
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart className="w-5 h-5" />
                            Vues du profil
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary mb-2">1,247</div>
                          <p className="text-sm text-muted-foreground">+12% ce mois</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Taux de conversion
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600 mb-2">23.4%</div>
                          <p className="text-sm text-muted-foreground">+5.2% ce mois</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-6 mt-6">
                    <ActivityLog />
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6 mt-6">
                    {/* Mode Sommeil */}
                    <SleepModeToggle businessId={business.id} businessName={business.name} currentSleepState={businessData.isSleeping} onStateChange={newState => {
                      setBusinessData(prev => ({
                        ...prev,
                        isSleeping: newState
                      }));
                    }} />

                    {/* Gestion du profil */}
                    <BusinessProfileEditor businessId={business.id} />

                    {/* Support Business */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Support Professionnel</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <Headphones className="w-4 h-4 mr-2" />
                          Support prioritaire
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Documentation business
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Formation & conseils
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Zone Danger */}
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-red-600">Zone dangereuse</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteModal(true)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer l'entreprise
                        </Button>
                        <Button variant="destructive" className="w-full justify-start" onClick={secureSignOut}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Se déconnecter
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="advertising" className="space-y-6 mt-6">
                    <AdvertisingDashboard
                      businessId={business.id}
                      businessName={business.name}
                      currentImages={carouselImages}
                      onImagesUpdate={(images) => {
                        setCarouselImages(images);
                      }}
                      businessData={businessData}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* Image View Modal */}
      {viewingImage && <BusinessImageViewModal open={true} onClose={() => setViewingImage(null)} imageUrl={viewingImage.url} imageType={viewingImage.type} businessId={businessId!} imageTitle={viewingImage.title} uploadDate={viewingImage.type === 'logo' ? logoUploadDate : coverUploadDate} />}

      {/* Modal de suppression */}
      <DeleteBusinessModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} businessId={business.id} businessName={business.name} onDeleteScheduled={fetchBusinessData} />

      {/* Navigation en bas */}
      <BottomNavigation activeTab="business" onTabChange={tab => {
        if (tab === "home") navigate("/consumer/home");else if (tab === "map") navigate("/consumer/map");else if (tab === "rankings") navigate("/consumer/rankings");else if (tab === "profile") navigate("/consumer/profile");else if (tab === "scanner") {
          // Scanner functionality - could open a global modal
        }
      }} />
      </div>
    </PageWithSkeleton>;
};