import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  MessageSquare, 
  ExternalLink, 
  Plus,
  Eye,
  Edit,
  Archive
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CatalogWithOrigin {
  id: string;
  name: string;
  description?: string;
  category?: string;
  visibility: string;
  created_at: string;
  business_id: string;
  metadata?: any;
  // Interconnectivity data
  origin_conversation_id?: string;
  origin_conversation_title?: string;
  products_count?: number;
}

interface CatalogInventoryIntegrationProps {
  businessId: string;
  showConversationLinks?: boolean;
}

export const CatalogInventoryIntegration = ({ 
  businessId, 
  showConversationLinks = true 
}: CatalogInventoryIntegrationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState<CatalogWithOrigin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchCatalogs();
    }
  }, [businessId]);

  const fetchCatalogs = async () => {
    try {
      // Fetch catalogs with basic info (avoiding metadata column issue)
      const { data: catalogsData, error: catalogsError } = await supabase
        .from('catalogs')
        .select('id, name, description, category, visibility, created_at, business_id')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (catalogsError) throw catalogsError;

      // Get product counts separately
      const catalogIds = catalogsData?.map(c => c.id) || [];
      let productCounts: Record<string, number> = {};
      
      if (catalogIds.length > 0) {
        const { data: productData } = await supabase
          .from('product')
          .select('catalog_id')
          .in('catalog_id', catalogIds);
        
        productCounts = productData?.reduce((acc, p) => {
          acc[p.catalog_id] = (acc[p.catalog_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
      }

      // Fetch interconnectivity tracking data (simplified)
      const { data: trackingData } = await supabase
        .from('action_tracking')
        .select('target_entity_id, source_entity_id, metadata')
        .eq('action_type', 'create_catalog_from_messaging')
        .in('target_entity_id', catalogIds);

      // Get conversation titles separately
      const conversationIds = trackingData?.map(t => t.source_entity_id).filter(Boolean) || [];
      let conversationTitles: Record<string, string> = {};
      
      if (conversationIds.length > 0) {
        const { data: conversationData } = await supabase
          .from('conversations')
          .select('id, title')
          .in('id', conversationIds);
        
        conversationTitles = conversationData?.reduce((acc, c) => {
          acc[c.id] = c.title || '';
          return acc;
        }, {} as Record<string, string>) || {};
      }

      // Merge data
      const enrichedCatalogs = catalogsData?.map(catalog => {
        const tracking = trackingData?.find(t => t.target_entity_id === catalog.id);
        
        return {
          ...catalog,
          products_count: productCounts[catalog.id] || 0,
          origin_conversation_id: tracking?.source_entity_id,
          origin_conversation_title: tracking?.source_entity_id ? conversationTitles[tracking.source_entity_id] : undefined
        };
      }) || [];

      setCatalogs(enrichedCatalogs);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'inventaire des catalogues",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCatalog = (catalogId: string) => {
    navigate(`/business/catalog/${catalogId}`);
  };

  const handleEditCatalog = (catalogId: string) => {
    navigate(`/business/catalog/${catalogId}/edit`);
  };

  const handleGoToConversation = (conversationId: string) => {
    navigate(`/messaging/conversation/${conversationId}`);
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'published': return 'bg-green-500/10 text-green-600';
      case 'draft': return 'bg-yellow-500/10 text-yellow-600';
      case 'archived': return 'bg-gray-500/10 text-gray-600';
      default: return 'bg-blue-500/10 text-blue-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventaire des catalogues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
            <p className="text-muted-foreground">Chargement des catalogues...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventaire des catalogues
            <Badge variant="secondary" className="ml-2">
              {catalogs.length}
            </Badge>
          </CardTitle>
          
          <Button 
            size="sm" 
            onClick={() => navigate('/business/create-catalog')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {catalogs.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <Package className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-medium">Aucun catalogue</h3>
              <p className="text-sm text-muted-foreground">
                Créez votre premier catalogue pour commencer
              </p>
            </div>
            <Button onClick={() => navigate('/business/create-catalog')}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un catalogue
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {catalogs.map((catalog) => (
                <div
                  key={catalog.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">
                          {catalog.name}
                        </h3>
                        <Badge className={getVisibilityColor(catalog.visibility)}>
                          {catalog.visibility}
                        </Badge>
                        
                        {catalog.origin_conversation_id && showConversationLinks && (
                          <Badge 
                            variant="outline" 
                            className="gap-1 cursor-pointer hover:bg-accent"
                            onClick={() => handleGoToConversation(catalog.origin_conversation_id!)}
                          >
                            <MessageSquare className="w-3 h-3" />
                            Depuis messagerie
                          </Badge>
                        )}
                      </div>
                      
                      {catalog.description && (
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {catalog.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📦 {catalog.products_count} produits</span>
                        <span>📅 {formatDate(catalog.created_at)}</span>
                        {catalog.category && (
                          <span>🏷️ {catalog.category}</span>
                        )}
                      </div>
                      
                      {catalog.origin_conversation_title && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground">
                            💬 Créé depuis: "{catalog.origin_conversation_title}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCatalog(catalog.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCatalog(catalog.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {catalog.origin_conversation_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGoToConversation(catalog.origin_conversation_id!)}
                          className="h-8 w-8 p-0"
                          title="Aller à la conversation d'origine"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
