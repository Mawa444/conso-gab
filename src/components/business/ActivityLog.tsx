import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  History, 
  User, 
  Store, 
  ShoppingCart, 
  MessageCircle, 
  Settings, 
  Trash2, 
  Eye, 
  Edit,
  Plus,
  Star,
  AlertTriangle,
  Shield,
  Filter,
  Download,
  Search,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";

interface ActivityLogEntry {
  id: string;
  action_type: string;
  action_description: string;
  metadata: any;
  created_at: string;
  business_id?: string;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'LOGIN': return <User className="w-4 h-4 text-green-600" />;
    case 'LOGOUT': return <User className="w-4 h-4 text-gray-600" />;
    case 'BUSINESS_CREATED': return <Store className="w-4 h-4 text-blue-600" />;
    case 'BUSINESS_UPDATED': return <Edit className="w-4 h-4 text-amber-600" />;
    case 'PRODUCT_CREATED': return <Plus className="w-4 h-4 text-green-600" />;
    case 'PRODUCT_UPDATED': return <Edit className="w-4 h-4 text-amber-600" />;
    case 'ORDER_RECEIVED': return <ShoppingCart className="w-4 h-4 text-blue-600" />;
    case 'REVIEW_RECEIVED': return <Star className="w-4 h-4 text-yellow-600" />;
    case 'MESSAGE_SENT': return <MessageCircle className="w-4 h-4 text-purple-600" />;
    case 'SETTINGS_CHANGED': return <Settings className="w-4 h-4 text-gray-600" />;
    case 'BUSINESS_DELETE_SCHEDULED': return <Trash2 className="w-4 h-4 text-red-600" />;
    case 'SECURITY_EVENT': return <Shield className="w-4 h-4 text-red-600" />;
    case 'PROFILE_VIEWED': return <Eye className="w-4 h-4 text-blue-500" />;
    default: return <History className="w-4 h-4 text-muted-foreground" />;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case 'LOGIN': return 'bg-green-100 text-green-800';
    case 'LOGOUT': return 'bg-gray-100 text-gray-800';
    case 'BUSINESS_CREATED':
    case 'PRODUCT_CREATED': return 'bg-blue-100 text-blue-800';
    case 'BUSINESS_UPDATED':
    case 'PRODUCT_UPDATED': return 'bg-amber-100 text-amber-800';
    case 'ORDER_RECEIVED': return 'bg-green-100 text-green-800';
    case 'REVIEW_RECEIVED': return 'bg-yellow-100 text-yellow-800';
    case 'MESSAGE_SENT': return 'bg-purple-100 text-purple-800';
    case 'BUSINESS_DELETE_SCHEDULED':
    case 'SECURITY_EVENT': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<string>("7d");
  const { user } = useAuth();

  useEffect(() => {
    fetchActivities();
  }, [user, dateRange]);

  useEffect(() => {
    filterActivities();
  }, [activities, filterType, searchTerm]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Appliquer le filtre de date
      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        toast.error("Erreur lors du chargement de l'historique");
        return;
      }

      setActivities(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default: return null;
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    if (filterType !== "all") {
      filtered = filtered.filter(activity => activity.action_type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const exportData = () => {
    const csvData = filteredActivities.map(activity => ({
      Date: new Date(activity.created_at).toLocaleString('fr-FR'),
      Type: activity.action_type,
      Description: activity.action_description,
      Détails: JSON.stringify(activity.metadata || {})
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activite_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Historique exporté avec succès");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "À l'instant";
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Journal de Bord
          </CardTitle>
          <Button size="sm" variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'historique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-8">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="LOGIN">Connexions</SelectItem>
              <SelectItem value="BUSINESS_CREATED">Entreprise</SelectItem>
              <SelectItem value="PRODUCT_CREATED">Produits</SelectItem>
              <SelectItem value="ORDER_RECEIVED">Commandes</SelectItem>
              <SelectItem value="REVIEW_RECEIVED">Avis</SelectItem>
              <SelectItem value="SECURITY_EVENT">Sécurité</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32 h-8">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">24h</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">3 mois</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune activité trouvée</p>
              <p className="text-sm">Vos actions apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(activity.action_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getActionColor(activity.action_type)}>
                          {activity.action_type.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      {activity.action_description}
                    </p>
                    
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-2">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium">{key}:</span>
                            <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
