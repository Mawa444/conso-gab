import { useState, useCallback } from "react";
import { Plus, Upload, Camera, Check, AlertCircle, Sparkles } from "lucide-react";
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
import { categories } from "@/data/mockCommerces";

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
  // Nouvelles informations détaillées
  condition: string; // Neuf, Occasion, Reconditionné
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
  // Logistique
  pickupLocation: {
    address: string;
    city: string;
    district: string;
  };
  deliveryZone: string; // quartier, ville, département, province, national
  availability: string; // immédiat, 48h, 1 semaine
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
];

export const ProductCreationWizard = () => {
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

  // Calcul du score qualité en temps réel
  const calculateQualityScore = useCallback((data: ProductFormData) => {
    let score = 0;
    
    // Titre (20 points)
    if (data.title.length >= 10) score += 20;
    else if (data.title.length >= 5) score += 10;
    
    // Description (15 points)
    if (data.description.length >= 50) score += 15;
    else if (data.description.length >= 20) score += 8;
    
    // Catégorie (10 points)
    if (data.categoryId) score += 10;
    
    // Marque (5 points)
    if (data.brand) score += 5;
    
    // Images (20 points)
    if (data.images.length >= 3) score += 20;
    else if (data.images.length >= 1) score += 10;
    
    // Variantes (20 points)
    if (data.variants.length >= 2) score += 20;
    else if (data.variants.length >= 1) score += 10;
    
    // Attributs obligatoires (10 points)
    const template = attributeTemplates[data.categoryId as keyof typeof attributeTemplates] || attributeTemplates.default;
    const requiredFieldsFilled = template.required.filter(field => data.attributes[field]).length;
    score += (requiredFieldsFilled / template.required.length) * 10;
    
    return Math.min(score, 100);
  }, []);

  const updateFormData = (updates: Partial<ProductFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    setQualityScore(calculateQualityScore(newData));
  };

  const handleImageUpload = (files: FileList) => {
    // Simulation d'upload et analyse IA
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    updateFormData({ images: [...formData.images, ...newImages] });
    
    // Simulation de suggestions IA
    setTimeout(() => {
      setAiSuggestions([
        "Couleur détectée: Bleu",
        "Type: T-shirt",
        "Motif: Uni",
        "Qualité image: Excellente"
      ]);
    }, 1000);
  };

  const addVariant = () => {
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
  };

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], ...updates };
    updateFormData({ variants: newVariants });
  };

  const getAttributeTemplate = () => {
    return attributeTemplates[formData.categoryId as keyof typeof attributeTemplates] || attributeTemplates.default;
  };

  const canPublish = qualityScore >= 80;
  const maxSteps = 9;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête avec score qualité */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Création de produit intelligente
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Étape {step} sur {maxSteps} - Suivez le guide pour un référencement optimal
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{qualityScore}/100</div>
              <div className="text-xs text-muted-foreground">Score qualité</div>
              <Progress value={qualityScore} className="w-24 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Étape 1: Catégorie */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>1. Choisissez une catégorie</CardTitle>
            <p className="text-sm text-muted-foreground">
              La catégorie détermine les attributs obligatoires pour votre produit
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={formData.categoryId === category.id ? "default" : "outline"}
                  className="h-16 flex flex-col gap-1"
                  onClick={() => updateFormData({ categoryId: category.id })}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-xs">{category.name}</span>
                </Button>
              ))}
            </div>
            
            {formData.categoryId && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Attributs requis pour cette catégorie:</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {getAttributeTemplate().required.map(attr => (
                    <Badge key={attr} variant="outline" className="text-xs">
                      {attr}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.categoryId}
              >
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 2: Informations générales */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titre du produit *</Label>
              <Input
                id="title"
                placeholder="Ex: T-shirt coton bio enfant manches courtes"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 10 caractères pour un score optimal
              </p>
            </div>

            <div>
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                placeholder="Ex: Nike, Adidas, H&M..."
                value={formData.brand}
                onChange={(e) => updateFormData({ brand: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre produit en détail: matières, couleurs, usage..."
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                className="mt-1 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 50 caractères recommandés
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button onClick={() => setStep(3)}>
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3: Images */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Images et médias</CardTitle>
            <p className="text-sm text-muted-foreground">
              L'IA va analyser vos images pour suggérer des attributs
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <div className="space-y-2">
                <Button variant="outline" className="mb-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Prendre une photo
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
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={`Produit ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {index === 0 && (
                      <Badge className="absolute top-1 left-1 text-xs">
                        Principal
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <Alert>
                <Sparkles className="w-4 h-4" />
                <AlertDescription>
                  <strong>Suggestions IA:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm">{suggestion}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Précédent
              </Button>
              <Button onClick={() => setStep(4)}>
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 4: Variantes */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>4. Variantes du produit</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Couleurs, tailles et prix
                </p>
              </div>
              <Button onClick={addVariant} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div key={variant.id} className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Couleur</Label>
                    <Select
                      value={variant.colorCode}
                      onValueChange={(value) => {
                        const color = colorOptions.find(c => c.id === value);
                        updateVariant(index, { 
                          colorCode: value, 
                          colorName: color?.name || "" 
                        });
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
                        updateVariant(index, { 
                          sizeCode: value, 
                          sizeName: size?.name || "" 
                        });
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
                    <Label>Prix (XAF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={variant.price || ""}
                      onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={variant.stock || ""}
                      onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.variants.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune variante ajoutée</p>
                <Button onClick={addVariant} variant="outline" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la première variante
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Précédent
              </Button>
              <Button onClick={() => setStep(5)}>
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 5: Attributs */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>5. Attributs spécifiques</CardTitle>
            <p className="text-sm text-muted-foreground">
              Renseignez les caractéristiques importantes de votre produit
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const template = getAttributeTemplate();
              return (
                <div className="space-y-4">
                  {/* Attributs obligatoires */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      Obligatoires
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {template.required.map(fieldName => {
                        const field = template.fields[fieldName];
                        return (
                          <div key={fieldName}>
                            <Label htmlFor={fieldName}>
                              {fieldName} *
                            </Label>
                            {field.type === "select" ? (
                              <Select
                                value={formData.attributes[fieldName] || ""}
                                onValueChange={(value) => 
                                  updateFormData({
                                    attributes: { ...formData.attributes, [fieldName]: value }
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map(option => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={fieldName}
                                placeholder={field.placeholder}
                                value={formData.attributes[fieldName] || ""}
                                onChange={(e) => 
                                  updateFormData({
                                    attributes: { ...formData.attributes, [fieldName]: e.target.value }
                                  })
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Attributs optionnels */}
                  <div>
                    <h4 className="font-medium text-sm mb-3">Optionnels (améliore le score)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {template.optional.map(fieldName => {
                        const field = template.fields[fieldName];
                        return (
                          <div key={fieldName}>
                            <Label htmlFor={fieldName}>
                              {fieldName}
                            </Label>
                            {field.type === "select" ? (
                              <Select
                                value={formData.attributes[fieldName] || ""}
                                onValueChange={(value) => 
                                  updateFormData({
                                    attributes: { ...formData.attributes, [fieldName]: value }
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map(option => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : field.type === "checkbox" ? (
                              <div className="flex items-center space-x-2 mt-2">
                                <input
                                  type="checkbox"
                                  id={fieldName}
                                  checked={formData.attributes[fieldName] === "true"}
                                  onChange={(e) => 
                                    updateFormData({
                                      attributes: { ...formData.attributes, [fieldName]: e.target.checked.toString() }
                                    })
                                  }
                                />
                                <Label htmlFor={fieldName} className="text-sm">
                                  {field.label}
                                </Label>
                              </div>
                            ) : (
                              <Input
                                id={fieldName}
                                placeholder={field.placeholder}
                                value={formData.attributes[fieldName] || ""}
                                onChange={(e) => 
                                  updateFormData({
                                    attributes: { ...formData.attributes, [fieldName]: e.target.value }
                                  })
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>
                Précédent
              </Button>
              <Button onClick={() => setStep(6)}>
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 6: Vérification */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>6. Vérification finale</CardTitle>
            <p className="text-sm text-muted-foreground">
              Vérifiez toutes les informations avant publication
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alerte score */}
            {qualityScore < 70 ? (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Score trop faible ({qualityScore}/100)</strong>
                  <br />
                  Complétez les informations manquantes pour améliorer votre référencement.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <Check className="w-4 h-4 text-green-600" />
                <AlertDescription>
                  <strong>Excellent score ({qualityScore}/100) !</strong>
                  <br />
                  Votre produit sera bien référencé.
                </AlertDescription>
              </Alert>
            )}

            {/* Résumé */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Informations générales</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.title} {formData.brand && `- ${formData.brand}`}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Variantes</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.variants.length} variante(s) configurée(s)
                </p>
              </div>

              <div>
                <h4 className="font-medium">Images</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.images.length} image(s) ajoutée(s)
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(5)}>
                Précédent
              </Button>
              <Button 
                onClick={() => setStep(7)}
                disabled={!canPublish}
                className="flex-1"
              >
                {canPublish ? "Publier le produit" : `Améliorer le score (${qualityScore}/70)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 7: Succès */}
      {step === 7 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Produit publié avec succès !</h3>
            <p className="text-muted-foreground mb-6">
              Votre produit est maintenant visible sur la carte et dans les résultats de recherche.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => {
                setStep(1);
                setFormData({
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
                  dimensions: { length: "", width: "", height: "", weight: "" },
                  manufacturer: "",
                  manufacturingDate: "",
                  expirationDate: "",
                  distinguishingFeatures: "",
                  pickupLocation: { address: "", city: "", district: "" },
                  deliveryZone: "",
                  availability: "",
                  minOrderQuantity: 1,
                  maxOrderQuantity: 999
                });
                setQualityScore(0);
              }}>
                Créer un autre produit
              </Button>
              <Button variant="outline">
                Voir sur la carte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};