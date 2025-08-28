import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { User, Settings, Star, MapPin, Trophy, QrCode, Shield, History, Award, Bell, Filter, TrendingUp, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FavoritesSection } from "@/components/profile/FavoritesSection";
import { useNavigate } from "react-router-dom";
import { useAuthCleanup } from "@/hooks/use-auth-cleanup";
import { toast } from "sonner";

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

const recentActivity = [
  {
    id: "act_001",
    type: "scan",
    commerce: "Boulangerie Chez Mama Nzé",
    date: "Il y a 2h",
    points: "+10 pts"
  },
  {
    id: "act_002", 
    type: "review",
    commerce: "Restaurant Chez Tonton",
    date: "Hier",
    points: "+25 pts"
  },
  {
    id: "act_003",
    type: "badge",
    badge: "Explorateur",
    date: "Il y a 3 jours",
    points: "+50 pts"
  }
];

const favoriteCommerces = [
  {
    id: "fav_001",
    name: "Restaurant Chez Tonton",
    type: "Restaurant",
    rating: 4.9,
    lastVisit: "Il y a 2 jours"
  },
  {
    id: "fav_002",
    name: "Salon Afrique Beauté", 
    type: "Salon de beauté",
    rating: 4.7,
    lastVisit: "La semaine dernière"
  },
  {
    id: "fav_003",
    name: "Pharmacie du Centre",
    type: "Pharmacie", 
    rating: 4.8,
    lastVisit: "Il y a 5 jours"
  }
];

interface ProfilePageProps {
  onBack?: () => void;
  onSettings?: () => void;
}

export const ProfilePage = ({ onBack, onSettings }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [activityFilter, setActivityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { secureSignOut } = useAuthCleanup();
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
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erreur récupération profil:', error);
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
            points: Math.floor(Math.random() * 3000) + 1000, // TODO: Implémenter système de points
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
      }
    };

    fetchUserProfile();
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scan": return <QrCode className="w-4 h-4 text-primary" />;
      case "review": return <Star className="w-4 h-4 text-yellow-500" />;
      case "badge": return <Award className="w-4 h-4 text-accent" />;
      default: return <History className="w-4 h-4 text-muted-foreground" />;
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
    <div className="min-h-screen animate-fade-in">
      {/* Header Profile moderne */}
      <div className="bg-gradient-to-br from-primary via-accent to-secondary p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
              <User className="w-12 h-12 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{userProfile.name}</h1>
              <p className="text-white/80 text-sm">{userProfile.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {userProfile.level}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white/80">
                  Membre depuis {userProfile.joinDate}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onSettings}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Settings className="w-6 h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDeleteAccount}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Trash2 className="w-6 h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-white hover:bg-red-500/30 backdrop-blur-sm"
              >
                <LogOut className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Stats rapides modernisées */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-white">{userProfile.points}</div>
                <div className="text-sm text-white/70">Points ConsoGab</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-white">{userProfile.scansCount}</div>
                <div className="text-sm text-white/70">Scans effectués</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-white">{userProfile.reviewsCount}</div>
                <div className="text-sm text-white/70">Avis publiés</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="text-xs">Aperçu</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Activité</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">Favoris</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Paramètres</TabsTrigger>
          </TabsList>

          {/* Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            {/* Progression niveau modernisée */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Progression ConsoGab</CardTitle>
                  <Badge className="bg-primary/20 text-primary">Niveau 4</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Ambassador ConsoGab</span>
                  <span className="text-primary">{userProfile.points} / 5000 pts</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-primary via-accent to-secondary h-3 rounded-full transition-all duration-700 relative overflow-hidden"
                    style={{ width: `${(userProfile.points / 5000) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
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
              {userProfile.role === 'merchant' && (
                <Button 
                  onClick={() => window.location.href = '/merchant/dashboard'}
                  className="w-full h-16 bg-gradient-to-r from-primary to-accent text-white mb-4 flex items-center gap-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Shield className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-lg font-bold">Dashboard Opérateur</div>
                    <div className="text-sm opacity-90">Gérer vos catalogues et commandes</div>
                  </div>
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <QrCode className="w-6 h-6 text-primary" />
                  <span className="text-sm">Scanner commerce</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MapPin className="w-6 h-6 text-accent" />
                  <span className="text-sm">Commerces proches</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Trophy className="w-6 h-6 text-secondary" />
                  <span className="text-sm">Classements</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Shield className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm">Sécurité</span>
                </Button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Notifications</h3>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <Trophy className="w-4 h-4 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nouveau badge débloqué!</p>
                    <p className="text-xs text-muted-foreground">Vous avez obtenu "Explorateur"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 bg-accent/5 rounded-lg border-l-4 border-accent">
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
                <Button variant="outline" size="sm">Exporter</Button>
              </div>
            </div>
            
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="bg-card rounded-xl border border-border/50 p-4"
              >
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
              </div>
            ))}
          </TabsContent>

          {/* Favoris */}
          <TabsContent value="favorites" className="space-y-4">
            <FavoritesSection userType="consumer" />
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Paramètres du compte</h3>
              
              {/* Section Compte */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={onSettings}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier mon profil
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Sécurité et confidentialité
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                </CardContent>
              </Card>

              {/* Section Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Support & Aide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Centre d'aide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Nous contacter
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    À propos de ConsoGab
                  </Button>
                </CardContent>
              </Card>

              {/* Section Danger */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Zone dangereuse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer mon compte
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
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
  );
};