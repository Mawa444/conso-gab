import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  ShoppingCart, 
  Calendar, 
  Phone, 
  Headphones,
  ArrowRight,
  Users,
  Clock
} from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  count?: number;
  onClick: () => void;
  color: string;
}

const ServiceCard = ({ title, description, icon, count, onClick, color }: ServiceCardProps) => (
  <Card 
    className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 group"
    style={{ borderLeftColor: color }}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="flex items-center gap-2">
        {count !== undefined && count > 0 && (
          <Badge className="bg-primary text-primary-foreground">
            {count > 99 ? '99+' : count}
          </Badge>
        )}
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </Card>
);

export const MessageHomePage = () => {
  const navigate = useNavigate();

  // Mock data - remplacez par de vraies données
  const [counts] = useState({
    messages: 5,
    orders: 2,
    reservations: 1,
    appointments: 0,
    support: 0
  });

  const services = [
    {
      title: "Messages Privés",
      description: "Conversations avec d'autres utilisateurs",
      icon: <MessageSquare className="w-6 h-6" />,
      count: counts.messages,
      onClick: () => navigate("/messaging/conversations"),
      color: "#3A75C4"
    },
    {
      title: "Commandes",
      description: "Suivi de vos commandes et discussions avec les vendeurs",
      icon: <ShoppingCart className="w-6 h-6" />,
      count: counts.orders,
      onClick: () => navigate("/messaging/orders"),
      color: "#009639"
    },
    {
      title: "Réservations",
      description: "Réservations de services et tables",
      icon: <Calendar className="w-6 h-6" />,
      count: counts.reservations,
      onClick: () => navigate("/messaging/reservations"),
      color: "#FCD116"
    },
    {
      title: "Rendez-vous",
      description: "Prendre et gérer vos rendez-vous",
      icon: <Phone className="w-6 h-6" />,
      count: counts.appointments,
      onClick: () => navigate("/messaging/appointments"),
      color: "#FF6B6B"
    },
    {
      title: "Support",
      description: "Assistance et service client",
      icon: <Headphones className="w-6 h-6" />,
      count: counts.support,
      onClick: () => navigate("/messaging/support"),
      color: "#9C27B0"
    }
  ];

  const totalUnread = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gaboma-gradient">Centre de Messages</h2>
            <p className="text-muted-foreground">Gérez toutes vos communications</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalUnread}</div>
            <div className="text-sm text-muted-foreground">Messages non lus</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>En ligne</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Dernière activité: maintenant</span>
          </div>
        </div>
      </div>

      {/* Services de messagerie */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Services de Communication
        </h3>
        
        <div className="grid gap-4">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Actions Rapides</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/messaging/conversations?new=true")}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Nouveau Message
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/messaging/groups")}>
            <Users className="w-4 h-4 mr-2" />
            Créer un Groupe
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/messaging/search")}>
            <Phone className="w-4 h-4 mr-2" />
            Prendre RDV
          </Button>
        </div>
      </div>
    </div>
  );
};