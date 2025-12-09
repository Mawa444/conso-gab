import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const CreateCatalogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { businessId } = useParams<{ businessId: string }>();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    visibility: "published",
    price_type: "fixed",
    base_price: "",
    delivery_available: false,
    delivery_cost: ""
  });

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setImageUrls(prev => [...prev, url]);
    });
  };

  const uploadImages = async (catalogId: string) => {
    const uploadPromises = images.map(async (file, index) => {
      try {
        // Call initiate-upload edge function
        const response = await supabase.functions.invoke('initiate-upload', {
          body: {
            file_name: file.name,
            file_type: file.type,
            entity_type: 'catalog',
            entity_id: catalogId
          }
        });

        if (response.error) throw response.error;

        const { upload_url } = response.data;

        // Upload file to signed URL
        const uploadResponse = await fetch(upload_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });

        if (!uploadResponse.ok) throw new Error('Upload failed');

        return { success: true, index };
      } catch (error) {
        console.error('Image upload error:', error);
        return { success: false, index, error };
      }
    });

    await Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !businessId) {
      toast({
        title: "Erreur",
        description: "ID d'entreprise manquant",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Vérifier que l'utilisateur a accès à ce business
      const { data: business, error: businessError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (businessError || !business) {
        throw new Error('Vous n\'avez pas accès à cette entreprise');
      }

      // Create catalog
      const { data: catalog, error: catalogError } = await supabase
        .from('catalogs')
        .insert({
          business_id: businessId,
          name: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          visibility: formData.visibility,
          price_type: formData.price_type,
          base_price: formData.base_price ? parseFloat(formData.base_price) : null,
          delivery_available: formData.delivery_available,
          delivery_cost: formData.delivery_cost ? parseFloat(formData.delivery_cost) : 0,
          is_public: formData.visibility === 'published',
          is_active: true
        })
        .select()
        .single();

      if (catalogError) throw catalogError;

      // Upload images if any
      if (images.length > 0) {
        await uploadImages(catalog.id);
      }

      toast({
        title: "Succès",
        description: "Catalogue créé avec succès"
      });

      navigate(`/business/${businessId}/profile?tab=catalog`);

    } catch (error) {
      console.error('Error creating catalog:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-accent/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-gaboma-gradient">Créer un Catalogue</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du catalogue</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Produits électroniques, Services de coiffure..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre catalogue..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alimentaire">Alimentaire</SelectItem>
                      <SelectItem value="electronique">Électronique</SelectItem>
                      <SelectItem value="vetements">Vêtements</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="beaute">Beauté</SelectItem>
                      <SelectItem value="maison">Maison</SelectItem>
                      <SelectItem value="auto">Automobile</SelectItem>
                      <SelectItem value="autres">Autres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility">Visibilité</Label>
                  <Select value={formData.visibility} onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Public</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Tarification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_type">Type de prix</Label>
                  <Select value={formData.price_type} onValueChange={(value) => setFormData(prev => ({ ...prev, price_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Prix fixe</SelectItem>
                      <SelectItem value="variable">Prix variable</SelectItem>
                      <SelectItem value="negotiable">Négociable</SelectItem>
                      <SelectItem value="free">Gratuit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.price_type === 'fixed' && (
                  <div>
                    <Label htmlFor="base_price">Prix de base (FCFA)</Label>
                    <Input
                      id="base_price"
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="delivery"
                  checked={formData.delivery_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_available: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="delivery">Livraison disponible</Label>
              </div>

              {formData.delivery_available && (
                <div>
                  <Label htmlFor="delivery_cost">Coût de livraison (FCFA)</Label>
                  <Input
                    id="delivery_cost"
                    type="number"
                    value={formData.delivery_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_cost: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="images">Ajouter des images</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('imageInput')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir des images
                  </Button>
                  <input
                    id="imageInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
                
                {imageUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1"
            >
              {loading ? "Création..." : "Créer le catalogue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCatalogPage;
