import { useState, useCallback } from "react";
import { Plus, Upload, Camera, Check, AlertCircle, Sparkles, MapPin, Package, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { categories } from "@/data/mockCommerces";
import { useProductManagement } from "@/hooks/use-product-management";
import { useCatalogManagement } from "@/hooks/use-catalog-management";

interface ProductVariant {
  id: string;
  colorCode: string;
  colorName: string;
  sizeCode: string;
  sizeName: string;
  price: number;
  stock: number;
  sku?: string;
}

interface ProductFormData {
  title: string;
  description: string;
  brand: string;
  categoryId: string;
  subcategoryId: string;
  tags: string[];
  variants: ProductVariant[];
  attributes: Record<string, string>;
  images: string[];
  condition: string;
  mainColor: string;
  secondaryColors: string[];
  dimensions: {
    length: string;
    width: string;
    height: string;
    weight: string;
  };
  manufacturer: string;
  manufacturingDate: string;
  expirationDate: string;
  distinguishingFeatures: string;
  pickupLocation: {
    address: string;
    city: string;
    district: string;
  };
  deliveryZone: string;
  availability: string;
  minOrderQuantity: number;
  maxOrderQuantity: number;
}

const subcategories = {
  "vetements": [
    { id: "tshirts", name: "T-shirts", keywords: ["t-shirt", "tee-shirt", "manches courtes"] },
    { id: "chemises", name: "Chemises", keywords: ["chemise", "chemisier", "manches longues"] },
    { id: "pantalons", name: "Pantalons", keywords: ["pantalon", "jean", "jogging"] },
    { id: "robes", name: "Robes", keywords: ["robe", "robe d'été"] },
    { id: "vestes", name: "Vestes", keywords: ["veste", "blouson", "manteau"] }
  ],
  "chaussures": [
    { id: "sneakers", name: "Sneakers", keywords: ["sneakers", "baskets", "sport"] },
    { id: "sandales", name: "Sandales", keywords: ["sandales", "nu-pieds", "été"] },
    { id: "bottes", name: "Bottes", keywords: ["bottes", "bottines"] },
    { id: "chaussures-ville", name: "Chaussures de ville", keywords: ["ville", "costume", "élégant"] }
  ],
  "electronique": [
    { id: "smartphones", name: "Smartphones", keywords: ["téléphone", "mobile", "smartphone"] },
    { id: "ordinateurs", name: "Ordinateurs", keywords: ["ordinateur", "pc", "laptop"] },
    { id: "accessoires", name: "Accessoires", keywords: ["coque", "chargeur", "écouteurs"] }
  ]
};

const attributeTemplates = {
  "tshirts": {
    required: ["material", "gender", "sleeves", "collar", "fit", "neckline"],
    optional: ["pattern", "care", "origin", "season", "thickness"],
    fields: {
      material: { type: "select", options: ["Coton 100%", "Coton bio", "Polyester", "Coton-Polyester", "Lin", "Modal", "Bambou"] },
      gender: { type: "select", options: ["Homme", "Femme", "Enfant", "Bébé", "Mixte"] },
      sleeves: { type: "select", options: ["Manches courtes", "Manches longues", "Sans manches", "3/4"] },
      collar: { type: "select", options: ["Col rond", "Col V", "Col polo", "Col henley", "Col bateau"] },
      fit: { type: "select", options: ["Slim", "Regular", "Oversize", "Ajusté", "Ample"] },
      neckline: { type: "select", options: ["Standard", "Échancrure profonde", "Ras du cou", "Col montant"] },
      pattern: { type: "select", options: ["Uni", "Rayé", "À pois", "Imprimé", "Brodé", "Logo", "Texte"] },
      care: { type: "text", placeholder: "Ex: Lavage 30°C, Séchage à l'air libre" },
      origin: { type: "text", placeholder: "Pays de fabrication" },
      season: { type: "select", options: ["Printemps-Été", "Automne-Hiver", "Toute saison"] },
      thickness: { type: "select", options: ["Très fin", "Fin", "Standard", "Épais"] }
    }
  },
  "sneakers": {
    required: ["material", "closureType", "soleType", "gender", "sport", "cushioning"],
    optional: ["waterproof", "breathable", "heel", "weight"],
    fields: {
      material: { type: "select", options: ["Cuir", "Cuir synthétique", "Toile", "Mesh", "Daim", "Nubuck", "Textile"] },
      closureType: { type: "select", options: ["Lacets", "Scratch", "Slip-on", "Élastique", "Zip"] },
      soleType: { type: "select", options: ["Caoutchouc", "EVA", "PU", "Gel", "Air", "Foam"] },
      gender: { type: "select", options: ["Homme", "Femme", "Enfant", "Mixte"] },
      sport: { type: "select", options: ["Running", "Basketball", "Tennis", "Football", "Skateboard", "Lifestyle", "Training"] },
      cushioning: { type: "select", options: ["Minimaliste", "Standard", "Maximum", "Réactive"] },
      waterproof: { type: "checkbox", label: "Imperméable" },
      breathable: { type: "checkbox", label: "Respirant" },
      heel: { type: "text", placeholder: "Hauteur du talon en cm" },
      weight: { type: "text", placeholder: "Poids d'une chaussure en grammes" }
    }
  },
  "smartphones": {
    required: ["brand", "model", "storage", "color", "condition", "os"],
    optional: ["screenSize", "battery", "camera", "warranty"],
    fields: {
      brand: { type: "select", options: ["Apple", "Samsung", "Huawei", "Xiaomi", "OnePlus", "Google", "Sony"] },
      model: { type: "text", placeholder: "Ex: iPhone 15 Pro, Galaxy S24" },
      storage: { type: "select", options: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
      color: { type: "text", placeholder: "Couleur exacte du téléphone" },
      condition: { type: "select", options: ["Neuf sous blister", "Neuf déballé", "Comme neuf", "Très bon état", "Bon état", "État moyen"] },
      os: { type: "text", placeholder: "Version du système d'exploitation" },
      screenSize: { type: "text", placeholder: "Taille de l'écran en pouces" },
      battery: { type: "text", placeholder: "Capacité batterie en mAh" },
      camera: { type: "text", placeholder: "Résolution caméra principale" },
      warranty: { type: "text", placeholder: "Durée de garantie restante" }
    }
  },
  "default": {
    required: ["material", "condition", "mainFeatures"],
    optional: ["brand", "model", "warranty"],
    fields: {
      material: { type: "text", placeholder: "Matériau principal" },
      condition: { type: "select", options: ["Neuf", "Comme neuf", "Très bon état", "Bon état", "État moyen", "Pour pièces"] },
      mainFeatures: { type: "textarea", placeholder: "Caractéristiques principales du produit" },
      brand: { type: "text", placeholder: "Marque du produit" },
      model: { type: "text", placeholder: "Modèle/Référence" },
      warranty: { type: "text", placeholder: "Garantie disponible" }
    }
  }
};

const colorOptions = [
  { id: "blue", name: "Bleu", hex: "#3B82F6" },
  { id: "red", name: "Rouge", hex: "#EF4444" },
  { id: "green", name: "Vert", hex: "#10B981" },
  { id: "black", name: "Noir", hex: "#000000" },
  { id: "white", name: "Blanc", hex: "#FFFFFF" },
  { id: "yellow", name: "Jaune", hex: "#F59E0B" },
  { id: "pink", name: "Rose", hex: "#EC4899" },
  { id: "purple", name: "Violet", hex: "#8B5CF6" },
  { id: "orange", name: "Orange", hex: "#F97316" },
  { id: "brown", name: "Marron", hex: "#A3A3A3" },
  { id: "gray", name: "Gris", hex: "#6B7280" },
  { id: "beige", name: "Beige", hex: "#F5F5DC" },
];

const sizeOptions = [
  { id: "2y", name: "2 ans" },
  { id: "3y", name: "3 ans" },
  { id: "4y", name: "4 ans" },
  { id: "5y", name: "5 ans" },
  { id: "xs", name: "XS" },
  { id: "s", name: "S" },
  { id: "m", name: "M" },
  { id: "l", name: "L" },
  { id: "xl", name: "XL" },
  { id: "xxl", name: "XXL" },
  { id: "35", name: "35" },
  { id: "36", name: "36" },
  { id: "37", name: "37" },
  { id: "38", name: "38" },
  { id: "39", name: "39" },
  { id: "40", name: "40" },
  { id: "41", name: "41" },
  { id: "42", name: "42" },
  { id: "43", name: "43" },
  { id: "44", name: "44" },
  { id: "45", name: "45" },
];

interface EnhancedProductCreationWizardProps {
  onComplete: (productData: ProductFormData) => void;
  onCancel: () => void;
  businessCategory?: string;
  businessId: string;
}

export const EnhancedProductCreationWizard = ({ onComplete, onCancel, businessCategory, businessId }: EnhancedProductCreationWizardProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    brand: "",
    categoryId: "",
    subcategoryId: "",
    tags: [],
    variants: [],
    attributes: {},
    images: [],
    condition: "",
    mainColor: "",
    secondaryColors: [],
    dimensions: {
      length: "",
      width: "",
      height: "",
      weight: ""
    },
    manufacturer: "",
    manufacturingDate: "",
    expirationDate: "",
    distinguishingFeatures: "",
    pickupLocation: {
      address: "",
      city: "",
      district: ""
    },
    deliveryZone: "",
    availability: "",
    minOrderQuantity: 1,
    maxOrderQuantity: 999
  });

  const [qualityScore, setQualityScore] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [mandatoryFieldsErrors, setMandatoryFieldsErrors] = useState<string[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");

  // Real data hooks
  const { catalogs, isLoading: isLoadingCatalogs } = useCatalogManagement(businessId);
  const { createProduct, isCreating } = useProductManagement(businessId);

  // Calcul du score qualité ultra-détaillé
  const calculateQualityScore = useCallback((data: ProductFormData) => {
    let score = 0;
    
    // Titre (15 points)
    if (data.title.length >= 15 && data.title.includes(data.mainColor)) score += 15;
    else if (data.title.length >= 10) score += 10;
    else if (data.title.length >= 5) score += 5;
    
    // Description (15 points)
    if (data.description.length >= 100) score += 15;
    else if (data.description.length >= 50) score += 10;
    else if (data.description.length >= 20) score += 5;
    
    // Catégorie et sous-catégorie (10 points)
    if (data.categoryId && data.subcategoryId) score += 10;
    else if (data.categoryId) score += 5;
    
    // Images (20 points)
    if (data.images.length >= 5) score += 20;
    else if (data.images.length >= 3) score += 15;
    else if (data.images.length >= 1) score += 8;
    
    // État/Condition (5 points)
    if (data.condition) score += 5;
    
    // Couleurs (10 points)
    if (data.mainColor && data.secondaryColors.length > 0) score += 10;
    else if (data.mainColor) score += 5;
    
    // Dimensions (10 points)
    const dimensionsFilled = Object.values(data.dimensions).filter(d => d.trim() !== "").length;
    score += (dimensionsFilled / 4) * 10;
    
    // Localisation (10 points)
    if (data.pickupLocation.address && data.pickupLocation.city && data.pickupLocation.district) score += 10;
    else if (data.pickupLocation.city && data.pickupLocation.district) score += 7;
    else if (data.pickupLocation.city) score += 3;
    
    // Disponibilité et zone (5 points)
    if (data.availability && data.deliveryZone) score += 5;
    else if (data.availability || data.deliveryZone) score += 2;
    
    return Math.min(score, 100);
  }, []);

  const updateFormData = (updates: Partial<ProductFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    setQualityScore(calculateQualityScore(newData));
  };

  const validateStep = (stepNumber: number): boolean => {
    const errors: string[] = [];
    
    switch (stepNumber) {
      case 1:
        if (!formData.categoryId) errors.push("Vous devez sélectionner une catégorie");
        break;
      case 2:
        if (!formData.subcategoryId) errors.push("Vous devez sélectionner une sous-catégorie");
        break;
      case 3:
        if (formData.title.length < 10) errors.push("Le titre doit contenir au moins 10 caractères");
        if (formData.description.length < 50) errors.push("La description doit contenir au moins 50 caractères");
        break;
      case 4:
        if (formData.images.length === 0) errors.push("Vous devez ajouter au moins une image");
        break;
      case 5:
        if (!formData.condition) errors.push("Vous devez préciser l'état du produit");
        if (!formData.mainColor) errors.push("Vous devez indiquer la couleur principale");
        break;
      case 6:
        if (!formData.dimensions.length || !formData.dimensions.width) {
          errors.push("Vous devez renseigner au moins la longueur et la largeur");
        }
        break;
        case 8:
          if (!formData.pickupLocation.city) errors.push("Vous devez indiquer la ville de retrait");
          if (!formData.pickupLocation.district) errors.push("Vous devez indiquer le quartier de retrait");
          if (!formData.availability) errors.push("Vous devez indiquer le délai de disponibilité");
          break;
    }
    
    setMandatoryFieldsErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    updateFormData({ images: [...formData.images, ...newImages] });
    
    // Simulation de suggestions IA plus poussées
    setTimeout(() => {
      setAiSuggestions([
        "✅ Couleur détectée: Bleu clair",
        "✅ Type: T-shirt col rond",
        "✅ Matière suggérée: Coton",
        "⚠️ Ajoutez plus d'angles pour améliorer la visibilité",
        "💡 Photo sur fond blanc recommandée"
      ]);
    }, 1000);
  };

  const getSubcategories = () => {
    return subcategories[formData.categoryId as keyof typeof subcategories] || [];
  };

  const getAttributeTemplate = () => {
    return attributeTemplates[formData.subcategoryId as keyof typeof attributeTemplates] || attributeTemplates.default;
  };

  const canPublish = qualityScore >= 80;
  const maxSteps = 10;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête avec score qualité amélioré */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Assistant intelligent de création de produit
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Étape {step} sur {maxSteps} - Plus vous renseignez, mieux votre produit sera trouvé !
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-primary">{qualityScore}</div>
                <div>
                  <div className="text-xs text-muted-foreground">Score qualité</div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3 h-3 ${qualityScore >= i*20 ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <Progress value={qualityScore} className="w-32 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {qualityScore < 60 && "Score insuffisant"}
                {qualityScore >= 60 && qualityScore < 80 && "Bon référencement"}
                {qualityScore >= 80 && "Excellent référencement !"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertes pour champs obligatoires */}
      {mandatoryFieldsErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>Champs obligatoires manquants :</strong>
            <ul className="list-disc list-inside mt-1">
              {mandatoryFieldsErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Étape 1: Catégorie principale */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">1</div>
              Quelle est la catégorie principale de votre produit ?
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cette information déterminera les champs obligatoires spécifiques à renseigner
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={formData.categoryId === category.id ? "default" : "outline"}
                  className="h-20 flex flex-col gap-2 text-center"
                  onClick={() => updateFormData({ categoryId: category.id, subcategoryId: "" })}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button onClick={handleNext} disabled={!formData.categoryId}>
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3: Sous-catégorie */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">2</div>
              Précisez la sous-catégorie
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Plus vous êtes précis, mieux votre produit sera référencé
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getSubcategories().map(subcategory => (
                <Button
                  key={subcategory.id}
                  variant={formData.subcategoryId === subcategory.id ? "default" : "outline"}
                  className="h-16 flex flex-col gap-1 text-left p-4"
                  onClick={() => updateFormData({ subcategoryId: subcategory.id })}
                >
                  <span className="font-medium">{subcategory.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Mots-clés: {subcategory.keywords.join(", ")}
                  </span>
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button onClick={handleNext} disabled={!formData.subcategoryId}>
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3: Informations de base */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">3</div>
              Décrivez votre produit en détail
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Plus vous donnez d'informations, plus votre produit sera facile à trouver
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-medium">Titre du produit *</Label>
              <Input
                id="title"
                placeholder="Ex: T-shirt coton bio bleu marine manches courtes homme taille M"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="mt-2"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  Incluez: couleur, matière, taille, genre
                </p>
                <span className={`text-xs ${formData.title.length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.title.length}/10 min
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="brand" className="text-base font-medium">Marque</Label>
              <Input
                id="brand"
                placeholder="Ex: Nike, Adidas, Zara, H&M..."
                value={formData.brand}
                onChange={(e) => updateFormData({ brand: e.target.value })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                La marque aide les clients à vous faire confiance
              </p>
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">Description détaillée *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre produit: matières, couleurs, tailles disponibles, usage, style, avantages..."
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                className="mt-2 min-h-[120px]"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  Mentionnez tous les détails importants
                </p>
                <span className={`text-xs ${formData.description.length >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.description.length}/50 min
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Précédent
              </Button>
              <Button onClick={handleNext}>
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 4: Images */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">4</div>
              Ajoutez des photos de qualité
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              L'IA va analyser vos images pour détecter automatiquement les couleurs et caractéristiques
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-3">
                <div className="space-y-2">
                  <Button variant="outline" className="mb-2">
                    <Camera className="w-4 h-4 mr-2" />
                    Prendre des photos
                  </Button>
                  <p className="text-sm text-muted-foreground">ou</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="max-w-xs"
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📸 Conseils pour des photos parfaites :</p>
                  <p>• Fond blanc ou neutre</p>
                  <p>• Éclairage naturel</p>
                  <p>• Plusieurs angles (face, dos, détails)</p>
                  <p>• Haute résolution</p>
                </div>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={image}
                        alt={`Produit ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      {index === 0 && (
                        <Badge className="absolute top-1 left-1 text-xs bg-primary">
                          Photo principale
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                <Alert className="border-green-200 bg-green-50">
                  <Check className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>✅ {formData.images.length} photo(s) ajoutée(s)</strong>
                    {formData.images.length >= 3 && " - Excellent pour le référencement !"}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>🤖 Analyse IA de vos images :</strong>
                  <div className="mt-2 space-y-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="text-sm">{suggestion}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Précédent
              </Button>
              <Button onClick={handleNext}>
                Continuer
                {formData.images.length === 0 && " (recommandé: ajoutez au moins 1 photo)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 5: État et couleurs */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">5</div>
              État et couleurs du produit
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ces informations sont cruciales pour que les clients trouvent exactement ce qu'ils cherchent
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">État du produit *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {["Neuf", "Comme neuf", "Très bon état", "Bon état", "État moyen", "Pour pièces"].map(condition => (
                  <Button
                    key={condition}
                    variant={formData.condition === condition ? "default" : "outline"}
                    onClick={() => updateFormData({ condition })}
                    className="h-12 text-sm"
                  >
                    {condition}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Couleur principale *</Label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-2">
                {colorOptions.map(color => (
                  <Button
                    key={color.id}
                    variant={formData.mainColor === color.id ? "default" : "outline"}
                    onClick={() => updateFormData({ mainColor: color.id })}
                    className="h-16 flex flex-col gap-1 p-2"
                  >
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs">{color.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Couleurs secondaires (optionnel)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Sélectionnez toutes les couleurs présentes sur le produit
              </p>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {colorOptions.filter(c => c.id !== formData.mainColor).map(color => (
                  <div key={color.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      id={color.id}
                      checked={formData.secondaryColors.includes(color.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData({ 
                            secondaryColors: [...formData.secondaryColors, color.id] 
                          });
                        } else {
                          updateFormData({ 
                            secondaryColors: formData.secondaryColors.filter(c => c !== color.id) 
                          });
                        }
                      }}
                    />
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)}>
                Précédent
              </Button>
              <Button onClick={handleNext}>
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 6: Dimensions et caractéristiques physiques */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">6</div>
              Dimensions et caractéristiques physiques
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ces informations aident les clients à savoir si le produit leur convient
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="length">Longueur *</Label>
                <Input
                  id="length"
                  placeholder="ex: 65 cm"
                  value={formData.dimensions.length}
                  onChange={(e) => updateFormData({ 
                    dimensions: { ...formData.dimensions, length: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="width">Largeur *</Label>
                <Input
                  id="width"
                  placeholder="ex: 45 cm"
                  value={formData.dimensions.width}
                  onChange={(e) => updateFormData({ 
                    dimensions: { ...formData.dimensions, width: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="height">Hauteur</Label>
                <Input
                  id="height"
                  placeholder="ex: 2 cm"
                  value={formData.dimensions.height}
                  onChange={(e) => updateFormData({ 
                    dimensions: { ...formData.dimensions, height: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight">Poids</Label>
                <Input
                  id="weight"
                  placeholder="ex: 150g"
                  value={formData.dimensions.weight}
                  onChange={(e) => updateFormData({ 
                    dimensions: { ...formData.dimensions, weight: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="manufacturer">Fabricant/Marque</Label>
              <Input
                id="manufacturer"
                placeholder="Nom du fabricant"
                value={formData.manufacturer}
                onChange={(e) => updateFormData({ manufacturer: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="distinguishingFeatures">Signes distinctifs ou défauts</Label>
              <Textarea
                id="distinguishingFeatures"
                placeholder="Ex: Petite tache sur la manche droite, logo légèrement décoloré..."
                value={formData.distinguishingFeatures}
                onChange={(e) => updateFormData({ distinguishingFeatures: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Soyez transparent pour éviter les retours
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(5)}>
                Précédent
              </Button>
              <Button onClick={handleNext}>
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 7: Localisation et livraison */}
      {step === 7 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">7</div>
              Où et comment récupérer le produit ?
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ces informations permettent aux clients de savoir s'ils peuvent venir chercher le produit
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ville de retrait *
                </Label>
                <Input
                  id="city"
                  placeholder="Ex: Libreville"
                  value={formData.pickupLocation.city}
                  onChange={(e) => updateFormData({ 
                    pickupLocation: { ...formData.pickupLocation, city: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="district">Quartier *</Label>
                <Input
                  id="district"
                  placeholder="Ex: Nzeng Ayong, Akanda, Glass..."
                  value={formData.pickupLocation.district}
                  onChange={(e) => updateFormData({ 
                    pickupLocation: { ...formData.pickupLocation, district: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Adresse précise (optionnel)</Label>
                <Input
                  id="address"
                  placeholder="Ex: Près du marché central, face à la pharmacie"
                  value={formData.pickupLocation.address}
                  onChange={(e) => updateFormData({ 
                    pickupLocation: { ...formData.pickupLocation, address: e.target.value }
                  })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Zone de livraison
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {["Quartier uniquement", "Toute la ville", "Département", "Province", "National"].map(zone => (
                  <Button
                    key={zone}
                    variant={formData.deliveryZone === zone ? "default" : "outline"}
                    onClick={() => updateFormData({ deliveryZone: zone })}
                    className="h-12 text-sm"
                  >
                    {zone}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Délai de disponibilité *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {["Immédiat", "24 heures", "48 heures", "1 semaine", "Sur commande"].map(availability => (
                  <Button
                    key={availability}
                    variant={formData.availability === availability ? "default" : "outline"}
                    onClick={() => updateFormData({ availability })}
                    className="h-12 text-sm"
                  >
                    {availability}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(6)}>
                Précédent
              </Button>
              <Button onClick={handleNext}>
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 8: Prix et variantes */}
      {step === 8 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">8</div>
              Prix et variantes disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Variantes de votre produit</Label>
                <p className="text-sm text-muted-foreground">
                  Ajoutez toutes les combinaisons taille/couleur/prix disponibles
                </p>
              </div>
              <Button onClick={() => {
                const newVariant: ProductVariant = {
                  id: Date.now().toString(),
                  colorCode: "",
                  colorName: "",
                  sizeCode: "",
                  sizeName: "",
                  price: 0,
                  stock: 0
                };
                updateFormData({ variants: [...formData.variants, newVariant] });
              }} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une variante
              </Button>
            </div>

            {formData.variants.length === 0 && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Vous devez créer au moins une variante avec un prix pour publier votre produit.
                </AlertDescription>
              </Alert>
            )}

            {formData.variants.map((variant, index) => (
              <div key={variant.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Variante {index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newVariants = formData.variants.filter((_, i) => i !== index);
                      updateFormData({ variants: newVariants });
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <Label>Couleur</Label>
                    <Select
                      value={variant.colorCode}
                      onValueChange={(value) => {
                        const color = colorOptions.find(c => c.id === value);
                        const newVariants = [...formData.variants];
                        newVariants[index] = { 
                          ...newVariants[index], 
                          colorCode: value, 
                          colorName: color?.name || "" 
                        };
                        updateFormData({ variants: newVariants });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(color => (
                          <SelectItem key={color.id} value={color.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: color.hex }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Taille</Label>
                    <Select
                      value={variant.sizeCode}
                      onValueChange={(value) => {
                        const size = sizeOptions.find(s => s.id === value);
                        const newVariants = [...formData.variants];
                        newVariants[index] = { 
                          ...newVariants[index], 
                          sizeCode: value, 
                          sizeName: size?.name || "" 
                        };
                        updateFormData({ variants: newVariants });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map(size => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Prix (FCFA)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 15000"
                      value={variant.price || ""}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index] = { 
                          ...newVariants[index], 
                          price: parseInt(e.target.value) || 0 
                        };
                        updateFormData({ variants: newVariants });
                      }}
                    />
                  </div>

                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      placeholder="Quantité"
                      value={variant.stock || ""}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index] = { 
                          ...newVariants[index], 
                          stock: parseInt(e.target.value) || 0 
                        };
                        updateFormData({ variants: newVariants });
                      }}
                    />
                  </div>

                  <div>
                    <Label>SKU (optionnel)</Label>
                    <Input
                      placeholder="Référence"
                      value={variant.sku || ""}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index] = { 
                          ...newVariants[index], 
                          sku: e.target.value 
                        };
                        updateFormData({ variants: newVariants });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(7)}>
                Précédent
              </Button>
              <Button onClick={handleNext}>
                Finaliser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 9: Récapitulatif et publication */}
      {step === 10 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">9</div>
              Récapitulatif et publication
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Vérifiez toutes les informations avant de publier votre produit
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score final */}
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-4xl font-bold text-primary">{qualityScore}</div>
                <div className="text-lg">/100</div>
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-5 h-5 ${qualityScore >= i*20 ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <p className="text-sm font-medium">
                {qualityScore >= 80 && "🎉 Excellent ! Votre produit sera parfaitement référencé"}
                {qualityScore >= 60 && qualityScore < 80 && "👍 Bon score ! Quelques améliorations possibles"}
                {qualityScore < 60 && "⚠️ Score insuffisant pour une publication optimale"}
              </p>
            </div>

            {/* Récapitulatif */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations principales</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Titre:</strong> {formData.title || "Non renseigné"}</p>
                    <p><strong>Catégorie:</strong> {formData.categoryId}</p>
                    <p><strong>État:</strong> {formData.condition || "Non renseigné"}</p>
                    <p><strong>Couleur:</strong> {formData.mainColor || "Non renseigné"}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Logistique</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Ville:</strong> {formData.pickupLocation.city || "Non renseigné"}</p>
                    <p><strong>Quartier:</strong> {formData.pickupLocation.district || "Non renseigné"}</p>
                    <p><strong>Disponibilité:</strong> {formData.availability || "Non renseigné"}</p>
                    <p><strong>Variantes:</strong> {formData.variants.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {!canPublish && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Score insuffisant pour publier ({qualityScore}/100)</strong>
                  <br />
                  Pour améliorer votre score :
                  <ul className="list-disc list-inside mt-1 text-sm">
                    {formData.title.length < 15 && <li>Améliorez le titre (incluez couleur, matière, taille)</li>}
                    {formData.description.length < 100 && <li>Étoffez la description</li>}
                    {formData.images.length < 3 && <li>Ajoutez plus de photos</li>}
                    {!formData.pickupLocation.city && <li>Renseignez la localisation</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(8)}>
                Précédent
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Sauvegarder en brouillon
                </Button>
              <Button 
                onClick={() => {
                  if (canPublish && selectedCatalogId) {
                    // Convert form data to database format
                    createProduct({
                      name: formData.title,
                      description: formData.description,
                      catalog_id: selectedCatalogId,
                      price: formData.variants.length > 0 ? formData.variants[0].price : 0,
                      tags: [...formData.tags, formData.mainColor, formData.condition, ...formData.secondaryColors].filter(Boolean),
                      images: formData.images,
                      is_active: true, // Published immediately
                      stock_quantity: formData.variants.reduce((sum, v) => sum + v.stock, 0) || null,
                      sku: formData.variants[0]?.sku || null
                    });
                    onComplete(formData);
                  }
                }}
                disabled={!canPublish || !selectedCatalogId || isCreating}
                className={canPublish ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isCreating ? (
                  "Publication en cours..."
                ) : (
                  canPublish ? "🚀 Publier le produit" : `Publier (score: ${qualityScore}/80 requis)`
                )}
              </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
