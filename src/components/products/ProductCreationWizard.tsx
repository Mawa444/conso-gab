import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { X, Plus, Upload, Package, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { businessCategories } from "@/data/businessCategories";
import { toast } from "sonner";

interface ProductWizardProps {
  catalogId?: string;
  onComplete?: (productData: any) => void;
  onCancel?: () => void;
}

export const ProductCreationWizard = ({ catalogId, onComplete, onCancel }: ProductWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    images: [] as string[],
    tags: [] as string[],
    stock: "",
    sku: "",
    variants: [] as any[],
    isActive: true
  });

  const [newTag, setNewTag] = useState("");

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData("tags", formData.tags.filter(tag => tag !== tagToRemove));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Simuler la création du produit
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Produit créé avec succès !");
      onComplete?.(formData);
    } catch (error) {
      toast.error("Erreur lors de la création du produit");
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim();
      case 2:
        return formData.category && formData.price;
      case 3:
        return true; // Images optionnelles
      case 4:
        return true; // Configuration optionnelle
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold">Informations de base</h2>
              <p className="text-muted-foreground">Décrivez votre produit</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Nom du produit *</Label>
                <Input
                  id="title"
                  placeholder="Ex: T-shirt coton bio"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre produit en détail..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="sku">Référence (SKU)</Label>
                <Input
                  id="sku"
                  placeholder="Ex: TSH-001"
                  value={formData.sku}
                  onChange={(e) => updateFormData("sku", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold">Prix et catégorie</h2>
              <p className="text-muted-foreground">Définissez les caractéristiques commerciales</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (FCFA) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="5000"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock disponible</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="10"
                  value={formData.stock}
                  onChange={(e) => updateFormData("stock", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold">Images du produit</h2>
              <p className="text-muted-foreground">Ajoutez des photos de qualité</p>
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Glissez-déposez vos images ici ou cliquez pour parcourir
              </p>
              <p className="text-xs text-muted-foreground">
                Formats acceptés: JPG, PNG, WebP (max 5MB par image)
              </p>
              <Button variant="outline" className="mt-4">
                Choisir des fichiers
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square bg-muted rounded-lg">
                    <img src={image} alt={`Produit ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        updateFormData("images", newImages);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold">Configuration finale</h2>
              <p className="text-muted-foreground">Ajoutez des tags et finalisez</p>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Ajouter un tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Produit:</strong> {formData.title}</div>
                <div><strong>Prix:</strong> {formData.price} FCFA</div>
                <div><strong>Catégorie:</strong> {businessCategories.find(c => c.id === formData.category)?.nom}</div>
                <div><strong>Stock:</strong> {formData.stock || "Non spécifié"}</div>
                <div><strong>Tags:</strong> {formData.tags.length > 0 ? formData.tags.join(", ") : "Aucun"}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Nouveau produit
          </CardTitle>
          <Badge variant="outline">
            Étape {currentStep}/{totalSteps}
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {renderStep()}

          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="flex-1"
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Création..." : "Créer le produit"}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};