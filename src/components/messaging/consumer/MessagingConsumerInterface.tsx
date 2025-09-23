import React, { useState } from "react";
import { useMessagingContext } from "../UniversalMessagingOS";
import { ConsumerInbox } from "./ConsumerInbox";
import { ConsumerSettings } from "./ConsumerSettings";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Calendar, 
  MessageCircle, 
  Heart,
  Sparkles,
  TrendingUp
} from "lucide-react";

export const MessagingConsumerInterface: React.FC = () => {
  const { currentView, setCurrentView } = useMessagingContext();
  
  const quickActions = [
    {
      icon: ShoppingBag,
      label: "Mes Commandes",
      description: "Suivre vos achats",
      color: "from-green-500 to-emerald-600",
      count: 3
    },
    {
      icon: Calendar,
      label: "Mes Réservations", 
      description: "RDV et réservations",
      color: "from-blue-500 to-cyan-600",
      count: 2
    },
    {
      icon: Heart,
      label: "Favoris",
      description: "Entreprises préférées",
      color: "from-pink-500 to-rose-600",
      count: 8
    },
    {
      icon: MessageCircle,
      label: "Support",
      description: "Aide et assistance",
      color: "from-purple-500 to-violet-600",
      count: 0
    }
  ];

  if (currentView === 'settings') {
    return <ConsumerSettings />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Interface Client Intelligente</span>
        </div>
        <h1 className="text-3xl font-bold text-gaboma-gradient">
          Votre Messagerie Universelle
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Communiquez avec toutes vos entreprises préférées, suivez vos commandes, gérez vos réservations - tout en un seul endroit.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-soft transition-all duration-300 cursor-pointer group bg-gradient-to-br from-card to-card/50 border-border/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {action.count > 0 && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                      {action.count}
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Inbox */}
      <ConsumerInbox />

      {/* Stats Preview */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-border/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Votre Activité
            </h3>
            <p className="text-sm text-muted-foreground">
              Résumé de vos interactions cette semaine
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">5</div>
              <div className="text-xs text-muted-foreground">Entreprises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">2</div>
              <div className="text-xs text-muted-foreground">Commandes</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};