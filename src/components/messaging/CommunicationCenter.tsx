import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Users, 
  Megaphone, 
  ShoppingCart, 
  Calendar, 
  FileText,
  Settings,
  Search,
  Plus,
  Bell,
  Filter,
  MoreVertical,
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Composants spécialisés
import { ConversationsHub } from "./ConversationsHub";
import { GroupManager } from "./GroupManager";
import { CampaignManager } from "./CampaignManager";
import { OrderTracker } from "./OrderTracker";
import { QuoteManager } from "./QuoteManager";
import { AppointmentScheduler } from "./AppointmentScheduler";
import { CommunicationSettings } from "./CommunicationSettings";
import { RealTimeIndicators } from "./RealTimeIndicators";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isActive?: boolean;
  color?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "conversations", label: "Conversations", icon: MessageSquare, badge: 12, color: "text-blue-600" },
  { id: "groups", label: "Groupes", icon: Users, badge: 3, color: "text-green-600" },
  { id: "campaigns", label: "Campagnes", icon: Megaphone, badge: 1, color: "text-purple-600" },
  { id: "orders", label: "Commandes", icon: ShoppingCart, badge: 8, color: "text-orange-600" },
  { id: "quotes", label: "Devis", icon: FileText, badge: 2, color: "text-indigo-600" },
  { id: "appointments", label: "Rendez-vous", icon: Calendar, badge: 5, color: "text-pink-600" },
  { id: "settings", label: "Paramètres", icon: Settings, color: "text-gray-600" }
];

export const CommunicationCenter = () => {
  const [activeTab, setActiveTab] = useState("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();

  const activeItem = SIDEBAR_ITEMS.find(item => item.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "conversations":
        return <ConversationsHub searchQuery={searchQuery} />;
      case "groups":
        return <GroupManager searchQuery={searchQuery} />;
      case "campaigns":
        return <CampaignManager searchQuery={searchQuery} />;
      case "orders":
        return <OrderTracker searchQuery={searchQuery} />;
      case "quotes":
        return <QuoteManager searchQuery={searchQuery} />;
      case "appointments":
        return <AppointmentScheduler searchQuery={searchQuery} />;
      case "settings":
        return <CommunicationSettings />;
      default:
        return <ConversationsHub searchQuery={searchQuery} />;
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
        {/* Header Mobile */}
        <div className="bg-gradient-to-r from-primary to-accent text-white p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Centre Com. ConsoGab</h1>
              <p className="text-xs opacity-90">Communication unifiée & intelligente</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar Mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            <Input
              placeholder="Rechercher conversations, commandes, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
            />
          </div>
        </div>

        {/* Navigation Mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 gap-1 p-2 bg-background/80 backdrop-blur-sm">
            {SIDEBAR_ITEMS.slice(0, 4).map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="flex flex-col gap-1 p-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <div className="relative">
                  <item.icon className="w-4 h-4" />
                  {item.badge && (
                    <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0 text-xs bg-red-500">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs truncate">{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      {/* Sidebar */}
      <div className="w-80 bg-background/80 backdrop-blur-xl border-r border-border/50 shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gaboma-gradient">Centre Communication</h1>
              <p className="text-sm text-muted-foreground">ConsoGab • Intelligence Unifiée</p>
            </div>
            <div className="flex items-center gap-2">
              <RealTimeIndicators />
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500 animate-pulse" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans toutes les communications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-border/50">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="text-center">
                <TrendingUp className="w-4 h-4 mx-auto text-green-600 mb-1" />
                <div className="text-lg font-bold text-green-700">24</div>
                <div className="text-xs text-green-600">Actives</div>
              </div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="text-center">
                <Zap className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <div className="text-lg font-bold text-blue-700">12</div>
                <div className="text-xs text-blue-600">En cours</div>
              </div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="text-center">
                <Clock className="w-4 h-4 mx-auto text-orange-600 mb-1" />
                <div className="text-lg font-bold text-orange-700">3</div>
                <div className="text-xs text-orange-600">Urgents</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 p-3 h-auto transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg" 
                    : "hover:bg-accent/10"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="relative">
                  <item.icon className={cn("w-5 h-5", item.color)} />
                  {item.badge && (
                    <Badge 
                      className={cn(
                        "absolute -top-2 -right-2 w-5 h-5 p-0 text-xs",
                        activeTab === item.id ? "bg-white text-primary" : "bg-red-500"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <Button className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg">
            <Plus className="w-4 h-4" />
            Nouvelle Communication
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {activeItem && <activeItem.icon className={cn("w-6 h-6", activeItem.color)} />}
                {activeItem?.label}
                {activeItem?.badge && (
                  <Badge variant="outline" className="ml-2">
                    {activeItem.badge}
                  </Badge>
                )}
              </h2>
              <p className="text-muted-foreground mt-1">
                Gérez vos {activeItem?.label.toLowerCase()} en temps réel
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};