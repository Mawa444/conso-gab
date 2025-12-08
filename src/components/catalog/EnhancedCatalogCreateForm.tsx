import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTrackAction } from '@/components/business/InterconnectivityTracker';
import { CatalogCreationWizard } from './CatalogCreationWizard';
import { useCreateCatalog } from '@/hooks/use-create-catalog';

interface EnhancedCatalogCreateFormProps {
  businessId: string;
  conversationId?: string; // For interconnectivity
  onCancel?: () => void;
  onCreated?: (catalogId?: string) => void;
  isModal?: boolean;
  prefillData?: {
    name?: string;
    description?: string;
    category?: string;
  };
}

export const EnhancedCatalogCreateForm = ({ 
  businessId, 
  conversationId,
  onCancel, 
  onCreated, 
  isModal = false,
  prefillData 
}: EnhancedCatalogCreateFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackAction } = useTrackAction();
  const { createCatalog, isCreating } = useCreateCatalog();
  const [showWizard, setShowWizard] = useState(false);
  const [quickCreateMode, setQuickCreateMode] = useState(false);
  
  // Quick create form state
  const [formData, setFormData] = useState({
    name: prefillData?.name || '',
    description: prefillData?.description || '',
    category: prefillData?.category || ''
  });
  const [loading, setLoading] = useState(false);

  const handleOpenWizard = () => setShowWizard(true);
  const handleCloseWizard = () => setShowWizard(false);

  const handleWizardCompleted = (catalogId?: string) => {
    setShowWizard(false);
    
    // Track interconnectivity
    if (conversationId && catalogId) {
      trackAction({
        actionType: 'create_catalog_from_messaging',
        sourceEntityType: 'conversation',
        sourceEntityId: conversationId,
        targetEntityType: 'catalog',
        targetEntityId: catalogId,
        metadata: {
          business_id: businessId,
          creation_method: 'wizard'
        }
      });
    }
    
    onCreated?.(catalogId);
  };

  const handleQuickCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du catalogue est requis",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setLoading(true);
    try {
      const catalog = await createCatalog({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isPublic: false,
        // Default values for quick create
        catalog_type: 'products',
        visibility: 'draft'
      });

      if (!catalog?.id) throw new Error("Erreur lors de la création");

      // Track interconnectivity
      if (conversationId) {
        await trackAction({
          actionType: 'create_catalog_from_messaging',
          sourceEntityType: 'conversation',
          sourceEntityId: conversationId,
          targetEntityType: 'catalog',
          targetEntityId: catalog.id,
          metadata: {
            business_id: businessId,
            creation_method: 'quick_create',
            catalog_name: formData.name
          }
        });

        // Send message to conversation about catalog creation
        await supabase.functions.invoke('send-message', {
          body: {
            conversation_id: conversationId,
            message_type: 'system',
            content: `📋 Catalogue "${formData.name}" créé avec succès ! Il est maintenant disponible dans votre inventaire business.`,
            content_json: {
              action_type: 'catalog_created',
              catalog_id: catalog.id,
              catalog_name: formData.name
            }
          }
        });
      }

      onCreated?.(catalog.id);
    } catch (error) {
      console.error('Error creating catalog:', error);
      // Toast is already handled by the hook for success/error
      if (!isCreating) { // Fallback if hook didn't catch it
        toast({
          title: "Erreur",
          description: "Impossible de créer le catalogue",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (isModal) {
    return (
      <>
        <div className="flex gap-2">
          <Button 
            onClick={() => setQuickCreateMode(true)} 
            variant="outline"
            className="flex-1"
          >
            Création rapide
          </Button>
          <Button 
            onClick={handleOpenWizard}
            className="flex-1"
          >
            Assistant complet
          </Button>
        </div>
        
        {/* Quick Create Modal */}
        <Dialog open={quickCreateMode} onOpenChange={setQuickCreateMode}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Création rapide de catalogue
                {conversationId && (
                  <Badge variant="secondary" className="text-xs">
                    Depuis messagerie
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom du catalogue *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Menu du jour, Produits disponibles..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description courte du catalogue..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Restaurant, Mode, Services..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setQuickCreateMode(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleQuickCreate}
                  disabled={loading || !formData.name.trim()}
                  className="flex-1"
                >
                  {loading ? "Création..." : "Créer le catalogue"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Full Wizard */}
        <Dialog open={showWizard} onOpenChange={setShowWizard}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Assistant de création de catalogue
                {conversationId && (
                  <Badge variant="secondary" className="text-xs">
                    Depuis messagerie
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <CatalogCreationWizard
              businessId={businessId}
              onCancel={handleCloseWizard}
              onCompleted={handleWizardCompleted}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <CatalogCreationWizard
      businessId={businessId}
      onCancel={onCancel}
      onCompleted={handleWizardCompleted}
    />
  );
};
