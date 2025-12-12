
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { 
  Settings, TrendingUp, Users, MapPin, Star, MessageSquare, 
  Calendar, ShoppingCart, FileText, Target, Crown, Plus, Package, Loader2,
} from 'lucide-react';
import { 
  getToolsForCategory, 
  getCategoryConfig,
  type ProfessionalTool, 
} from '@/data/professionalTools';
import { CatalogList } from '@/features/catalog/components/CatalogList';
import { CatalogForm } from '@/features/catalog/components/CatalogForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useBusinessStats } from '@/features/professional/hooks/useBusinessStats';
import { useBusinessTools } from '@/features/professional/hooks/useBusinessTools';
import { QuickSaleDialog } from '@/features/professional/components/QuickSaleDialog';
import { useNavigate } from 'react-router-dom';

interface ProfessionalDashboardProps {
  businessId: string;
  businessName: string;
  businessCategory: string;
  userType: 'owner' | 'employee';
}

export const ProfessionalDashboard = ({ 
  businessId, 
  businessName, 
  businessCategory, 
  userType, 
}: ProfessionalDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Real Data Hooks
  const { data: stats, isLoading: statsLoading } = useBusinessStats(businessId);
  const { toolsState, toggleTool, isToolActive, isLoading: toolsLoading } = useBusinessTools(businessId);

  const categoryConfig = getCategoryConfig(businessCategory);
  const availableTools = getToolsForCategory(businessCategory);
  
  // Masquer les onglets si les outils sont désactivés
  const showCatalogs = isToolActive('catalog', true); // Default true for now
  const showAnalytics = isToolActive('visitor_analytics', true);

  // Données exemple pour les graphiques (TODO: Connecter au vrai hook analytics charts)
  const visitorsData = [
    { day: 'Lun', visitors: 45, revenue: 1200 },
    { day: 'Mar', visitors: 52, revenue: 1400 },
    { day: 'Mer', visitors: 38, revenue: 950 },
    { day: 'Jeu', visitors: 61, revenue: 1650 },
    { day: 'Ven', visitors: 78, revenue: 2100 },
    { day: 'Sam', visitors: 95, revenue: 2800 },
    { day: 'Dim', visitors: 42, revenue: 1100 },
  ];

  const clientsData = [
    { zone: 'Nombakélé', clients: 35, percentage: 35 },
    { zone: 'Glass', clients: 28, percentage: 28 },
    { zone: 'Akanda', clients: 20, percentage: 20 },
    { zone: 'Autres', clients: 17, percentage: 17 },
  ];

  const getToolIcon = (tool: ProfessionalTool) => {
    const iconMap: { [key: string]: any } = {
      catalog: FileText,
      menu: ShoppingCart,
      services: Settings,
      appointments: Calendar,
      messaging: MessageSquare,
      visitor_analytics: Users,
      sales_analytics: TrendingUp,
      geo_analytics: MapPin,
      promotions: Target,
    };
    return iconMap[tool.id] || Settings;
  };

  if (statsLoading || toolsLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header du dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{businessName}</h1>
          <p className="text-muted-foreground">Dashboard professionnel - {categoryConfig?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {userType === 'owner' ? 'Propriétaire' : 'Employé'}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => navigate(`/b/${businessId}`)}>
             Voir ma vitrine
          </Button>
          <Button size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          
          <TabsTrigger value="catalogs" disabled={!showCatalogs} className={!showCatalogs ? 'opacity-30' : ''}>
            <Package className="w-4 h-4 mr-2" />
            Catalogues
          </TabsTrigger>
          
          <TabsTrigger value="tools">Outils</TabsTrigger>
          <TabsTrigger value="analytics" disabled={!showAnalytics}>Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs principaux (REAL DATA) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visiteurs (7j)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.visits || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Visiteurs uniques
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus (30j)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats?.revenue || 0).toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  Commandes complétées
                </p>
                <QuickSaleDialog businessId={businessId} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.rating || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Basé sur les avis clients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Non lus
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des visites</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={visitorsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="hsl(var(--gaboma-blue))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition géographique des clients</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={clientsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="hsl(var(--gaboma-green))"
                      dataKey="clients"
                      label={({ zone, percentage }) => `${zone} (${percentage}%)`}
                    >
                      {clientsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${200 + index * 50}, 70%, 50%)`} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>



        <TabsContent value="catalogs" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion des catalogues</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  const shareData = {
                    title: businessName,
                    text: `Découvrez la vitrine de ${businessName} sur ConsoGab !`,
                    url: `${window.location.origin}/b/${businessId}`,
                  };
                  if (navigator.share) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(shareData.url);
                    // toast.success("Lien copié !"); // Would need toast import
                  }
                }}>
                  <Settings className="w-4 h-4 mr-2" /> {/* Reusing Settings icon for Share for now or import Share2 */}
                  Partager Vitrine
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                       Nouveau Catalogue
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <CatalogForm businessId={businessId} onSuccess={() => {
                      // Close dialog logic would require state control.
                    }} /> 
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <CatalogList businessId={businessId} />
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Outils disponibles</h3>
              <p className="text-sm text-muted-foreground">
                Personnalisez votre espace de travail selon vos besoins
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Demander un outil
            </Button>
          </div>

          {/* Outils par catégorie */}
          <div className="space-y-6">
            {['management', 'analytics', 'communication', 'action'].map(category => {
              const categoryTools = availableTools.filter(tool => tool.type === category);
              const categoryNames = {
                management: 'Gestion',
                analytics: 'Analytics',
                communication: 'Communication', 
                action: 'Actions',
              };

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {categoryNames[category as keyof typeof categoryNames]}
                      <Badge variant="secondary">{categoryTools.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      {categoryTools.map((tool) => {
                        const IconComponent = getToolIcon(tool);
                        const isActive = isToolActive(tool.id);
                        const isDefault = defaultTools.some(dt => dt.id === tool.id);

                        return (
                          <div 
                            key={tool.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{tool.name}</span>
                                  {tool.premium && (
                                    <Crown className="w-3 h-3 text-yellow-500" />
                                  )}
                                  {isDefault && (
                                    <Badge variant="outline" className="text-xs">
                                      Essentiel
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{tool.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={isActive || isDefault}
                              onCheckedChange={(checked) => !isDefault && toggleTool.mutate({ toolId: tool.id, isActive: checked })}
                              disabled={isDefault || toggleTool.isPending}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics avancées - {categoryConfig?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Métriques spécialisées pour votre secteur d'activité
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {categoryConfig?.analytics.keyMetrics.map((metric, index) => (
                  <Card key={metric}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {[124, 15600, 89, 34][index]}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {metric.replace('_', ' ')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Graphiques spécialisés</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {categoryConfig?.analytics.specialCharts[0]?.replace('_', ' ') || 'Performance'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={visitorsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="hsl(var(--gaboma-green))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tendances</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: 'Performance cette semaine', value: '+12%', positive: true },
                          { label: 'Satisfaction client', value: '4.7/5', positive: true },
                          { label: 'Temps de réponse moyen', value: '2h 30min', positive: false },
                        ].map((trend, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{trend.label}</span>
                            <span className={`font-medium ${trend.positive ? 'text-green-600' : 'text-blue-600'}`}>
                              {trend.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du profil professionnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Sections personnalisées</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Adaptez les sections selon votre activité
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Section catalogue</Label>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <span className="font-medium">{categoryConfig?.customSections.catalog}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Section tarification</Label>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <span className="font-medium">{categoryConfig?.customSections.pricing}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Section contact/réservation</Label>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <span className="font-medium">{categoryConfig?.customSections.booking}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Fonctionnalités avancées</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Géolocalisation des clients</Label>
                      <p className="text-xs text-muted-foreground">
                        Analysez d'où viennent vos clients
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analytics prédictives</Label>
                      <p className="text-xs text-muted-foreground">
                        Prévisions basées sur l'IA
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications push</Label>
                      <p className="text-xs text-muted-foreground">
                        Alertes en temps réel
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};