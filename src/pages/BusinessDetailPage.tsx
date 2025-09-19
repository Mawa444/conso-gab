import { useState, useEffect } from "react";
import { ArrowLeft, Star, MapPin, Phone, Clock, Share, Heart, ThumbsUp, ThumbsDown, MessageCircle, Navigation, ExternalLink, Users, Award, Camera, Settings, Store, Bell, Shield, Headphones, FileText, HelpCircle, LogOut, Trash2, History, Moon, BarChart, Target, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessCatalogView } from "@/components/business/BusinessCatalogView";
import { ProfessionalDashboard } from "@/components/professional/ProfessionalDashboard";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { FavoritesSection } from "@/components/profile/FavoritesSection";
import { BusinessToolsSection } from "@/components/business/BusinessToolsSection";
import { DeleteBusinessModal } from "@/components/business/DeleteBusinessModal";
import { ActivityLog } from "@/components/business/ActivityLog";
import { SleepModeToggle } from "@/components/business/SleepModeToggle";
import { ReviewReplySection } from "@/components/reviews/ReviewReplySection";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthCleanup } from "@/hooks/use-auth-cleanup";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProfileModeSwitch } from "@/components/profile/ProfileModeSwitch";

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

// Données d'exemple - en réalité elles viendraient de l'API
const mockBusiness: BusinessDetail = {  
  id: "business_001",
  name: "Restaurant Chez Tonton",
  type: "Restaurant Gabonais",
  owner: "Paul Mba",
  address: "Quartier Nombakélé, Libreville",
  rating: 4.8,
  verified: true,
  employees: ["Marie Nzé", "Jean Obiang", "Sophie Mbourou", "Alain Ekomi"],
  reviewCount: 127,
  phone: "+241 01 23 45 67",
  whatsapp: "+241 01 23 45 67",
  website: "https://restaurantcheztonton.ga",
  email: "contact@cheztonton.ga",
  description: "Restaurant familial proposant une cuisine gabonaise authentique depuis 15 ans. Spécialisé dans les plats traditionnels préparés avec des ingrédients locaux de qualité. Ambiance chaleureuse et service personnalisé pour vous faire découvrir les saveurs du Gabon.",
  openingHours: "Lundi à Samedi : 8h00 - 22h00 • Dimanche : 10h00 - 20h00",
  socialMedia: {
    facebook: "https://facebook.com/cheztonton",
    instagram: "@cheztonton_libreville",
    telegram: "@CheZtontonRestaurant"
  },
  certifications: ["Certification Hygiène", "Label Qualité Gaboma", "Commerce Vérifié"],
  coordinates: {
    lat: 0.4162,
    lng: 9.4673
  }
};

const reviews = [
  { id: "1", user: "Marie K.", rating: 5, comment: "Excellent service, très professionnel ! Les plats sont délicieux et l'accueil est parfait.", date: "Il y a 2 jours", verified: true },
  { id: "2", user: "Jean P.", rating: 4, comment: "Bonne qualité, je recommande. L'ambiance est agréable et les prix corrects.", date: "Il y a 1 semaine", verified: false },
  { id: "3", user: "Sarah M.", rating: 5, comment: "Toujours satisfaite de mes visites ici. Le poulet au nyembwe est exceptionnel !", date: "Il y a 2 semaines", verified: true },
  { id: "4", user: "Alain T.", rating: 4, comment: "Service rapide et personnel accueillant. Parfait pour un déjeuner d'affaires.", date: "Il y a 3 semaines", verified: false }
];

const images = [
  "/placeholder.svg?height=300&width=400",
  "/placeholder.svg?height=300&width=400&text=Intérieur",
  "/placeholder.svg?height=300&width=400&text=Équipe",
  "/placeholder.svg?height=300&width=400&text=Spécialités"
];

export const BusinessDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { secureSignOut } = useAuthCleanup();
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

  const [business, setBusiness] = useState<BusinessDetail>(mockBusiness);

  useEffect(() => {
    fetchBusinessData();
  }, [id, user]);

  const fetchBusinessData = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('id, business_name, business_category, address, phone, whatsapp, website, email, description, is_sleeping, deactivation_scheduled_at, is_deactivated')
        .eq('id', id)
        .single();

      if (error || !data) return;

      // Mettre à jour les infos affichées (nom, catégorie, contacts...)
      setBusiness((prev) => ({
        ...prev,
        id: data.id,
        name: data.business_name || prev.name,
        type: (data.business_category as any) || prev.type,
        address: data.address || prev.address,
        phone: data.phone || prev.phone,
        whatsapp: data.whatsapp || undefined,
        website: data.website || undefined,
        email: data.email || undefined,
        description: data.description || prev.description,
      }));

      // Mettre à jour l'état d'activité
      setBusinessData({
        isSleeping: data.is_sleeping || false,
        isScheduledForDeletion: !!data.deactivation_scheduled_at,
        deletionDate: data.deactivation_scheduled_at
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
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
    const { lat, lng } = business.coordinates;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec image */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          
          <ProfileModeSwitch className="bg-white/90 hover:bg-white" />
        </div>

        {/* Galerie photos */}
        <div className="relative w-full h-full overflow-hidden">
          <img 
            src={images[currentImageIndex]} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2 justify-center">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24">
        {/* Info principale */}
        <div className="bg-card rounded-t-2xl -mt-6 relative z-10 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">{business.name[0]}</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">{business.name}</h1>
                <p className="text-muted-foreground">{business.type}</p>
                {/* Bouton S'abonner */}
                <Button
                  className="mt-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  S'abonner à ce commerce
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2"
            >
              <Heart className={cn("w-5 h-5", isFavorite ? "fill-red-500 text-red-500" : "")} />
            </Button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                <span className="font-semibold">{business.rating}</span>
                <span className="text-sm text-muted-foreground">({business.reviewCount} avis)</span>
              </div>
              {business.verified && (
                <Badge variant="outline" className="text-xs border-[hsl(var(--gaboma-green))] text-[hsl(var(--gaboma-green))]">
                  <Award className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              )}
            </div>
            <Badge className="bg-gradient-to-r from-primary to-accent text-white">
              Top 3 de la semaine
            </Badge>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn("p-2 h-10 w-10", isLiked && "bg-[hsl(var(--gaboma-blue))] text-white")}
                onClick={handleLike}
              >
                <ThumbsUp className={cn("w-4 h-4", isLiked ? "fill-current" : "")} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn("p-2 h-10 w-10", isDisliked && "bg-[hsl(var(--gaboma-yellow))] text-black")}
                onClick={handleDislike}
              >
                <ThumbsDown className={cn("w-4 h-4", isDisliked ? "fill-current" : "")} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-10 w-10"
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={() => window.location.href = "/messaging"}
              className="bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90 px-6"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter
            </Button>
          </div>

          {/* Actions de contact */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              onClick={handleGetDirections}
              className="flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Itinéraire
            </Button>
            <Button
              onClick={handleCall}
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
          </div>
        </div>

        {/* Tabs de contenu */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="catalog" className="text-xs">
                Catalogues
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs">Infos</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">Avis</TabsTrigger>
              <TabsTrigger value="favorites" className="text-xs">Favoris</TabsTrigger>
              <TabsTrigger value="pro" className="text-xs">Pro</TabsTrigger>
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

                  {business.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ExternalLink className="w-4 h-4" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Site web
                      </a>
                    </div>
                  )}
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
                    {business.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Réseaux sociaux */}
              {(business.socialMedia.facebook || business.socialMedia.instagram || business.socialMedia.telegram) && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Suivez-nous</h3>
                    <div className="space-y-2">
                      {business.socialMedia.facebook && (
                        <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          📘 Facebook
                        </a>
                      )}
                      {business.socialMedia.instagram && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          📷 {business.socialMedia.instagram}
                        </div>
                      )}
                      {business.socialMedia.telegram && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          📱 {business.socialMedia.telegram}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="catalog" className="mt-6">
              <BusinessCatalogView
                businessId={business.id}
                businessName={business.name}
              />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-6">
              {reviews.map((review) => (
                <ReviewReplySection 
                  key={review.id}
                  review={review}
                  businessId={business.id}
                  businessName={business.name}
                />
              ))}
            </TabsContent>


            <TabsContent value="favorites" className="mt-6">
              <FavoritesSection userType="business" />
            </TabsContent>

            <TabsContent value="pro" className="mt-6">
              <div className="space-y-6">
                {/* Alerte suppression programmée */}
                {businessData.isScheduledForDeletion && businessData.deletionDate && (
                  <Card className="border-red-200 bg-red-50">
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-600 hover:bg-red-100"
                            onClick={async () => {
                              try {
                                await supabase.rpc('cancel_business_deletion', {
                                  business_profile_id: business.id
                                });
                                toast.success("Suppression annulée");
                                fetchBusinessData();
                              } catch (error) {
                                toast.error("Erreur lors de l'annulation");
                              }
                            }}
                          >
                            Annuler la suppression
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sous-onglets Pro */}
                <Tabs value={proSubTab} onValueChange={setProSubTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="dashboard" className="text-xs">Tableau</TabsTrigger>
                    <TabsTrigger value="tools" className="text-xs">Outils</TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                    <TabsTrigger value="activity" className="text-xs">Journal</TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">Paramètres</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="space-y-6 mt-6">
                    <ProfessionalDashboard 
                      businessId={business.id}
                      businessName={business.name}
                      businessCategory={business.type}
                      userType="owner"
                    />
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
                    <SleepModeToggle 
                      businessId={business.id}
                      businessName={business.name}
                      currentSleepState={businessData.isSleeping}
                      onStateChange={(newState) => {
                        setBusinessData(prev => ({ ...prev, isSleeping: newState }));
                      }}
                    />

                    {/* Paramètres Compte */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Store className="w-5 h-5" />
                          Gestion du profil
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Modifier les informations
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Camera className="w-4 h-4 mr-2" />
                          Gérer les photos
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          Sécurité et accès
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Bell className="w-4 h-4 mr-2" />
                          Notifications business
                        </Button>
                      </CardContent>
                    </Card>

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
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer l'entreprise
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start"
                          onClick={secureSignOut}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Se déconnecter
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* Modal de suppression */}
      <DeleteBusinessModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        businessId={business.id}
        businessName={business.name}
        onDeleteScheduled={fetchBusinessData}
      />

      {/* Navigation en bas */}
      <BottomNavigation 
        activeTab="business" 
        onTabChange={(tab) => {
          if (tab === "home") navigate("/consumer/home");
          else if (tab === "map") navigate("/consumer/map");
          else if (tab === "rankings") navigate("/consumer/rankings");
          else if (tab === "profile") navigate("/consumer/profile");
          else if (tab === "scanner") {
            // Scanner functionality - could open a global modal
          }
        }} 
      />
    </div>
  );
};