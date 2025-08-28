import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  Users,
  Store,
  Plus,
  Eye
} from "lucide-react";

interface MerchantDashboardProps {
  onNavigate: (section: string) => void;
}

export const MerchantDashboard = ({ onNavigate }: MerchantDashboardProps) => {
  // Mock data - Dans une vraie app, ces données viendraient de l'API
  const dashboardStats = {
    totalSales: "127,543 FCFA",
    totalOrders: 23,
    activeProducts: 45,
    newMessages: 3,
    monthlyGrowth: "+12%",
    pendingOrders: 5
  };

  const quickActions = [
    {
      title: "Créer un produit",
      description: "Ajouter un nouveau produit à votre catalogue",
      icon: Plus,
      action: () => onNavigate('products'),
      variant: "default" as const
    },
    {
      title: "Voir les commandes",
      description: "Gérer vos commandes en cours",
      icon: ShoppingCart,
      action: () => onNavigate('orders'),
      variant: "outline" as const
    },
    {
      title: "Messages clients",
      description: "Répondre aux questions de vos clients",
      icon: MessageSquare,
      action: () => onNavigate('messages'),
      variant: "outline" as const,
      badge: dashboardStats.newMessages > 0 ? dashboardStats.newMessages.toString() : undefined
    }
  ];

  const navigationSections = [
    {
      title: "Catalogues & Produits",
      description: "Gérez vos catalogues et produits",
      icon: Package,
      section: "catalogs",
      stats: `${dashboardStats.activeProducts} produits actifs`
    },
    {
      title: "Gestion des commandes",
      description: "Suivez et traitez vos commandes",
      icon: ShoppingCart,
      section: "orders",
      stats: `${dashboardStats.pendingOrders} en attente`,
      urgent: dashboardStats.pendingOrders > 0
    },
    {
      title: "Stocks & inventaire",
      description: "Contrôlez vos stocks",
      icon: Store,
      section: "inventory",
      stats: "Dernière MàJ: Aujourd'hui"
    },
    {
      title: "Rapports & Analytics",
      description: "Analysez vos performances",
      icon: BarChart3,
      section: "analytics",
      stats: `${dashboardStats.monthlyGrowth} ce mois`
    },
    {
      title: "Messagerie",
      description: "Communiquez avec vos clients",
      icon: MessageSquare,
      section: "messages",
      stats: `${dashboardStats.newMessages} nouveaux messages`,
      urgent: dashboardStats.newMessages > 0
    },
    {
      title: "Paramètres",
      description: "Configurez votre compte et boutique",
      icon: Settings,
      section: "settings",
      stats: "Profil à jour"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord opérateur</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{dashboardStats.monthlyGrowth}</span> vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.pendingOrders} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Dans vos catalogues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.newMessages}</div>
            <p className="text-xs text-muted-foreground">
              Non traités
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Accès direct aux tâches les plus fréquentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.action}
                className="h-auto p-4 justify-start relative"
              >
                <action.icon className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
                {action.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 px-2 py-1 text-xs"
                  >
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Navigation Sections */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Gestion de votre activité</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigationSections.map((section, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              onClick={() => onNavigate(section.section)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <section.icon className={`h-6 w-6 ${section.urgent ? 'text-orange-500' : 'text-primary'}`} />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                {section.urgent && (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-2">
                  {section.description}
                </CardDescription>
                <p className={`text-sm ${section.urgent ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                  {section.stats}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Alerts/Notifications */}
      {(dashboardStats.pendingOrders > 0 || dashboardStats.newMessages > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="mr-2 h-5 w-5" />
              Attention requise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardStats.pendingOrders > 0 && (
                <p className="text-sm text-orange-700">
                  • {dashboardStats.pendingOrders} commande(s) en attente de traitement
                </p>
              )}
              {dashboardStats.newMessages > 0 && (
                <p className="text-sm text-orange-700">
                  • {dashboardStats.newMessages} nouveau(x) message(s) de clients
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};