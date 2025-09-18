import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  MessageCircle,
  ShoppingCart,
  Calendar,
  CreditCard,
  Clock,
  Package,
  Headphones,
  Mail,
  Archive,
  AlertCircle,
  Star,
  Users
} from "lucide-react";
import { ConversationFilter } from "@/pages/MessagingPage";
import { cn } from "@/lib/utils";

interface MessagingFiltersProps {
  activeFilter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
  onClose: () => void;
}

const filterOptions = [
  {
    id: "all" as ConversationFilter,
    label: "Toutes les conversations",
    icon: MessageCircle,
    description: "Voir toutes les conversations",
    color: "text-foreground"
  },
  {
    id: "orders" as ConversationFilter,
    label: "Commandes actives",
    icon: ShoppingCart,
    description: "Commandes en cours ou en attente",
    color: "text-blue-600",
    badge: "3"
  },
  {
    id: "reservations" as ConversationFilter,
    label: "Réservations confirmées",
    icon: Calendar,
    description: "Services et rendez-vous confirmés",
    color: "text-green-600",
    badge: "2"
  },
  {
    id: "payments" as ConversationFilter,
    label: "Paiements en attente",
    icon: CreditCard,
    description: "En attente de paiement",
    color: "text-orange-600",
    badge: "1"
  },
  {
    id: "appointments" as ConversationFilter,
    label: "Rendez-vous programmés",
    icon: Clock,
    description: "RDV confirmés et à venir",
    color: "text-purple-600"
  },
  {
    id: "catalogs" as ConversationFilter,
    label: "Catalogues suivis",
    icon: Package,
    description: "Conversations issues d'un catalogue",
    color: "text-indigo-600"
  },
  {
    id: "support" as ConversationFilter,
    label: "Support / Service client",
    icon: Headphones,
    description: "Demandes d'assistance",
    color: "text-red-600"
  },
  {
    id: "unread" as ConversationFilter,
    label: "Messages non lus",
    icon: Mail,
    description: "Nouveaux messages",
    color: "text-primary",
    badge: "5"
  },
  {
    id: "archived" as ConversationFilter,
    label: "Archivés",
    icon: Archive,
    description: "Conversations archivées",
    color: "text-muted-foreground"
  }
];

const quickStats = [
  {
    label: "Total conversations",
    value: "48",
    icon: Users,
    color: "text-blue-600"
  },
  {
    label: "Non lues",
    value: "5",
    icon: Mail,
    color: "text-primary"
  },
  {
    label: "Urgentes",
    value: "2",
    icon: AlertCircle,
    color: "text-red-600"
  },
  {
    label: "Favoris",
    value: "8",
    icon: Star,
    color: "text-yellow-600"
  }
];

export const MessagingFilters = ({ activeFilter, onFilterChange, onClose }: MessagingFiltersProps) => {
  const handleFilterSelect = (filter: ConversationFilter) => {
    onFilterChange(filter);
    onClose();
  };

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle>Filtres de conversation</SheetTitle>
      </SheetHeader>

      {/* Quick Stats */}
      <div>
        <h3 className="text-sm font-medium mb-3">Aperçu rapide</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <div>
                  <div className="font-semibold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Filter Options */}
      <div>
        <h3 className="text-sm font-medium mb-3">Filtrer par type</h3>
        <div className="space-y-2">
          {filterOptions.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3",
                activeFilter === filter.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleFilterSelect(filter.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <filter.icon className={cn(
                  "w-4 h-4 flex-shrink-0",
                  activeFilter === filter.id ? "text-primary-foreground" : filter.color
                )} />
                
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{filter.label}</div>
                  <div className={cn(
                    "text-xs",
                    activeFilter === filter.id ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {filter.description}
                  </div>
                </div>

                {filter.badge && (
                  <Badge 
                    variant={activeFilter === filter.id ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {filter.badge}
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Archive className="w-4 h-4 mr-2" />
            Archiver sélection
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Mail className="w-4 h-4 mr-2" />
            Marquer comme lu
          </Button>
        </div>
      </div>

      {/* Reset */}
      <div className="pt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            onFilterChange("all");
            onClose();
          }}
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
};