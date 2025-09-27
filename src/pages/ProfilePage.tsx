import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { User, Settings, Star, MapPin, Trophy, QrCode, Shield, History, Award, Bell, Filter, TrendingUp, Trash2, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FavoritesSection } from "@/components/profile/FavoritesSection";
import { AdvancedBusinessManager } from "@/components/profile/AdvancedBusinessManager";
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
      const {
        data,
        error
      } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
      if (error) {
        console.error('Erreur récupération profil:', error);
        setIsLoading(false);
        return;
      }
      if (data) {
        setUserProfile({
          name: data.pseudo || user.email?.split('@')[0] || "Utilisateur",
          email: user.email || "",
          phone: data.phone || "",
          joinDate: new Date(data.created_at || user.created_at).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          }),
          userType: data.role === 'merchant' ? 'commerçant' : 'client',
          points: Math.floor(Math.random() * 3000) + 1000,
          // TODO: Implémenter système de points
          level: data.role === 'merchant' ? 'Entrepreneur' : 'Ambassador ConsoGab',
          scansCount: Math.floor(Math.random() * 50) + 10,
          reviewsCount: Math.floor(Math.random() * 30) + 5,
          favoritesCount: Math.floor(Math.random() * 20) + 3,
          pseudo: data.pseudo || "",
          role: data.role || ""
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

  // Fonction pour refresh les données du profil
  const handleProfileUpdate = () => {
    fetchUserProfile();
    if (onProfileUpdated) {
      onProfileUpdated();
    }
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
    return (
      <PageWithSkeleton isLoading={isLoading} skeleton={<ProfilePageSkeleton />}>
        <div className="flex flex-col min-h-screen bg-background">
          {/* Header Profile optimisé mobile */}
          <div className="bg-gradient-to-br from-primary via-accent to-secondary p-4 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              {/* Première ligne: Avatar + Info + Actions */}
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30 flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-title-large text-white font-roboto truncate">{userProfile.name}</h1>
                  <p className="text-body-small text-white/80 font-roboto truncate">{userProfile.email}</p>
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-label-small font-roboto">
                      {userProfile.level}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={onSettings} className="text-white hover:bg-white/20 backdrop-blur-sm w-8 h-8">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-red-500/30 backdrop-blur-sm w-8 h-8">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Deuxième ligne: Membre depuis */}
              <Badge variant="outline" className="border-white/30 text-white/80 text-label-small font-roboto w-fit">
                Membre depuis {userProfile.joinDate}
              </Badge>

              {/* Troisième ligne: Bouton notifications */}
              <Button className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm text-label-large font-roboto" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                S'abonner aux notifications
              </Button>

              {/* Stats en grille responsive */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
                  <CardContent className="p-3">
                    <div className="text-title-medium text-white font-roboto">{userProfile.points}</div>
                    <div className="text-label-small text-white/70 font-roboto">Points</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
                  <CardContent className="p-3">
                    <div className="text-title-medium text-white font-roboto">{userProfile.scansCount}</div>
                    <div className="text-label-small text-white/70 font-roboto">Scans</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
                  <CardContent className="p-3">
                    <div className="text-title-medium text-white font-roboto">{userProfile.reviewsCount}</div>
                    <div className="text-label-small text-white/70 font-roboto">Avis</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Tabs optimisés mobile */}
          <div className="flex-1 pb-20">
            <div className="p-4 bg-background">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4 bg-card rounded-xl p-1">
                  <TabsTrigger value="overview" className="text-label-small font-roboto px-1 py-2 rounded-lg">Aperçu</TabsTrigger>
                  <TabsTrigger value="activity" className="text-label-small font-roboto px-1 py-2 rounded-lg">Activité</TabsTrigger>
                  <TabsTrigger value="favorites" className="text-label-small font-roboto px-1 py-2 rounded-lg">Favoris</TabsTrigger>
                  <TabsTrigger value="businesses" className="text-label-small font-roboto px-1 py-2 rounded-lg">Business</TabsTrigger>
                  <TabsTrigger value="settings" className="text-label-small font-roboto px-1 py-2 rounded-lg">Config</TabsTrigger>
                </TabsList>

          {/* Aperçu optimisé mobile */}
          <TabsContent value="overview" className="space-y-4">
            {/* Progression niveau responsive */}
            <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader className="bg-primary text-primary-foreground rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-title-medium font-roboto">Points ConsoGab</CardTitle>
                  <Badge className="bg-accent text-accent-foreground text-label-small font-roboto">Niveau 4</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-body-medium font-roboto">Ambassador ConsoGab</span>
                  <span className="text-primary text-body-medium font-roboto font-medium">{userProfile.points} / 5000 pts</span>
                </div>
                <div className="w-full rounded-full h-2 overflow-hidden bg-muted">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-700" 
                    style={{ width: `${(userProfile.points / 5000) * 100}%` }}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-body-small text-muted-foreground font-roboto">
                    Plus que <span className="font-medium text-primary">2153 points</span> pour "Local Hero"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides optimisées mobile */}
            <div className="space-y-3">
              <h3 className="text-title-small font-roboto">Actions rapides</h3>
              
              {/* Bouton Dashboard Opérateur pour les marchands */}
              {userProfile.role === 'merchant' && (
                <Button 
                  onClick={() => window.location.href = '/merchant/dashboard'} 
                  className="w-full h-14 bg-gradient-to-r from-primary to-accent text-primary-foreground flex items-center gap-3 rounded-xl shadow-lg"
                >
                  <Shield className="w-6 h-6 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-label-large font-roboto truncate">Dashboard Opérateur</div>
                    <div className="text-label-small opacity-90 font-roboto truncate">Gérer vos catalogues</div>
                  </div>
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="default" className="h-16 flex-col gap-1 rounded-xl p-2">
                  <QrCode className="w-5 h-5" />
                  <span className="text-label-small font-roboto text-center leading-tight">Scanner commerce</span>
                </Button>
                <Button variant="default" className="h-16 flex-col gap-1 rounded-xl p-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-label-small font-roboto text-center leading-tight">Commerces proches</span>
                </Button>
                <Button variant="secondary" className="h-16 flex-col gap-1 rounded-xl p-2" disabled>
                  <Trophy className="w-5 h-5" />
                  <span className="text-label-small font-roboto text-center leading-tight">Classements</span>
                </Button>
                <Button variant="default" className="h-16 flex-col gap-1 rounded-xl p-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-label-small font-roboto text-center leading-tight">Sécurité</span>
                </Button>
              </div>
            </div>

            {/* Notifications optimisées mobile */}
            <Card className="border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-title-small font-roboto text-primary">Notifications</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bell className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <div className="flex items-start gap-3 p-3 border-l-4 border-primary rounded-lg bg-primary/5">
                  <Trophy className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-medium font-roboto font-medium text-primary">Nouveau badge débloqué!</p>
                    <p className="text-label-small text-muted-foreground font-roboto">Vous avez obtenu "Explorateur"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border-l-4 border-accent rounded-lg bg-accent/5">
                  <Star className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-medium font-roboto font-medium">Nouveau commerce ajouté</p>
                    <p className="text-label-small text-muted-foreground font-roboto">Près de chez vous</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activité optimisée mobile */}
          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-title-medium font-roboto">Activité récente</h3>
                <Button variant="outline" size="sm" className="text-label-small font-roboto">
                  Exporter
                </Button>
              </div>
              
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les activités</SelectItem>
                  <SelectItem value="scan">Scans uniquement</SelectItem>
                  <SelectItem value="review">Avis uniquement</SelectItem>
                  <SelectItem value="badge">Badges uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <Card key={activity.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-body-medium font-roboto font-medium">
                          {activity.type === "scan" && `Commerce scanné`}
                          {activity.type === "review" && `Avis publié`}
                          {activity.type === "badge" && `Badge obtenu`}
                        </p>
                        <p className="text-body-small font-roboto text-muted-foreground truncate">
                          {activity.type === "scan" && activity.commerce}
                          {activity.type === "review" && activity.commerce}
                          {activity.type === "badge" && `"${activity.badge}"`}
                        </p>
                        <p className="text-label-small text-muted-foreground font-roboto">{activity.date}</p>
                      </div>
                      <Badge variant="outline" className="text-label-small font-roboto flex-shrink-0">
                        {activity.points}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Favoris */}
          <TabsContent value="favorites" className="space-y-4">
            <FavoritesSection userType="consumer" />
          </TabsContent>

          {/* Entreprises - Système de Gestion des Profils */}
          <TabsContent value="businesses" className="space-y-4">
            <div className="min-h-96 p-4 bg-background">
              {/* Header avec basculement de mode */}
              <div className="from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-6 mb-6 border border-primary/20 bg-[3a75c4] bg-[#3a75c4]/[0.97]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-white">
                      Gestion des Profils
                    </h2>
                    <p className="text-sm text-white">Créez et gérez vos profils business</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-accent animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Gestionnaire de business avancé */}
              <AdvancedBusinessManager />
            </div>
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Paramètres du compte</h3>
              
              {/* Section Compte */}
              <Card>
                <CardHeader className="bg-[3a75c4] bg-[#3a75c4]/[0.97]">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5" />
                    Informations du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-gray-200 px-[14px] my-0">
                  <Button variant="outline" onClick={onSettings} className="w-full justify-start rounded-3xl my-[10px] bg-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier mon profil
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-3xl my-[5px] bg-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Sécurité et confidentialité
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-3xl my-[10px] bg-white">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                </CardContent>
              </Card>

              {/* Section Support */}
              <Card>
                <CardHeader className="bg-[3a75c4] bg-[#3a75c4]/[0.96]">
                  <CardTitle className="text-white text-left">Support & Aide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-gray-200 my-0">
                  <Button variant="outline" className="w-full justify-start my-[12px] rounded-3xl bg-white">
                    Centre d'aide
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-3xl my-0 bg-white">
                    Nous contacter
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-3xl my-[12px] bg-white">
                    À propos de ConsoGab
                  </Button>
                </CardContent>
              </Card>

              {/* Section Danger */}
              <Card className="border-red-200">
                <CardHeader className="bg-zinc-950">
                  <CardTitle className="font-bold text-red-500 text-2xl">Zone dangereuse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white my-0">
                  <Button variant="outline" onClick={handleDeleteAccount} className="w-full justify-start border-red-200 my-[12px] rounded-3xl text-center bg-red-600 hover:bg-red-500 text-white">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer mon compte
                  </Button>
                  <Button variant="destructive" onClick={handleLogout} className="w-full justify-start rounded-3xl bg-black my-0">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</PageWithSkeleton>
);
};