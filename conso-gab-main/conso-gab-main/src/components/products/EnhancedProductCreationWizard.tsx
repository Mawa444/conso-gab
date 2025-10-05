import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Package, Tags, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MultiImageEnforcer } from "../catalog/MultiImageEnforcer";
import { useProductManagement } from "@/hooks/use-product-management";
import { useCatalogManagement } from "@/hooks/use-catalog-management";

interface ImageData {
  url: string;
  path: string;
  id: string;
}

interface ProductData {
  images: ImageData[];
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  stock_quantity: number;
  sku: string;
  tags: string[];
  catalog_id: string;
  condition: "new" | "used" | "refurbished";
  variants: { name: string; options: string[] }[];
}

interface EnhancedProductCreationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  businessId: string;
  businessCategory: string;
  selectedProductId?: string;
  preSelectedCatalogId?: string;
}

export const EnhancedProductCreationWizard = ({ 
  onComplete, 
  onCancel, 
  businessId,
  businessCategory,
  selectedProductId,
  preSelectedCatalogId
}: EnhancedProductCreationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState<ProductData>({
    images: [],
    name: "",
    description: "",
    price: 0,
    sale_price: null,
    is_on_sale: false,
    stock_quantity: 0,
    sku: "",
    tags: [],
    catalog_id: preSelectedCatalogId || "",
    condition: "new",
    variants: []
  });
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();
  
  const { createProduct, updateProduct, isCreating, isUpdating } = useProductManagement(businessId);
  const { catalogs } = useCatalogManagement(businessId);

  const progress = (currentStep / 4) * 100;
  const isEditing = !!selectedProductId;
  const isSubmitting = isCreating || isUpdating;

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (productData.images.length < 4) {
          toast({
            title: "Images manquantes",
            description: "Au minimum 4 images sont requises pour un produit",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!productData.name.trim()) {
          toast({
            title: "Nom obligatoire",
            description: "Veuillez saisir un nom pour votre produit",
            variant: "destructive"
          });
          return false;
        }
        if (!productData.catalog_id) {
          toast({
            title: "Catalogue obligatoire",
            description: "Veuillez sélectionner un catalogue",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        if (productData.price <= 0) {
          toast({
            title: "Prix obligatoire",
            description: "Veuillez saisir un prix valide",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !productData.tags.includes(tagInput.trim().toLowerCase())) {
      setProductData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImagesChanged = (images: ImageData[]) => {
    setProductData(prev => ({ ...prev, images }));
  };

  const handleComplete = async () => {
    if (!validateStep()) return;
    
    try {
      const productPayload = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        sale_price: productData.is_on_sale ? productData.sale_price : null,
        is_on_sale: productData.is_on_sale,
        stock_quantity: productData.stock_quantity,
        sku: productData.sku,
        tags: productData.tags,
        catalog_id: productData.catalog_id,
        images: productData.images.map(img => img.url),
        business_id: businessId
      };

      if (isEditing) {
        await updateProduct({ 
          id: selectedProductId, 
          updates: productPayload 
        });
      } else {
        await createProduct(productPayload);
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Étape {currentStep} sur 4 - {
                  ["Images", "Informations", "Prix & Stock", "Finalisation"][currentStep - 1]
                }
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Annuler
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Étape 1: Images */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Images du produit</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des images de qualité pour présenter votre produit
                </p>
              </div>

              <MultiImageEnforcer
                onImagesChanged={handleImagesChanged}
                bucket="product-images"
                folder="products"
                currentImages={productData.images}
                minImages={4}
                maxImages={8}
                label="Images du produit (minimum 4 images) *"
                description="Format 16:9 automatique, max 2MB chacune"
              />
            </div>
          )}

          {/* Étape 2: Informations */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Tags className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Informations du produit</h3>
                <p className="text-sm text-muted-foreground">
                  Décrivez votre produit avec précision
                </p>
              </div>

              {/* Catalogue */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Catalogue <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={productData.catalog_id}
                  onValueChange={(value) => setProductData(prev => ({ ...prev, catalog_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un catalogue" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogs.map(catalog => (
                      <SelectItem key={catalog.id} value={catalog.id}>
                        {catalog.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nom du produit */}
              <div className="space-y-2">
                <Label htmlFor="product-name" className="text-base font-medium">
                  Nom du produit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="product-name"
                  placeholder="Ex: Chemise en coton bleu ciel"
                  value={productData.name}
                  onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="product-description" className="text-base font-medium">
                  Description
                </Label>
                <Textarea
                  id="product-description"
                  placeholder="Décrivez les caractéristiques, matériaux, dimensions..."
                  value={productData.description}
                  onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* État */}
              <div className="space-y-3">
                <Label className="text-base font-medium">État du produit</Label>
                <RadioGroup
                  value={productData.condition}
                  onValueChange={(value) => setProductData(prev => ({ 
                    ...prev, 
                    condition: value as ProductData["condition"] 
                  }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">Neuf</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="used" id="used" />
                    <Label htmlFor="used">Occasion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="refurbished" id="refurbished" />
                    <Label htmlFor="refurbished">Reconditionné</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Étape 3: Prix & Stock */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Prix et disponibilité</h3>
                <p className="text-sm text-muted-foreground">
                  Définissez le prix et la quantité disponible
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prix */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-medium">
                    Prix (FCFA) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="15000"
                    value={productData.price || ''}
                    onChange={(e) => setProductData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-base font-medium">
                    Stock disponible
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="10"
                    value={productData.stock_quantity || ''}
                    onChange={(e) => setProductData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Promotion */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_on_sale"
                    checked={productData.is_on_sale}
                    onChange={(e) => setProductData(prev => ({ ...prev, is_on_sale: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_on_sale">Ce produit est en promotion</Label>
                </div>
                
                {productData.is_on_sale && (
                  <div className="space-y-2">
                    <Label htmlFor="sale_price" className="text-base font-medium">
                      Prix promotionnel (FCFA)
                    </Label>
                    <Input
                      id="sale_price"
                      type="number"
                      placeholder="12000"
                      value={productData.sale_price || ''}
                      onChange={(e) => setProductData(prev => ({ ...prev, sale_price: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-base font-medium">
                  Référence (SKU) - optionnel
                </Label>
                <Input
                  id="sku"
                  placeholder="Ex: CH-BLU-001"
                  value={productData.sku}
                  onChange={(e) => setProductData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Étape 4: Finalisation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Check className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Finalisation</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des mots-clés pour améliorer la recherche
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Mots-clés (recommandé)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ajoutez des mots que vos clients utiliseraient pour chercher ce produit
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: coton, bleu, chemise, homme..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} disabled={!tagInput.trim()}>
                    Ajouter
                  </Button>
                </div>
                
                {productData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {productData.tags.map(tag => (
                      <Badge 
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Résumé */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Résumé du produit</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Nom :</strong> {productData.name}</div>
                  <div><strong>Prix :</strong> {productData.price} FCFA {productData.is_on_sale && `(Promo: ${productData.sale_price} FCFA)`}</div>
                  <div><strong>Stock :</strong> {productData.stock_quantity}</div>
                  <div><strong>Images :</strong> {productData.images.length}</div>
                  <div><strong>État :</strong> {
                    productData.condition === 'new' ? 'Neuf' : 
                    productData.condition === 'used' ? 'Occasion' : 'Reconditionné'
                  }</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <div className="flex gap-2">
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer le produit')}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};