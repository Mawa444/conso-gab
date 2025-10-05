import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Camera, 
  Palette, 
  Search, 
  MessageSquare, 
  Share, 
  Lightbulb, 
  Database,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart,
  PieChart,
  LineChart,
  Users,
  Eye,
  ShoppingCart,
  Target,
  Zap,
  Calendar,
  Mail,
  Globe,
  Phone,
  Award
} from "lucide-react";

const communicationTools = [
  {
    id: "social_media",
    name: "Réseaux Sociaux",
    icon: Share,
    description: "Gestion automatisée des publications",
    status: "active",
    features: ["Auto-publication", "Planification", "Analytics"]
  },
  {
    id: "email_marketing",
    name: "Email Marketing",
    icon: Mail,
    description: "Campagnes email personnalisées",
    status: "premium",
    features: ["Templates", "Segmentation", "A/B Testing"]
  },
  {
    id: "sms_campaigns",
    name: "Campagnes SMS",
    icon: MessageSquare,
    description: "Messages texte ciblés",
    status: "coming_soon",
    features: ["SMS groupés", "Personnalisation", "Statistiques"]
  },
  {
    id: "content_creator",
    name: "Créateur de Contenu",
    icon: Camera,
    description: "IA pour générer du contenu visuel",
    status: "beta",
    features: ["Images IA", "Vidéos courtes", "Templates"]
  }
];

const analyticsTools = [
  {
    id: "customer_insights",
    name: "Insights Clients",
    icon: Users,
    description: "Comportements et préférences détaillés",
    metrics: ["Fidélité", "Panier moyen", "Fréquence de visite"]
  },
  {
    id: "sales_analytics",
    name: "Analytics Ventes",
    icon: TrendingUp,
    description: "Performance commerciale en temps réel",
    metrics: ["CA quotidien", "Produits stars", "Tendances"]
  },
  {
    id: "competition",
    name: "Veille Concurrentielle",
    icon: Target,
    description: "Analyse de la concurrence locale",
    metrics: ["Prix marché", "Positionnement", "Opportunités"]
  },
  {
    id: "predictive",
    name: "Prédictions IA",
    icon: Lightbulb,
    description: "Prévisions intelligentes",
    metrics: ["Demande future", "Stock optimal", "Pricing"]
  }
];

const marketingTools = [
  {
    id: "seo_local",
    name: "SEO Local",
    icon: Search,
    description: "Optimisation recherche locale",
    impact: "high"
  },
  {
    id: "loyalty_program",
    name: "Programme Fidélité",
    icon: Award,
    description: "Récompenses et points clients",
    impact: "high"
  },
  {
    id: "referral_system",
    name: "Parrainage",
    icon: Users,
    description: "Système de recommandations",
    impact: "medium"
  },
  {
    id: "flash_sales",
    name: "Ventes Flash",
    icon: Zap,
    description: "Promotions limitées dans le temps",
    impact: "high"
  }
];

interface BusinessToolsSectionProps {
  businessName?: string;
}

export const BusinessToolsSection = ({ businessName = "Mon Entreprise" }: BusinessToolsSectionProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case "premium":
        return <Badge className="bg-amber-100 text-amber-800">Premium</Badge>;
      case "beta":
        return <Badge className="bg-blue-100 text-blue-800">Beta</Badge>;
      case "coming_soon":
        return <Badge variant="outline">Bientôt</Badge>;
      default:
        return null;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "medium":
        return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case "low":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Outils Business Avancés
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Suite complète d'outils professionnels pour développer {businessName} et optimiser vos performances
        </p>
      </div>

      {/* Communication & Marketing */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Communication & Marketing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communicationTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{tool.name}</h3>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(tool.status)}
                    </div>
                    <div className="space-y-2">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" className="w-full mt-3" variant={tool.status === 'active' ? 'default' : 'outline'}>
                      {tool.status === 'active' ? 'Configurer' : tool.status === 'premium' ? 'Débloquer' : 'En savoir plus'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Avancés */}
      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-6 h-6 text-accent" />
            Analytics & Intelligence d'Affaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-accent">Métriques clés:</p>
                      {tool.metrics.map((metric, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span className="text-xs">{metric}</span>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      Analyser maintenant
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Outils de Croissance */}
      <Card className="border-2 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-secondary" />
            Outils de Croissance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketingTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{tool.name}</h3>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getImpactIcon(tool.impact)}
                        <span className="text-xs capitalize">{tool.impact}</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full" variant="outline">
                      Configurer l'outil
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Centre de Référencement */}
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Centre de Référencement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">SEO Score</p>
              <p className="text-2xl font-bold text-primary">78/100</p>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <Eye className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="font-semibold text-sm">Visibilité</p>
              <p className="text-2xl font-bold text-accent">+24%</p>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="font-semibold text-sm">Portée</p>
              <p className="text-2xl font-bold text-secondary">1.2K</p>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-sm">Croissance</p>
              <p className="text-2xl font-bold text-green-600">+12%</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Optimiser SEO
            </Button>
            <Button variant="outline" className="flex-1">
              <BarChart className="w-4 h-4 mr-2" />
              Rapport détaillé
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};