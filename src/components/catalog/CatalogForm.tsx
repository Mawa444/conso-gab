/**
 * Formulaire de création/édition de catalogue
 * Simple, robuste, connecté à Supabase
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Package, Store, X, Plus, Loader2 } from 'lucide-react';
import { useCatalogs, CatalogFormData, Catalog } from '@/hooks/use-catalogs';
import { businessCategories } from '@/data/businessCategories';

interface CatalogFormProps {
  businessId: string;
  catalog?: Catalog; // Si fourni = mode édition
  onSuccess?: (catalog: Catalog) => void;
  onCancel?: () => void;
}

export const CatalogForm = ({ businessId, catalog, onSuccess, onCancel }: CatalogFormProps) => {
  const navigate = useNavigate();
  const { createCatalog, updateCatalog, isCreating, isUpdating } = useCatalogs(businessId);
  const isEditing = !!catalog;
  const isLoading = isCreating || isUpdating;

  // Form state
  const [formData, setFormData] = useState<CatalogFormData>({
    name: catalog?.name || '',
    description: catalog?.description || '',
    category: catalog?.category || '',
    subcategory: catalog?.subcategory || '',
    catalog_type: catalog?.catalog_type || 'products',
    is_public: catalog?.is_public || false,
    min_price: catalog?.min_price || undefined,
    max_price: catalog?.max_price || undefined,
    price_type: catalog?.price_type || 'fixed',
    price_currency: catalog?.price_currency || 'XAF',
    delivery_available: catalog?.delivery_available || false,
    delivery_cost: catalog?.delivery_cost || undefined,
    keywords: catalog?.keywords || []
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get selected category for subcategories
  const selectedCategory = businessCategories.find(cat => cat.nom === formData.category);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du catalogue est requis';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add keyword
  const addKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase();
    if (keyword && !formData.keywords?.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keyword]
      }));
      setNewKeyword('');
    }
  };

  // Remove keyword
  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      let result: Catalog;
      
      if (isEditing && catalog) {
        result = await updateCatalog({ id: catalog.id, updates: formData });
      } else {
        result = await createCatalog(formData);
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Erreur formulaire catalogue:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {formData.catalog_type === 'products' ? (
                  <Package className="w-5 h-5" />
                ) : (
                  <Store className="w-5 h-5" />
                )}
                {isEditing ? 'Modifier le catalogue' : 'Nouveau catalogue'}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Modifiez les informations de votre catalogue'
                  : 'Créez un catalogue pour organiser vos produits ou services'
                }
              </CardDescription>
            </div>
            {onCancel && (
              <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Type de catalogue */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, catalog_type: 'products' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.catalog_type === 'products' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="font-medium">Produits</p>
              <p className="text-xs text-muted-foreground">Articles physiques</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, catalog_type: 'services' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.catalog_type === 'services' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Store className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="font-medium">Services</p>
              <p className="text-xs text-muted-foreground">Prestations</p>
            </button>
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du catalogue *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Nouveautés 2024, Menu du jour..."
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre catalogue..."
                rows={3}
              />
            </div>
          </div>

          {/* Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  category: value,
                  subcategory: '' // Reset subcategory
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nom}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.nom}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <div className="space-y-2">
                <Label>Sous-catégorie</Label>
                <Select 
                  value={formData.subcategory || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une sous-catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory.subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.nom}>
                        {sub.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Prix */}
          <div className="space-y-4">
            <Label>Tarification</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Type de prix</Label>
                <Select 
                  value={formData.price_type || 'fixed'} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, price_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Prix fixe</SelectItem>
                    <SelectItem value="range">Fourchette</SelectItem>
                    <SelectItem value="quote">Sur devis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.price_type !== 'quote' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {formData.price_type === 'range' ? 'Prix minimum' : 'Prix'}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.min_price || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        min_price: e.target.value ? Number(e.target.value) : undefined 
                      }))}
                      placeholder="0"
                    />
                  </div>

                  {formData.price_type === 'range' && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Prix maximum</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.max_price || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          max_price: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                        placeholder="0"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Livraison */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Livraison disponible</Label>
                <p className="text-xs text-muted-foreground">
                  Proposez la livraison pour ce catalogue
                </p>
              </div>
              <Switch
                checked={formData.delivery_available || false}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  delivery_available: checked 
                }))}
              />
            </div>

            {formData.delivery_available && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Frais de livraison (XAF)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.delivery_cost || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    delivery_cost: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Mots-clés */}
          <div className="space-y-4">
            <Label>Mots-clés (pour le référencement)</Label>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Ajouter un mot-clé..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <Button type="button" variant="outline" onClick={addKeyword}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.keywords && formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibilité */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label>Publier le catalogue</Label>
              <p className="text-xs text-muted-foreground">
                Rendez ce catalogue visible par tous les utilisateurs
              </p>
            </div>
            <Switch
              checked={formData.is_public || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => navigate(-1))}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Annuler
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? 'Modification...' : 'Création...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Enregistrer' : 'Créer le catalogue'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
