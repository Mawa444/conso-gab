import { useState } from "react";
import { Trophy, Star, Users, TrendingUp, Award, Medal, Crown, Filter, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeographicFilter } from "@/components/filters/GeographicFilter";

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

interface RankingsPageProps {
  onBack?: () => void;
}

export const RankingsPage = ({ onBack }: RankingsPageProps) => {
  const [activeTab, setActiveTab] = useState("commerces");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position}</span>;
    }
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header moderne avec design unifié */}
      <div className="bg-gradient-to-br from-primary via-accent to-secondary p-6 text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Classements</h1>
          <p className="text-white/80 text-sm">
            Les meilleurs de la communauté ConsoGab
          </p>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="p-6 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex gap-4 mb-4">
          <GeographicFilter 
            value={selectedLocation} 
            onValueChange={setSelectedLocation}
            className="flex-1"
          />
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Mieux notés</SelectItem>
              <SelectItem value="reviews">Plus d'avis</SelectItem>
              <SelectItem value="trending">Tendances</SelectItem>
              <SelectItem value="recent">Récents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="commerces" className="text-xs">Commerces</TabsTrigger>
            <TabsTrigger value="employees" className="text-xs">Employés</TabsTrigger>
            <TabsTrigger value="clients" className="text-xs">Clients</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs">Badges</TabsTrigger>
          </TabsList>

          {/* Top Commerces */}
          <TabsContent value="commerces" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Top Commerces</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {selectedLocation === "all" ? "🇬🇦 Tout le Gabon" : `📍 ${selectedLocation}`}
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {topCommerces.map((commerce, index) => (
                <Card
                  key={commerce.id}
                  className={`group transition-all duration-300 hover:shadow-[var(--shadow-gaboma)] border-2 ${
                    index === 0 ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5' : 
                    'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                          'bg-gradient-to-br from-primary/20 to-accent/20'
                        }`}>
                          {getRankIcon(index + 1)}
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-foreground">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                            {commerce.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs bg-accent/20 text-accent-foreground">
                            {commerce.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          Par {commerce.owner} • {commerce.type}
                        </p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg font-bold">{commerce.rating}</span>
                            <span className="text-sm text-muted-foreground">({commerce.reviews} avis)</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">{commerce.trend}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="shrink-0 hover:bg-primary hover:text-primary-foreground"
                      >
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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