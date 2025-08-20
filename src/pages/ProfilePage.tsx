import { useState } from "react";
import { User, Settings, Star, MapPin, Trophy, QrCode, Shield, History, Award, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const userProfile = {
  name: "Marie Dubois",
  email: "marie.dubois@email.com",
  phone: "+241 06 xx xx xx",
  joinDate: "Mars 2024",
  userType: "client", // client, commerçant, employé
  points: 2847,
  level: "Ambassador Gaboma",
  scansCount: 45,
  reviewsCount: 23,
  favoritesCount: 12
};

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

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scan": return <QrCode className="w-4 h-4 text-primary" />;
      case "review": return <Star className="w-4 h-4 text-yellow-500" />;
      case "badge": return <Award className="w-4 h-4 text-accent" />;
      default: return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Profile */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{userProfile.name}</h1>
            <p className="text-muted-foreground text-sm">{userProfile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default">{userProfile.level}</Badge>
              <Badge variant="outline">{userProfile.joinDate}</Badge>
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center bg-card/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{userProfile.points}</div>
            <div className="text-xs text-muted-foreground">Points</div>
          </div>
          <div className="text-center bg-card/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-accent">{userProfile.scansCount}</div>
            <div className="text-xs text-muted-foreground">Scans</div>
          </div>
          <div className="text-center bg-card/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-secondary">{userProfile.reviewsCount}</div>
            <div className="text-xs text-muted-foreground">Avis</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="text-xs">Aperçu</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Activité</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">Favoris</TabsTrigger>
          </TabsList>

          {/* Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            {/* Progression niveau */}
            <div className="bg-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Progression</h3>
                <Badge variant="badge">Niveau 4</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Ambassador Gaboma</span>
                  <span>2847 / 5000 pts</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(userProfile.points / 5000) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Plus que 2153 points pour atteindre "Local Hero"
                </p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="space-y-3">
              <h3 className="font-semibold">Actions rapides</h3>
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
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Activité récente</h3>
              <Button variant="ghost" size="sm">Voir tout</Button>
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
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Commerces favoris</h3>
              <Badge variant="outline">{favoriteCommerces.length}</Badge>
            </div>
            
            {favoriteCommerces.map((commerce) => (
              <div
                key={commerce.id}
                className="bg-card rounded-xl border border-border/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{commerce.name}</h4>
                    <p className="text-sm text-muted-foreground">{commerce.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{commerce.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{commerce.lastVisit}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Visiter
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};