import { useState } from "react";
import { ArrowLeft, Trophy, Star, TrendingUp, Award, Target, Gift, Users, Calendar, Crown, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UserStats {
  totalPoints: number;
  currentLevel: string;
  nextLevel: string;
  pointsToNextLevel: number;
  totalScans: number;
  totalReviews: number;
  favoriteBusinesses: number;
  currentRank: number;
  totalUsers: number;
  weeklyRank: number;
  monthlyRank: number;
  achievements: Achievement[];
  weeklyStats: {
    scans: number;
    reviews: number;
    points: number;
  };
  monthlyStats: {
    scans: number;
    reviews: number;
    points: number;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  target?: number;
  category: "discovery" | "social" | "loyalty" | "expert";
}

const mockUserStats: UserStats = {
  totalPoints: 2847,
  currentLevel: "Ambassador Gaboma",
  nextLevel: "Champion Local",
  pointsToNextLevel: 653,
  totalScans: 45,
  totalReviews: 23,
  favoriteBusinesses: 12,
  currentRank: 47,
  totalUsers: 1205,
  weeklyRank: 12,
  monthlyRank: 28,
  achievements: [
    { id: "first_scan", name: "Premier Scan", description: "Votre première découverte", icon: "🎯", earned: true, earnedDate: "Il y a 2 mois", category: "discovery" },
    { id: "explorer", name: "Explorateur", description: "10 commerces différents scannés", icon: "🗺️", earned: true, earnedDate: "Il y a 1 mois", category: "discovery" },
    { id: "reviewer", name: "Critique Expert", description: "20 avis laissés", icon: "⭐", earned: true, earnedDate: "Il y a 3 semaines", category: "social" },
    { id: "ambassador", name: "Ambassador Gaboma", description: "50 commerces scannés", icon: "🏆", earned: true, earnedDate: "Il y a 1 semaine", category: "loyalty" },
    { id: "local_hero", name: "Héros Local", description: "100 commerces scannés", icon: "👑", earned: false, progress: 45, target: 100, category: "loyalty" },
    { id: "master_reviewer", name: "Maître Critique", description: "100 avis laissés", icon: "📝", earned: false, progress: 23, target: 100, category: "expert" },
    { id: "influencer", name: "Influenceur", description: "Partager 50 découvertes", icon: "📢", earned: false, progress: 12, target: 50, category: "social" },
    { id: "trendsetter", name: "Précurseur", description: "Être le premier à découvrir 10 nouveaux commerces", icon: "🚀", earned: false, progress: 3, target: 10, category: "discovery" }
  ],
  weeklyStats: {
    scans: 8,
    reviews: 4,
    points: 320
  },
  monthlyStats: {
    scans: 45,
    reviews: 23,
    points: 1140
  }
};

const levelColors = {
  "Découvreur": "from-gray-400 to-gray-600",
  "Explorateur": "from-blue-400 to-blue-600", 
  "Ambassador Gaboma": "from-purple-400 to-purple-600",
  "Champion Local": "from-yellow-400 to-yellow-600",
  "Légende Gabonaise": "from-red-400 to-red-600"
};

const categoryColors = {
  discovery: "border-blue-500 bg-blue-50 text-blue-700",
  social: "border-green-500 bg-green-50 text-green-700",
  loyalty: "border-purple-500 bg-purple-50 text-purple-700",
  expert: "border-orange-500 bg-orange-50 text-orange-700"
};

export const PersonalRankingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const stats = mockUserStats;

  const getLevelProgress = () => {
    const totalPointsForNextLevel = stats.totalPoints + stats.pointsToNextLevel;
    return (stats.totalPoints / totalPointsForNextLevel) * 100;
  };

  const getAchievementProgress = (achievement: Achievement) => {
    if (achievement.earned) return 100;
    if (!achievement.progress || !achievement.target) return 0;
    return (achievement.progress / achievement.target) * 100;
  };

  const earnedAchievements = stats.achievements.filter(a => a.earned);
  const inProgressAchievements = stats.achievements.filter(a => !a.earned);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-accent to-secondary p-6 text-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Mon Classement</h1>
          <p className="text-white/80 text-sm mb-4">
            Votre progression dans la communauté ConsoGab
          </p>
          
          {/* Niveau actuel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <span className="font-bold text-lg">{stats.currentLevel}</span>
            </div>
            <div className="text-2xl font-bold mb-2">{stats.totalPoints} points</div>
            <div className="text-sm text-white/80">
              Plus que {stats.pointsToNextLevel} points pour devenir {stats.nextLevel}
            </div>
            <Progress value={getLevelProgress()} className="mt-2 h-2" />
          </div>

          {/* Rang global */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-lg font-bold">#{stats.currentRank}</div>
              <div className="text-xs text-white/80">Général</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-lg font-bold">#{stats.weeklyRank}</div>
              <div className="text-xs text-white/80">Cette semaine</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-lg font-bold">#{stats.monthlyRank}</div>
              <div className="text-xs text-white/80">Ce mois</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full -mt-6">
          <div className="bg-background rounded-t-2xl p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Résumé</TabsTrigger>
              <TabsTrigger value="achievements">Badges</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 px-4">
            {/* Statistiques principales */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-[hsl(var(--gaboma-blue))]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-[hsl(var(--gaboma-blue))]" />
                  </div>
                  <div className="text-2xl font-bold">{stats.totalScans}</div>
                  <div className="text-sm text-muted-foreground">Commerces scannés</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-[hsl(var(--gaboma-yellow))]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-[hsl(var(--gaboma-yellow))]" />
                  </div>
                  <div className="text-2xl font-bold">{stats.totalReviews}</div>
                  <div className="text-sm text-muted-foreground">Avis laissés</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">❤️</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.favoriteBusinesses}</div>
                  <div className="text-sm text-muted-foreground">Favoris</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-[hsl(var(--gaboma-green))]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6 text-[hsl(var(--gaboma-green))]" />
                  </div>
                  <div className="text-2xl font-bold">{earnedAchievements.length}</div>
                  <div className="text-sm text-muted-foreground">Badges obtenus</div>
                </CardContent>
              </Card>
            </div>

            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Activité de la semaine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Commerces scannés</span>
                  <Badge variant="secondary">{stats.weeklyStats.scans}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avis laissés</span>
                  <Badge variant="secondary">{stats.weeklyStats.reviews}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Points gagnés</span>
                  <Badge className="bg-[hsl(var(--gaboma-green))] text-white">+{stats.weeklyStats.points}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Défis en cours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Défis en cours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {inProgressAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{achievement.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">{achievement.description}</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.target}
                      </div>
                    </div>
                    <Progress value={getAchievementProgress(achievement)} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6 px-4">
            {/* Badges obtenus */}
            <div>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badges obtenus ({earnedAchievements.length})
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {earnedAchievements.map((achievement) => (
                  <Card key={achievement.id} className={cn("border-2", categoryColors[achievement.category])}>
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                      <Badge variant="default" className="text-xs">
                        Obtenu {achievement.earnedDate}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Badges en cours */}
            <div>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                En cours ({inProgressAchievements.length})
              </h2>
              <div className="space-y-4">
                {inProgressAchievements.map((achievement) => (
                  <Card key={achievement.id} className="border-border/50 opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={getAchievementProgress(achievement)} className="flex-1 h-2" />
                            <span className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.target}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6 px-4">
            {/* Comparaison temporelle */}
            <Card>
              <CardHeader>
                <CardTitle>Progression mensuelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[hsl(var(--gaboma-blue))]/20 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-[hsl(var(--gaboma-blue))]" />
                      </div>
                      <div>
                        <div className="font-medium">Commerces scannés</div>
                        <div className="text-sm text-muted-foreground">Ce mois vs Total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{stats.monthlyStats.scans} / {stats.totalScans}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((stats.monthlyStats.scans / stats.totalScans) * 100)}% ce mois
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[hsl(var(--gaboma-yellow))]/20 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-[hsl(var(--gaboma-yellow))]" />
                      </div>
                      <div>
                        <div className="font-medium">Avis laissés</div>
                        <div className="text-sm text-muted-foreground">Ce mois vs Total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{stats.monthlyStats.reviews} / {stats.totalReviews}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((stats.monthlyStats.reviews / stats.totalReviews) * 100)}% ce mois
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[hsl(var(--gaboma-green))]/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-[hsl(var(--gaboma-green))]" />
                      </div>
                      <div>
                        <div className="font-medium">Points gagnés</div>
                        <div className="text-sm text-muted-foreground">Ce mois vs Total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{stats.monthlyStats.points} / {stats.totalPoints}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((stats.monthlyStats.points / stats.totalPoints) * 100)}% ce mois
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classement détaillé */}
            <Card>
              <CardHeader>
                <CardTitle>Votre position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                  <div className="text-4xl font-bold text-primary mb-2">#{stats.currentRank}</div>
                  <div className="text-sm text-muted-foreground">sur {stats.totalUsers} utilisateurs</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Top {Math.round((stats.currentRank / stats.totalUsers) * 100)}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-card rounded-xl border">
                    <div className="text-2xl font-bold text-[hsl(var(--gaboma-blue))]">#{stats.weeklyRank}</div>
                    <div className="text-sm text-muted-foreground">Cette semaine</div>
                  </div>
                  <div className="text-center p-4 bg-card rounded-xl border">
                    <div className="text-2xl font-bold text-[hsl(var(--gaboma-green))]">#{stats.monthlyRank}</div>
                    <div className="text-sm text-muted-foreground">Ce mois</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Défi personnel */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-bold mb-2">Défi du mois !</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Atteignez le rang #25 ce mois pour débloquer le badge "Champion Local"
                </p>
                <Button size="sm" className="bg-primary">
                  Accepter le défi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};