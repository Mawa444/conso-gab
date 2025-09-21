import { useState } from "react";
import { 
  ArrowLeft,
  MessageSquare, 
  Users, 
  Megaphone, 
  ShoppingCart, 
  Settings,
  Bell,
  Search,
  Plus,
  Send,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Types pour la navigation
type ViewType = 'home' | 'conversations' | 'chat' | 'groups' | 'group-chat' | 'campaigns' | 'campaign-details' | 'orders' | 'order-details' | 'settings';

interface NavigationState {
  view: ViewType;
  conversationId?: string;
  groupId?: string;
  campaignId?: string;
  orderId?: string;
}

// Types de données
interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  type: 'sent' | 'received';
}

interface Group {
  id: string;
  name: string;
  members: number;
  lastActivity: string;
  avatar?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'completed';
  sent: number;
  opened: number;
  created: string;
}

interface Order {
  id: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed';
  amount: number;
  created: string;
}

// Données mockées
const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Marie Dupont",
    lastMessage: "Bonjour, je souhaiterais avoir des informations sur...",
    timestamp: "14:30",
    unread: 2,
    status: "online"
  },
  {
    id: "2", 
    name: "Jean Martin",
    lastMessage: "Merci pour votre réponse rapide !",
    timestamp: "13:45",
    unread: 0,
    status: "offline"
  },
  {
    id: "3",
    name: "Sophie Lambert",
    lastMessage: "Est-ce que le produit est toujours disponible ?",
    timestamp: "12:20",
    unread: 1,
    status: "away"
  }
];

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Bonjour, je souhaiterais avoir des informations sur vos produits.",
    timestamp: "14:25",
    senderId: "user1",
    type: "received"
  },
  {
    id: "2",
    content: "Bonjour ! Je serais ravi de vous aider. Quel type de produit vous intéresse ?",
    timestamp: "14:27",
    senderId: "me",
    type: "sent"
  },
  {
    id: "3",
    content: "Je cherche quelque chose pour mon salon, peut-être un canapé ou des accessoires de décoration.",
    timestamp: "14:30",
    senderId: "user1",
    type: "received"
  }
];

const mockGroups: Group[] = [
  {
    id: "1",
    name: "Clients VIP",
    members: 45,
    lastActivity: "Il y a 2h"
  },
  {
    id: "2",
    name: "Nouveaux clients",
    members: 128,
    lastActivity: "Il y a 30min"
  }
];

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Offre spéciale automne",
    status: "active",
    sent: 250,
    opened: 180,
    created: "15 Sept 2024"
  },
  {
    id: "2",
    name: "Nouveautés collection",
    status: "draft",
    sent: 0,
    opened: 0,
    created: "20 Sept 2024"
  }
];

const mockOrders: Order[] = [
  {
    id: "1",
    customerName: "Marie Dupont",
    status: "pending",
    amount: 159.99,
    created: "20 Sept 2024"
  },
  {
    id: "2",
    customerName: "Jean Martin", 
    status: "confirmed",
    amount: 89.50,
    created: "19 Sept 2024"
  }
];

export const CommunicationCenter = () => {
  const [navigation, setNavigation] = useState<NavigationState>({ view: 'home' });
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const navigateTo = (view: ViewType, params?: Partial<NavigationState>) => {
    setNavigation({ view, ...params });
  };

  const goBack = () => {
    switch (navigation.view) {
      case 'chat':
        navigateTo('conversations');
        break;
      case 'group-chat':
        navigateTo('groups');
        break;
      case 'campaign-details':
        navigateTo('campaigns');
        break;
      case 'order-details':
        navigateTo('orders');
        break;
      default:
        navigateTo('home');
        break;
    }
  };

  // Rendu conditionnel basé sur la vue actuelle
  if (navigation.view === 'home') {
    return <HomeView navigateTo={navigateTo} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
  }

  if (navigation.view === 'conversations') {
    return <ConversationsView navigateTo={navigateTo} goBack={goBack} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
  }

  if (navigation.view === 'chat') {
    return <ChatView conversationId={navigation.conversationId!} goBack={goBack} />;
  }

  if (navigation.view === 'groups') {
    return <GroupsView navigateTo={navigateTo} goBack={goBack} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
  }

  if (navigation.view === 'campaigns') {
    return <CampaignsView navigateTo={navigateTo} goBack={goBack} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
  }

  if (navigation.view === 'orders') {
    return <OrdersView navigateTo={navigateTo} goBack={goBack} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
  }

  if (navigation.view === 'settings') {
    return <SettingsView goBack={goBack} />;
  }

  return null;
};

// Vue d'accueil avec les onglets principaux
const HomeView = ({ 
  navigateTo, 
  searchQuery, 
  setSearchQuery 
}: { 
  navigateTo: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  const mainTabs = [
    { 
      id: 'conversations', 
      label: 'Conversations', 
      icon: MessageSquare, 
      badge: 3,
      description: 'Messages clients'
    },
    { 
      id: 'groups', 
      label: 'Groupes', 
      icon: Users, 
      badge: 2,
      description: 'Groupes de diffusion'
    },
    { 
      id: 'campaigns', 
      label: 'Campagnes', 
      icon: Megaphone, 
      badge: 1,
      description: 'Marketing & promotions'
    },
    { 
      id: 'orders', 
      label: 'Commandes', 
      icon: ShoppingCart, 
      badge: 8,
      description: 'Suivi des commandes'
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Settings,
      description: 'Configuration'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">Centre Com. ConsoGab</h1>
              <p className="text-sm text-muted-foreground">Communication unifiée & intelligente</p>
            </div>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-destructive" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="p-4 bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-xs text-muted-foreground">Messages non lus</div>
          </div>
          <div className="bg-card p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-xs text-muted-foreground">Conversations actives</div>
          </div>
          <div className="bg-card p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-xs text-muted-foreground">Campagnes en cours</div>
          </div>
          <div className="bg-card p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">8</div>
            <div className="text-xs text-muted-foreground">Commandes en attente</div>
          </div>
        </div>
      </div>

      {/* Menu principal */}
      <div className="p-4 space-y-3">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id as ViewType)}
            className="w-full bg-card p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <tab.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{tab.label}</div>
                  <div className="text-sm text-muted-foreground">{tab.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tab.badge && (
                  <Badge className="bg-primary text-primary-foreground">
                    {tab.badge}
                  </Badge>
                )}
                <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Vue des conversations
const ConversationsView = ({ 
  navigateTo, 
  goBack, 
  searchQuery, 
  setSearchQuery 
}: { 
  navigateTo: (view: ViewType, params?: any) => void;
  goBack: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Conversations</h1>
              <p className="text-sm text-muted-foreground">{mockConversations.length} conversations actives</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="p-4 space-y-2">
        {mockConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => navigateTo('chat', { conversationId: conversation.id })}
            className="w-full bg-card p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conversation.avatar} />
                  <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                  conversation.status === 'online' ? 'bg-green-500' :
                  conversation.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
                  <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
              </div>
              {conversation.unread > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {conversation.unread}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Vue de chat individuel
const ChatView = ({ 
  conversationId, 
  goBack 
}: { 
  conversationId: string;
  goBack: () => void;
}) => {
  const [newMessage, setNewMessage] = useState("");
  const conversation = mockConversations.find(c => c.id === conversationId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation?.avatar} />
              <AvatarFallback>{conversation?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-semibold">{conversation?.name}</h1>
              <p className="text-sm text-muted-foreground">En ligne</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.type === 'sent' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-lg",
                message.type === 'sent' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className={cn(
                "text-xs mt-1",
                message.type === 'sent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input de message */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Vue des groupes
const GroupsView = ({ 
  navigateTo, 
  goBack, 
  searchQuery, 
  setSearchQuery 
}: { 
  navigateTo: (view: ViewType, params?: any) => void;
  goBack: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Groupes</h1>
                <p className="text-sm text-muted-foreground">{mockGroups.length} groupes créés</p>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un groupe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {mockGroups.map((group) => (
          <div
            key={group.id}
            className="bg-card p-4 rounded-lg border border-border"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={group.avatar} />
                <AvatarFallback><Users className="w-6 h-6" /></AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.members} membres • {group.lastActivity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Vue des campagnes
const CampaignsView = ({ 
  navigateTo, 
  goBack, 
  searchQuery, 
  setSearchQuery 
}: { 
  navigateTo: (view: ViewType, params?: any) => void;
  goBack: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Campagnes</h1>
                <p className="text-sm text-muted-foreground">{mockCampaigns.length} campagnes</p>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une campagne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {mockCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-card p-4 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{campaign.name}</h3>
              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                {campaign.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Envoyés:</span> {campaign.sent}
              </div>
              <div>
                <span className="text-muted-foreground">Ouverts:</span> {campaign.opened}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Créé le {campaign.created}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Vue des commandes
const OrdersView = ({ 
  navigateTo, 
  goBack, 
  searchQuery, 
  setSearchQuery 
}: { 
  navigateTo: (view: ViewType, params?: any) => void;
  goBack: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Commandes</h1>
              <p className="text-sm text-muted-foreground">{mockOrders.length} commandes</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="bg-card p-4 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{order.customerName}</h3>
              <Badge variant={order.status === 'pending' ? 'destructive' : 'default'}>
                {order.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-primary">{order.amount}€</span>
              <span className="text-sm text-muted-foreground">{order.created}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Vue des paramètres
const SettingsView = ({ goBack }: { goBack: () => void }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Paramètres</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="font-medium mb-2">Notifications</h3>
          <p className="text-sm text-muted-foreground">Gérer vos préférences de notification</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="font-medium mb-2">Confidentialité</h3>
          <p className="text-sm text-muted-foreground">Paramètres de confidentialité et sécurité</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="font-medium mb-2">Intégrations</h3>
          <p className="text-sm text-muted-foreground">Connecter des services externes</p>
        </div>
      </div>
    </div>
  );
};