import { useState } from "react";
import { 
  MessageSquare, 
  Users, 
  Megaphone, 
  ShoppingCart, 
  Settings,
  ArrowLeft,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Import sub-components
import { ConversationsHub } from "./ConversationsHub";
import { GroupManager } from "./GroupManager";
import { CampaignManager } from "./CampaignManager";
import { OrderTracker } from "./OrderTracker";
import { QuoteManager } from "./QuoteManager";
import { AppointmentScheduler } from "./AppointmentScheduler";
import { CommunicationSettings } from "./CommunicationSettings";

interface MainTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const MAIN_TABS: MainTab[] = [
  { 
    id: "conversations", 
    label: "Conversations", 
    icon: MessageSquare, 
    badge: 12 
  },
  { 
    id: "groupes", 
    label: "Groupes", 
    icon: Users, 
    badge: 3 
  },
  { 
    id: "campagnes", 
    label: "Campagnes", 
    icon: Megaphone, 
    badge: 1 
  },
  { 
    id: "commandes", 
    label: "Commandes", 
    icon: ShoppingCart, 
    badge: 8 
  },
  { 
    id: "parametres", 
    label: "Paramètres", 
    icon: Settings 
  }
];

export const CommunicationCenter = () => {
  const [activeMainTab, setActiveMainTab] = useState("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border/50 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Centre Com. ConsoGab</h1>
                <p className="text-xs text-muted-foreground">Communication unifiée & intelligente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-destructive animate-pulse" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher conversations, clients, commandes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="px-4">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-border/30">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors relative",
                  "flex items-center gap-2 min-w-0",
                  activeMainTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span className={cn(
                  "truncate",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {isMobile && tab.label.length > 8 
                    ? tab.label.substring(0, 8) + "..." 
                    : tab.label
                  }
                </span>
                {tab.badge && (
                  <Badge className="ml-1 text-xs min-w-[16px] h-4 px-1 bg-primary text-primary-foreground">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeMainTab === "conversations" && (
          <ConversationsTabContent searchQuery={searchQuery} />
        )}
        {activeMainTab === "groupes" && (
          <GroupesTabContent searchQuery={searchQuery} />
        )}
        {activeMainTab === "campagnes" && (
          <CampagnesTabContent searchQuery={searchQuery} />
        )}
        {activeMainTab === "commandes" && (
          <CommandesTabContent searchQuery={searchQuery} />
        )}
        {activeMainTab === "parametres" && (
          <ParametresTabContent />
        )}
      </div>
    </div>
  );
};

// Conversations Tab Content with Sub-tabs
const ConversationsTabContent = ({ searchQuery }: { searchQuery: string }) => {
  const [activeSubTab, setActiveSubTab] = useState("toutes");
  
  const subTabs = [
    { id: "toutes", label: "Toutes" },
    { id: "actives", label: "Actives" },
    { id: "archivees", label: "Archivées" },
    { id: "non-lues", label: "Non lues" }
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div className="bg-muted/20 border-b border-border/30">
        <div className="px-4 py-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSubTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <ConversationsHub searchQuery={searchQuery} />
      </div>
    </div>
  );
};

// Groupes Tab Content with Sub-tabs
const GroupesTabContent = ({ searchQuery }: { searchQuery: string }) => {
  const [activeSubTab, setActiveSubTab] = useState("mes-groupes");
  
  const subTabs = [
    { id: "mes-groupes", label: "Mes groupes" },
    { id: "creer", label: "Créer" },
    { id: "invitations", label: "Invitations" }
  ];

  return (
    <div>
      <div className="bg-muted/20 border-b border-border/30">
        <div className="px-4 py-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSubTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <GroupManager searchQuery={searchQuery} />
      </div>
    </div>
  );
};

// Campagnes Tab Content with Sub-tabs
const CampagnesTabContent = ({ searchQuery }: { searchQuery: string }) => {
  const [activeSubTab, setActiveSubTab] = useState("actives");
  
  const subTabs = [
    { id: "actives", label: "Actives" },
    { id: "brouillons", label: "Brouillons" },
    { id: "programmees", label: "Programmées" },
    { id: "terminees", label: "Terminées" }
  ];

  return (
    <div>
      <div className="bg-muted/20 border-b border-border/30">
        <div className="px-4 py-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSubTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <CampaignManager searchQuery={searchQuery} />
      </div>
    </div>
  );
};

// Commandes Tab Content with Sub-tabs
const CommandesTabContent = ({ searchQuery }: { searchQuery: string }) => {
  const [activeSubTab, setActiveSubTab] = useState("vue-ensemble");
  
  const subTabs = [
    { id: "vue-ensemble", label: "Vue d'ensemble" },
    { id: "devis", label: "Devis" },
    { id: "commandes", label: "Commandes" },
    { id: "rdv", label: "RDV" }
  ];

  return (
    <div>
      <div className="bg-muted/20 border-b border-border/30">
        <div className="px-4 py-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSubTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {activeSubTab === "vue-ensemble" && <OrderTracker searchQuery={searchQuery} />}
        {activeSubTab === "devis" && <QuoteManager searchQuery={searchQuery} />}
        {activeSubTab === "commandes" && <OrderTracker searchQuery={searchQuery} />}
        {activeSubTab === "rdv" && <AppointmentScheduler searchQuery={searchQuery} />}
      </div>
    </div>
  );
};

// Paramètres Tab Content with Sub-tabs
const ParametresTabContent = () => {
  const [activeSubTab, setActiveSubTab] = useState("general");
  
  const subTabs = [
    { id: "general", label: "Général" },
    { id: "notifications", label: "Notifications" },
    { id: "confidentialite", label: "Confidentialité" },
    { id: "integrations", label: "Intégrations" }
  ];

  return (
    <div>
      <div className="bg-muted/20 border-b border-border/30">
        <div className="px-4 py-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeSubTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <CommunicationSettings />
      </div>
    </div>
  );
};