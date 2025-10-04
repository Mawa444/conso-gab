import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { User, Star, MapPin, Trophy, QrCode, Shield, History, Award, Bell, Filter, TrendingUp, Trash2, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FavoritesSection from "@/components/profile/FavoritesSection";
import { AdvancedBusinessManager } from "@/components/profile/AdvancedBusinessManager";
import { ConsumerProfileSettings } from "@/components/profile/ConsumerProfileSettings";
import { useNavigate } from "react-router-dom";
import { useAuthCleanup } from "@/hooks/use-auth-cleanup";
import { toast } from "sonner";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { ProfilePageSkeleton } from "@/components/ui/skeleton-screens";
interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  userType: string;
  points: number;
  level: string;
  scansCount: number;
  reviewsCount: number;
  favoritesCount: number;
  pseudo: string;
  role: string;
  avatar_url?: string;
  cover_image_url?: string;
}
const recentActivity = [{
  id: "act_001",
  type: "scan",
  commerce: "Boulangerie Chez Mama Nzé",
  date: "Il y a 2h",
  points: "+10 pts"
}, {
  id: "act_002",
  type: "review",
  commerce: "Restaurant Chez Tonton",
  date: "Hier",
  points: "+25 pts"
}, {
  id: "act_003",
  type: "badge",
  badge: "Explorateur",
  date: "Il y a 3 jours",
  points: "+50 pts"
}];
const favoriteCommerces = [{
  id: "fav_001",
  name: "Restaurant Chez Tonton",
  type: "Restaurant",
  rating: 4.9,
  lastVisit: "Il y a 2 jours"
}, {
  id: "fav_002",
  name: "Salon Afrique Beauté",
  type: "Salon de beauté",
  rating: 4.7,
  lastVisit: "La semaine dernière"
}, {
  id: "fav_003",
  name: "Pharmacie du Centre",
  type: "Pharmacie",
  rating: 4.8,
  lastVisit: "Il y a 5 jours"
}];
interface ProfilePageProps {
  onBack?: () => void;
  onSettings?: () => void;
  onProfileUpdated?: () => void; // Nouveau callback pour refresh
}
export const ProfilePage = ({
  onBack,
  onSettings,
  onProfileUpdated
}: ProfilePageProps) => {
  // Récupérer l'onglet depuis l'URL ou utiliser "overview" par défaut
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const [activityFilter, setActivityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const {
    signOut
  } = useAuth();
  const {
    secureSignOut
  } = useAuthCleanup();
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: "Chargement...",
    email: "",
    phone: "",
    joinDate: "",
    userType: "consumer",
    points: 0,
    level: "Débutant",
    scansCount: 0,
    reviewsCount: 0,
    favoritesCount: 0,
    pseudo: "",
    role: ""
  });
  const {
    user
  } = useAuth();
  const fetchUserProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      
      // Récupérer les données du profil depuis la table profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Récupérer les données user_profiles pour compatibilité
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && userProfileError) {
        console.error('Erreur récupération profil:', profileError, userProfileError);
        setIsLoading(false);
        return;
      }

      // Priorité à profileData pour les images et noms
      if (profileData) {
        setUserProfile({
          name: profileData.display_name || profileData.first_name || userProfileData?.pseudo || user.email?.split('@')[0] || "Utilisateur",
          email: user.email || "",
          phone: profileData.phone || userProfileData?.phone || "",
          joinDate: new Date(profileData.created_at || user.created_at).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          }),
          userType: userProfileData?.role === 'merchant' ? 'commerçant' : 'client',
          points: Math.floor(Math.random() * 3000) + 1000,
          level: userProfileData?.role === 'merchant' ? 'Entrepreneur' : 'Ambassador ConsoGab',
          scansCount: Math.floor(Math.random() * 50) + 10,
          reviewsCount: Math.floor(Math.random() * 30) + 5,
          favoritesCount: Math.floor(Math.random() * 20) + 3,
          pseudo: profileData.display_name || userProfileData?.pseudo || "",
          role: userProfileData?.role || "",
          avatar_url: profileData.avatar_url || undefined,
          cover_image_url: profileData.cover_image_url || undefined
        });
      } else if (userProfileData) {
        setUserProfile({
          name: userProfileData.pseudo || user.email?.split('@')[0] || "Utilisateur",
          email: user.email || "",
          phone: userProfileData.phone || "",
          joinDate: new Date(userProfileData.created_at || user.created_at).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          }),
          userType: userProfileData.role === 'merchant' ? 'commerçant' : 'client',
          points: Math.floor(Math.random() * 3000) + 1000,
          level: userProfileData.role === 'merchant' ? 'Entrepreneur' : 'Ambassador ConsoGab',
          scansCount: Math.floor(Math.random() * 50) + 10,
          reviewsCount: Math.floor(Math.random() * 30) + 5,
          favoritesCount: Math.floor(Math.random() * 20) + 3,
          pseudo: userProfileData.pseudo || "",
          role: userProfileData.role || ""
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  // Fonction de refresh après update du profil
  const handleProfileUpdate = () => {
    fetchUserProfile();
  };
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scan":
        return <QrCode className="w-4 h-4 text-primary" />;
      case "review":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "badge":
        return <Award className="w-4 h-4 text-accent" />;
      default:
        return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };
  const handleLogout = async () => {
    try {
      await secureSignOut();
      toast.success("Déconnexion sécurisée réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };
  const handleDeleteAccount = () => {
    toast.error("Fonctionnalité à venir - Suppression de compte");
  };
  return <PageWithSkeleton isLoading={isLoading} skeleton={<ProfilePageSkeleton />}>
      <div className="flex flex-col min-h-full">
      {/* Header Profile style Facebook */}
      <div className="relative">
        {/* Image de couverture */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary via-accent to-secondary relative overflow-hidden">
          {userProfile.cover_image_url ? (
            <img 
              src={userProfile.cover_image_url} 
              alt="Couverture" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-accent/80 to-secondary/80" />
          )}
        </div>

        {/* Conteneur pour photo de profil et infos */}
        <div className="px-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20 gap-4">
            {/* Photo de profil */}
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-muted overflow-hidden shadow-xl">
                {userProfile.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt={userProfile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <User className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Infos utilisateur */}
              <div className="flex-1 pb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{userProfile.name}</h1>
                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{userProfile.level}</Badge>
                  <Badge variant="outline">Membre depuis {userProfile.joinDate}</Badge>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="default" className="gap-2">
                <Bell className="w-4 h-4" />
                S'abonner
              </Button>
              <Button variant="outline" size="icon" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{userProfile.points}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Points ConsoGab</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{userProfile.scansCount}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Scans effectués</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{userProfile.reviewsCount}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Avis publiés</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 p-6 bg-[f2f4f7] bg-[#f2f4f7]/[0.97] px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white px-0 rounded-none">
            <TabsTrigger value="overview" className="rounded-3xl bg-[3a75c4] text-center bg-inherit font-bold text-[#73767a]/[0.96] text-sm">Aperçu</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-3xl font-bold text-[73767a] text-[#73767a]/[0.97]">Activité</TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-3xl font-bold text-[#73767a]/[0.96] text-sm">Favoris</TabsTrigger>
            <TabsTrigger value="businesses" className="rounded-3xl font-bold text-[#73767a]/[0.97] text-sm">Entreprises</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-3xl font-bold text-[73767a] text-[#73767a]/[0.96]">Paramètres</TabsTrigger>
          </TabsList>

          {/* Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            {/* Progression niveau modernisée */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader className="rounded-none bg-[3a75c4] bg-[#3e78c6]">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-bold text-white mx-0 py-0 px-0 my-[10px] text-lg">Progression  Points ConsoGab</CardTitle>
                  <Badge className="text-primary bg-[fcd116] bg-[#fcd116]/[0.96]">Niveau 4</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 rounded-none bg-white my-0">
                <div className="flex justify-between text-sm font-medium">
                  <span className="my-[10px] font-bold text-black/[0.97] text-base">Ambassador ConsoGab</span>
                  <span className="text-primary font-bold my-[9px]">{userProfile.points} / 5000 pts</span>
                </div>
                <div className="w-full rounded-full h-3 overflow-hidden shadow-inner bg-[fcd116] bg-[#fcd116]/[0.96] my-[6px]">
                  <div className="bg-gradient-to-r from-primary via-accent to-secondary h-3 rounded-full transition-all duration-700 relative overflow-hidden" style={{
                    width: `${userProfile.points / 5000 * 100}%`
                  }}>
                    <div className="absolute inset-0 animate-pulse rounded-3xl bg-[009e60] bg-[#009e60]/[0.96]"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">
                    Plus que <span className="font-semibold text-primary">2153 points</span> pour atteindre "Local Hero"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <div className="space-y-3">
              <h3 className="font-semibold">Actions rapides</h3>
              
              {/* Bouton Dashboard Opérateur pour les marchands */}
              {userProfile.role === 'merchant' && <Button onClick={() => window.location.href = '/merchant/dashboard'} className="w-full h-16 bg-gradient-to-r from-primary to-accent text-white mb-4 flex items-center gap-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
                  <Shield className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-lg font-bold">Dashboard Opérateur</div>
                    <div className="text-sm opacity-90">Gérer vos catalogues et commandes</div>
                  </div>
                </Button>}
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="default" className="h-20 flex-col gap-2 rounded-3xl">
                  <QrCode className="w-6 h-6" />
                  <span className="text-sm">Scanner commerce</span>
                </Button>
                <Button variant="default" className="h-20 flex-col gap-2 rounded-3xl">
                  <MapPin className="w-6 h-6" />
                  <span className="text-sm">Commerces proches</span>
                </Button>
                <Button variant="default" className="h-20 flex-col gap-2 rounded-3xl bg-slate-300 hover:bg-slate-200 text-slate-300">
                  <Trophy className="w-6 h-6" />
                  <span className="text-sm rounded-full">Classements</span>
                </Button>
                <Button variant="default" className="h-20 flex-col gap-2 rounded-3xl">
                  <Shield className="w-6 h-6" />
                  <span className="text-sm">Sécurité</span>
                </Button>
              </div>
            </div>

            {/* Notifications */}
            <div className="border border-border/50 p-4 bg-white rounded-3xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[009e60] text-[#009e60]/[0.97]">Notifications</h3>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2 border-l-4 border-primary px-[15px] py-[8px] mx-0 rounded-3xl bg-[009e60] bg-[#009e60]/[0.96]">
                  <Trophy className="w-4 h-4 text-primary mt-1 bg-inherit" />
                  <div className="flex-1">
                    <p className="font-medium text-[fcd116] text-[#fcd116]/[0.97]">Nouveau badge débloqué!</p>
                    <p className="text-xs text-white">Vous avez obtenu "Explorateur"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg border-l-4 border-accent bg-[fcd116] bg-[#fcd116]/[0.96]">
                  <Star className="w-4 h-4 text-accent mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nouveau commerce ajouté</p>
                    <p className="text-xs text-muted-foreground">Près de chez vous</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Activité */}
          <TabsContent value="activity" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Activité récente</h3>
              <div className="flex gap-2">
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="scan">Scans</SelectItem>
                    <SelectItem value="review">Avis</SelectItem>
                    <SelectItem value="badge">Badges</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="default" size="sm">Exporter</Button>
              </div>
            </div>
            
            {recentActivity.map(activity => <div key={activity.id} className="border border-border/50 p-4 rounded-3xl bg-gray-50">
                <div className="flex items-center gap-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.type === "scan" && `Commerce scanné: ${activity.commerce}`}
                      {activity.type === "review" && `Avis laissé pour ${activity.commerce}`}
                      {activity.type === "badge" && `Badge "${activity.badge}" obtenu`}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.points}
                  </Badge>
                </div>
              </div>)}
          </TabsContent>

          {/* Favoris */}
          <TabsContent value="favorites" className="space-y-4">
            <FavoritesSection />
          </TabsContent>

          {/* Entreprises - Système de Gestion des Profils */}
          <TabsContent value="businesses" className="space-y-4">
            <div className="min-h-96 p-4 bg-background py-0">
              {/* Redirection vers la page dédiée */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Gérer mes entreprises</h3>
                  <p className="text-muted-foreground mb-6">
                    Accédez à la page de gestion de vos profils business
                  </p>
                  <Button 
                    onClick={() => navigate('/entreprises')}
                    size="lg"
                    className="gap-2"
                  >
                    <Building2 className="w-5 h-5" />
                    Accéder à mes entreprises
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            <ConsumerProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </PageWithSkeleton>;
};