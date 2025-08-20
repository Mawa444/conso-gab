import { useState } from "react";
import { Trophy, Star, Users, TrendingUp, Award, Medal, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const topCommerces = [
  {
    id: "top_001",
    name: "Restaurant Chez Tonton",
    owner: "Paul Mba",
    rating: 4.9,
    reviews: 234,
    type: "Restaurant",
    badge: "Champion du mois",
    trend: "+0.3"
  },
  {
    id: "top_002", 
    name: "Pharmacie du Centre",
    owner: "Dr. Michel Moussirou",
    rating: 4.8,
    reviews: 189,
    type: "Pharmacie",
    badge: "Service excellent",
    trend: "+0.1"
  },
  {
    id: "top_003",
    name: "Salon Afrique Beauté",
    owner: "Sylvie Mbourou",
    rating: 4.7,
    reviews: 156,
    type: "Beauté",
    badge: "Clientèle fidèle",
    trend: "+0.2"
  }
];

const topEmployees = [
  {
    id: "emp_001",
    name: "Marie Nzé",
    commerce: "Boulangerie Chez Mama",
    rating: 4.9,
    reviews: 89,
    badge: "Accueil parfait",
    speciality: "Service client"
  },
  {
    id: "emp_002",
    name: "Jean-Claude Ekomi",
    commerce: "Garage Auto Gaboma", 
    rating: 4.8,
    reviews: 67,
    badge: "Expert technique",
    speciality: "Réparation"
  },
  {
    id: "emp_003",
    name: "Grace Obiang",
    commerce: "Salon de Beauté Gaboma",
    rating: 4.7,
    reviews: 78,
    badge: "Créativité",
    speciality: "Coiffure"
  }
];

const topClients = [
  {
    id: "client_001",
    name: "Vous",
    points: 2847,
    scans: 45,
    reviews: 23,
    level: "Ambassador Gaboma"
  },
  {
    id: "client_002",
    name: "Alain M.",
    points: 3156,
    scans: 52,
    reviews: 31,
    level: "Champion Local"
  },
  {
    id: "client_003",
    name: "Sophie K.",
    points: 2934,
    scans: 48,
    reviews: 28,
    level: "Ambassador Gaboma"
  }
];

const badges = [
  { name: "Premier scan", icon: "🎯", description: "Votre premier commerce scanné", earned: true },
  { name: "Explorateur", icon: "🗺️", description: "10 commerces différents visités", earned: true },
  { name: "Critique expert", icon: "⭐", description: "20 avis laissés", earned: true },
  { name: "Ambassador Gaboma", icon: "🏆", description: "50 commerces scannés", earned: true },
  { name: "Local hero", icon: "👑", description: "100 commerces scannés", earned: false },
  { name: "Master reviewer", icon: "📝", description: "100 avis laissés", earned: false }
];

export const RankingsPage = () => {
  const [activeTab, setActiveTab] = useState("commerces");

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-6">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-accent mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Classements</h1>
          <p className="text-muted-foreground">
            Les meilleurs de la communauté 100% Gaboma
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="commerces" className="text-xs">Commerces</TabsTrigger>
            <TabsTrigger value="employees" className="text-xs">Employés</TabsTrigger>
            <TabsTrigger value="clients" className="text-xs">Clients</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs">Badges</TabsTrigger>
          </TabsList>

          {/* Top Commerces */}
          <TabsContent value="commerces" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Commerces</h2>
              <Badge variant="outline">Cette semaine</Badge>
            </div>
            
            {topCommerces.map((commerce, index) => (
              <div
                key={commerce.id}
                className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-[var(--shadow-soft)] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{commerce.name}</h3>
                      <Badge variant="badge" className="text-xs">
                        {commerce.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Par {commerce.owner} • {commerce.type}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{commerce.rating}</span>
                        <span className="text-xs text-muted-foreground">({commerce.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs">{commerce.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Top Employés */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Employés</h2>
              <Badge variant="outline">Cette semaine</Badge>
            </div>
            
            {topEmployees.map((employee, index) => (
              <div
                key={employee.id}
                className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-[var(--shadow-soft)] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {employee.name.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{employee.name}</h3>
                      <Badge variant="badge" className="text-xs">
                        {employee.badge}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {employee.commerce} • {employee.speciality}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{employee.rating}</span>
                      <span className="text-xs text-muted-foreground">({employee.reviews} avis)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Top Clients */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Clients</h2>
              <Badge variant="outline">Cette semaine</Badge>
            </div>
            
            {topClients.map((client, index) => (
              <div
                key={client.id}
                className={`bg-card rounded-xl border p-4 hover:shadow-[var(--shadow-soft)] transition-all ${
                  index === 0 ? 'border-primary/50 bg-primary/5' : 'border-border/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{client.name}</h3>
                      <Badge variant="badge" className="text-xs">
                        {client.level}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>{client.points} points</div>
                      <div>{client.scans} scans</div>
                      <div>{client.reviews} avis</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mes Badges</h2>
              <Badge variant="outline">
                {badges.filter(b => b.earned).length}/{badges.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`bg-card rounded-xl border p-4 text-center transition-all ${
                    badge.earned 
                      ? 'border-primary/50 bg-primary/5 shadow-md' 
                      : 'border-border/50 opacity-60'
                  }`}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {badge.earned && (
                    <Badge variant="default" className="mt-2 text-xs">
                      Obtenu
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};