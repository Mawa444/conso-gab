import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Eye, Trash2, Package, Loader2 } from 'lucide-react';

interface Catalog {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  products?: { count: number }[];
}

interface CatalogManagerProps {
  businessId?: string;
}

export const CatalogManager = ({ businessId }: CatalogManagerProps) => {
  const { toast } = useToast();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
    is_active: true,
  });

  useEffect(() => {
    if (businessId) {
      fetchCatalogs();
    }
  }, [businessId]);

  const fetchCatalogs = async () => {
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select(`
          *,
          products(count)
        `)
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCatalogs(data || []);
    } catch (error: any) {
      console.error('Error fetching catalogs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les catalogues",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setIsSubmitting(true);

    try {
      if (editingCatalog) {
        // Update existing catalog
        const { error } = await supabase
          .from('catalogs')
          .update(formData)
          .eq('id', editingCatalog.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Catalogue mis à jour avec succès",
        });
      } else {
        // Create new catalog
        const { error } = await supabase
          .from('catalogs')
          .insert({
            ...formData,
            business_id: businessId,
            display_order: catalogs.length,
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Catalogue créé avec succès",
        });
      }

      setFormData({
        name: '',
        description: '',
        is_public: true,
        is_active: true,
      });
      setShowCreateDialog(false);
      setEditingCatalog(null);
      fetchCatalogs();
    } catch (error: any) {
      console.error('Error saving catalog:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catalog: Catalog) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce catalogue ?')) return;

    try {
      const { error } = await supabase
        .from('catalogs')
        .delete()
        .eq('id', catalog.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Catalogue supprimé avec succès",
      });
      fetchCatalogs();
    } catch (error: any) {
      console.error('Error deleting catalog:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le catalogue",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setFormData({
      name: catalog.name,
      description: catalog.description || '',
      is_public: catalog.is_public,
      is_active: catalog.is_active,
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_public: true,
      is_active: true,
    });
    setEditingCatalog(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des catalogues</h2>
        <Dialog 
          open={showCreateDialog} 
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau catalogue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCatalog ? 'Modifier le catalogue' : 'Créer un nouveau catalogue'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catalog-name">Nom du catalogue *</Label>
                <Input
                  id="catalog-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="catalog-description">Description</Label>
                <Textarea
                  id="catalog-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="catalog-public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="catalog-public">Catalogue public</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="catalog-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="catalog-active">Catalogue actif</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingCatalog ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : (
                    editingCatalog ? 'Mettre à jour' : 'Créer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {catalogs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun catalogue</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier catalogue pour organiser vos produits
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un catalogue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <Card key={catalog.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{catalog.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Badge variant={catalog.is_active ? "default" : "secondary"}>
                      {catalog.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <Badge variant={catalog.is_public ? "default" : "secondary"}>
                      {catalog.is_public ? "Public" : "Privé"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {catalog.description || "Aucune description"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {catalog.products?.[0]?.count || 0} produits
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(catalog)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(catalog)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};