import { useState } from "react";
import { 
  Megaphone, 
  Plus, 
  Play, 
  Pause, 
  Send, 
  Users, 
  Eye, 
  BarChart3, 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Mail,
  MessageSquare,
  Smartphone,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Campaign {
  id: string;
  name: string;
  type: "promotion" | "announcement" | "survey" | "newsletter";
  status: "draft" | "scheduled" | "active" | "paused" | "completed";
  message: string;
  targetAudience: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduledAt?: string;
  createdAt: string;
  channels: ("sms" | "email" | "push" | "whatsapp")[];
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Promotion Nouvel An",
    type: "promotion",
    status: "active",
    message: "🎉 Profitez de -30% sur tous nos produits jusqu'au 31 janvier!",
    targetAudience: "Clients Premium",
    recipients: 1200,
    sent: 1200,
    opened: 780,
    clicked: 234,
    createdAt: "2024-01-15T10:00:00Z",
    channels: ["sms", "email", "push"]
  },
  {
    id: "2",
    name: "Nouveau Catalogue Mars",
    type: "announcement",
    status: "scheduled",
    message: "Découvrez notre nouveau catalogue printemps-été avec plus de 500 nouveaux produits!",
    targetAudience: "Tous les clients",
    recipients: 3500,
    sent: 0,
    opened: 0,
    clicked: 0,
    scheduledAt: "2024-03-01T09:00:00Z",
    createdAt: "2024-01-18T14:30:00Z",
    channels: ["email", "push"]
  },
  {
    id: "3",
    name: "Enquête Satisfaction",
    type: "survey",
    status: "completed",
    message: "Aidez-nous à améliorer nos services en répondant à cette enquête de 2 minutes.",
    targetAudience: "Clients récents",
    recipients: 500,
    sent: 500,
    opened: 325,
    clicked: 89,
    createdAt: "2024-01-10T16:00:00Z",
    channels: ["email", "sms"]
  },
  {
    id: "4",
    name: "Newsletter Janvier",
    type: "newsletter",
    status: "draft",
    message: "Retrouvez toutes les actualités ConsoGab de ce mois...",
    targetAudience: "Abonnés newsletter",
    recipients: 2100,
    sent: 0,
    opened: 0,
    clicked: 0,
    createdAt: "2024-01-20T11:15:00Z",
    channels: ["email"]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "completed":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "paused":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "draft":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "promotion":
      return <Target className="w-4 h-4" />;
    case "announcement":
      return <Megaphone className="w-4 h-4" />;
    case "survey":
      return <BarChart3 className="w-4 h-4" />;
    case "newsletter":
      return <Mail className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "sms":
      return <Smartphone className="w-3 h-3" />;
    case "email":
      return <Mail className="w-3 h-3" />;
    case "push":
      return <MessageSquare className="w-3 h-3" />;
    case "whatsapp":
      return <MessageSquare className="w-3 h-3 text-green-600" />;
    default:
      return <MessageSquare className="w-3 h-3" />;
  }
};

interface CampaignManagerProps {
  searchQuery: string;
}

export const CampaignManager = ({ searchQuery }: CampaignManagerProps) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>("1");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    type: "promotion",
    targetAudience: "all",
    channels: ["email"] as string[]
  });

  const filteredCampaigns = MOCK_CAMPAIGNS.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCampaignData = MOCK_CAMPAIGNS.find(c => c.id === selectedCampaign);

  const calculateOpenRate = (campaign: Campaign) => {
    return campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
  };

  const calculateClickRate = (campaign: Campaign) => {
    return campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0;
  };

  const handleCreateCampaign = () => {
    console.log("Creating campaign:", newCampaign);
    setShowCreateDialog(false);
    setNewCampaign({
      name: "",
      message: "",
      type: "promotion",
      targetAudience: "all",
      channels: ["email"]
    });
  };

  return (
    <div className="flex h-full">
      {/* Campaigns List */}
      <div className="w-1/3 border-r border-border/50 flex flex-col bg-background/50">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Campagnes</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-white">
                  <Plus className="w-4 h-4" />
                  Nouvelle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle campagne</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom de la campagne</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Promotion été 2024"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type de campagne</Label>
                    <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="announcement">Annonce</SelectItem>
                        <SelectItem value="survey">Enquête</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Rédigez votre message..."
                      rows={4}
                      value={newCampaign.message}
                      onChange={(e) => setNewCampaign({...newCampaign, message: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="audience">Audience cible</Label>
                    <Select value={newCampaign.targetAudience} onValueChange={(value) => setNewCampaign({...newCampaign, targetAudience: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les clients</SelectItem>
                        <SelectItem value="premium">Clients Premium</SelectItem>
                        <SelectItem value="recent">Clients récents</SelectItem>
                        <SelectItem value="inactive">Clients inactifs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Canaux de diffusion</Label>
                    <div className="flex gap-4 mt-2">
                      {["email", "sms", "push", "whatsapp"].map((channel) => (
                        <div key={channel} className="flex items-center space-x-2">
                          <Switch
                            id={channel}
                            checked={newCampaign.channels.includes(channel)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewCampaign({
                                  ...newCampaign,
                                  channels: [...newCampaign.channels, channel]
                                });
                              } else {
                                setNewCampaign({
                                  ...newCampaign,
                                  channels: newCampaign.channels.filter(c => c !== channel)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={channel} className="capitalize text-sm">{channel}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateCampaign} className="flex-1">
                      Créer la campagne
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Campaigns */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-0",
                  selectedCampaign === campaign.id 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 shadow-md" 
                    : "hover:bg-accent/5"
                )}
                onClick={() => setSelectedCampaign(campaign.id)}
              >
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-muted rounded">
                          {getTypeIcon(campaign.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{campaign.name}</h4>
                          <Badge className={cn("text-xs px-2 py-0 h-5 mt-1", getStatusColor(campaign.status))}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {campaign.status === "active" && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Message Preview */}
                    <p className="text-xs text-muted-foreground truncate">
                      {campaign.message}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium">{campaign.recipients}</div>
                        <div className="text-muted-foreground">Cibles</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{calculateOpenRate(campaign)}%</div>
                        <div className="text-muted-foreground">Ouvert</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{calculateClickRate(campaign)}%</div>
                        <div className="text-muted-foreground">Cliqué</div>
                      </div>
                    </div>

                    {/* Channels & Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {campaign.channels.map((channel) => (
                          <div key={channel} className="p-1 bg-muted rounded">
                            {getChannelIcon(channel)}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(campaign.createdAt), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Campaign Details */}
      <div className="flex-1 flex flex-col">
        {selectedCampaignData ? (
          <>
            {/* Campaign Header */}
            <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary to-accent text-white rounded-lg">
                    {getTypeIcon(selectedCampaignData.type)}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{selectedCampaignData.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={cn("text-xs px-2 py-0 h-5", getStatusColor(selectedCampaignData.status))}>
                        {selectedCampaignData.status}
                      </Badge>
                      <span>•</span>
                      <span>{selectedCampaignData.targetAudience}</span>
                      {selectedCampaignData.scheduledAt && (
                        <>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(selectedCampaignData.scheduledAt), { locale: fr })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCampaignData.status === "draft" && (
                    <Button size="sm" className="gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer
                    </Button>
                  )}
                  {selectedCampaignData.status === "active" && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Pause className="w-4 h-4" />
                      Pause
                    </Button>
                  )}
                  {selectedCampaignData.status === "paused" && (
                    <Button size="sm" className="gap-2">
                      <Play className="w-4 h-4" />
                      Reprendre
                    </Button>
                  )}
                  {selectedCampaignData.status === "scheduled" && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <X className="w-4 h-4" />
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Message */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Message de la campagne</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedCampaignData.message}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-muted-foreground">Canaux:</span>
                        {selectedCampaignData.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="gap-1 text-xs">
                            {getChannelIcon(channel)}
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Users className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                          <div className="text-2xl font-bold text-blue-700">{selectedCampaignData.recipients}</div>
                          <div className="text-sm text-blue-600">Destinataires</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Send className="w-6 h-6 mx-auto text-green-600 mb-2" />
                          <div className="text-2xl font-bold text-green-700">{selectedCampaignData.sent}</div>
                          <div className="text-sm text-green-600">Envoyés</div>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <Eye className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                          <div className="text-2xl font-bold text-orange-700">{selectedCampaignData.opened}</div>
                          <div className="text-sm text-orange-600">Ouverts</div>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <TrendingUp className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                          <div className="text-2xl font-bold text-purple-700">{selectedCampaignData.clicked}</div>
                          <div className="text-sm text-purple-600">Clics</div>
                        </div>
                      </div>
                      
                      {/* Progress Bars */}
                      <div className="space-y-4 mt-6">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Taux d'ouverture</span>
                            <span>{calculateOpenRate(selectedCampaignData)}%</span>
                          </div>
                          <Progress value={calculateOpenRate(selectedCampaignData)} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Taux de clic</span>
                            <span>{calculateClickRate(selectedCampaignData)}%</span>
                          </div>
                          <Progress value={calculateClickRate(selectedCampaignData)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Campaign Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge variant="outline" className="gap-1 capitalize">
                          {getTypeIcon(selectedCampaignData.type)}
                          {selectedCampaignData.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Statut</span>
                        <Badge className={cn("text-xs px-2 py-0 h-5 capitalize", getStatusColor(selectedCampaignData.status))}>
                          {selectedCampaignData.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Créée le</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedCampaignData.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {selectedCampaignData.scheduledAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Programmée le</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedCampaignData.scheduledAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <BarChart3 className="w-4 h-4" />
                        Voir les détails
                      </Button>
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <Users className="w-4 h-4" />
                        Modifier l'audience
                      </Button>
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <Calendar className="w-4 h-4" />
                        Reprogrammer
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Megaphone className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Sélectionnez une campagne</h3>
                <p className="text-muted-foreground">
                  Choisissez une campagne pour voir les détails et statistiques
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};