import { useState } from "react";
import { 
  MessageSquare, 
  Users, 
  Megaphone, 
  ShoppingCart, 
  Calendar, 
  FileText,
  Settings,
  Search,
  Bell,
  TrendingUp,
  Zap,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface TabItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  color?: string;
}

const MAIN_TABS: TabItem[] = [
  { 
    id: "conversations", 
    label: "Conversations", 
    shortLabel: "Chat",
    icon: MessageSquare, 
    badge: 12, 
    color: "hsl(var(--primary))" 
  },
  { 
    id: "groups", 
    label: "Groupes", 
    shortLabel: "Groupes",
    icon: Users, 
    badge: 3, 
    color: "hsl(var(--accent))" 
  },
  { 
    id: "campaigns", 
    label: "Campagnes", 
    shortLabel: "Promo",
    icon: Megaphone, 
    badge: 1, 
    color: "hsl(var(--secondary))" 
  },
  { 
    id: "orders", 
    label: "Commandes", 
    shortLabel: "CMD",
    icon: ShoppingCart, 
    badge: 8, 
    color: "hsl(215 60% 50%)" 
  },
  { 
    id: "quotes", 
    label: "Devis", 
    shortLabel: "Devis",
    icon: FileText, 
    badge: 2, 
    color: "hsl(280 60% 50%)" 
  },
  { 
    id: "appointments", 
    label: "Rendez-vous", 
    shortLabel: "RDV",
    icon: Calendar, 
    badge: 5, 
    color: "hsl(340 60% 50%)" 
  },
  { 
    id: "settings", 
    label: "Paramètres", 
    shortLabel: "Config",
    icon: Settings, 
    color: "hsl(var(--muted-foreground))" 
  }
];

export const CommunicationCenter = () => {
  const [activeTab, setActiveTab] = useState("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const activeItem = MAIN_TABS.find(item => item.id === activeTab);

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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      {/* Header unifié */}
      <div className="bg-gradient-to-r from-primary to-accent text-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Centre Com. ConsoGab</h1>
              <p className="text-xs opacity-90">Communication unifiée & intelligente</p>
            </div>
            <div className="flex items-center gap-2">
              <RealTimeIndicators />
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500 animate-pulse" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
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

        {/* Quick Stats Bar */}
        <div className="px-4 pb-4">
          <div className="flex gap-4 overflow-x-auto">
            <Card className="flex-shrink-0 px-3 py-2 bg-white/20 border-white/30">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-4 h-4" />
                <div className="text-sm">
                  <span className="font-bold">24</span>
                  <span className="text-xs opacity-90 ml-1">Actives</span>
                </div>
              </div>
            </Card>
            <Card className="flex-shrink-0 px-3 py-2 bg-white/20 border-white/30">
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-4 h-4" />
                <div className="text-sm">
                  <span className="font-bold">12</span>
                  <span className="text-xs opacity-90 ml-1">En cours</span>
                </div>
              </div>
            </Card>
            <Card className="flex-shrink-0 px-3 py-2 bg-white/20 border-white/30">
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-4 h-4" />
                <div className="text-sm">
                  <span className="font-bold">3</span>
                  <span className="text-xs opacity-90 ml-1">Urgents</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
          <TabsList className={cn(
            "w-full h-auto p-1 bg-transparent",
            isMobile 
              ? "grid grid-cols-4 gap-1" 
              : "flex justify-start overflow-x-auto scrollbar-hide"
          )}>
            {MAIN_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "relative flex-shrink-0 transition-all duration-300",
                  isMobile 
                    ? "flex flex-col gap-1 p-3 min-h-[60px]"
                    : "flex items-center gap-2 px-4 py-3 min-w-[120px]",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent",
                  "data-[state=active]:text-white data-[state=active]:shadow-lg",
                  "hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <tab.icon className={cn(
                    isMobile ? "w-4 h-4" : "w-5 h-5",
                    "transition-colors"
                  )} />
                  {tab.badge && (
                    <Badge 
                      className={cn(
                        "absolute -top-1 -right-1 text-xs min-w-[16px] h-4 px-1",
                        activeTab === tab.id 
                          ? "bg-white text-primary" 
                          : "bg-primary text-white"
                      )}
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "font-medium truncate",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {isMobile ? tab.shortLabel : tab.label}
                </span>
                {activeTab === tab.id && !isMobile && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent 
            value="conversations" 
            className="h-full m-0 data-[state=active]:animate-fade-in"
          >
            <ConversationsHub searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent 
            value="groups" 
            className="h-full m-0 data-[state=active]:animate-fade-in"
          >
            <GroupManager searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent 
            value="campaigns" 
            className="h-full m-0 data-[state=active]:animate-fade-in"
          >
            <CampaignManager searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent 
            value="orders" 
            className="h-full m-0 data-[state=active]:animate-fade-in"
          >
            <OrderTracker searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent 
            value="quotes" 
            className="h-full m-0 data-[state=active]:animate-fade-in"
          >
            <QuoteManager searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent 
            value="appointments" 
            className="h-full m-0 data-[state=active]:animate-fade-in"
          >
            <AppointmentScheduler searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent 
            value="settings" 
            className="h-full m-0 data-[state=active]:animate-fade-in"
          >
            <CommunicationSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};