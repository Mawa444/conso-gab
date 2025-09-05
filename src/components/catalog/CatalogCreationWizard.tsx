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
import { Upload, ArrowLeft, ArrowRight, Check, Camera, Tags, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MultiImageEnforcer } from "./MultiImageEnforcer";

interface ImageData {
  url: string;
  path: string;
  id: string;
}

interface CatalogData {
  images: ImageData[];
  cover_index: number;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  keywords: string[];
  synonyms: string[];
  visibility: "draft" | "public";
  availability_zone: "neighborhood" | "city" | "department" | "province" | "national";
  geo_city: string;
  geo_district: string;
}

interface CatalogCreationWizardProps {
  onComplete: (catalogData: CatalogData) => void;
  onCancel: () => void;
  businessId: string;
}

const CATEGORIES = {
  "Mode": ["Vêtements femmes", "Vêtements hommes", "Vêtements enfants", "Chaussures", "Accessoires"],
  "Alimentation": ["Fruits et légumes", "Viandes", "Poissons", "Produits laitiers", "Épicerie"],
  "Services": ["Réparation", "Nettoyage", "Beauté", "Transport", "Éducation"],
  "Electronique": ["Téléphones", "Ordinateurs", "Électroménager", "Audio/Vidéo", "Accessoires"]
};

const ZONE_LABELS = {
  neighborhood: "Quartier uniquement",
  city: "Toute la ville",
  department: "Département",
  province: "Province",
  national: "National"
};

export const CatalogCreationWizard = ({ onComplete, onCancel, businessId }: CatalogCreationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [catalogData, setCatalogData] = useState<CatalogData>({
    images: [],
    cover_index: 0,
    name: "",
    description: "",
    category: "",
    subcategory: "",
    keywords: [],
    synonyms: [],
    visibility: "draft",
    availability_zone: "city",
    geo_city: "",
    geo_district: ""
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [synonymInput, setSynonymInput] = useState("");
  const { toast } = useToast();

const progress = (currentStep / 3) * 100;

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!catalogData.name.trim()) {
          toast({
            title: "Nom obligatoire",
            description: "Veuillez saisir un nom pour votre catalogue",
            variant: "destructive"
          });
          return false;
        }
        if (catalogData.images.length < 4) {
          toast({
            title: "Images obligatoires",
            description: "Au minimum 4 images sont requises pour créer un catalogue",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!catalogData.category || !catalogData.subcategory) {
          toast({
            title: "Catégorie obligatoire",
            description: "Veuillez sélectionner une catégorie et sous-catégorie",
            variant: "destructive"
          });
          return false;
        }
        if (catalogData.keywords.length === 0) {
          toast({
            title: "Mots-clés obligatoires",
            description: "Ajoutez au minimum 3 mots-clés pour améliorer la visibilité",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !catalogData.keywords.includes(keywordInput.trim().toLowerCase())) {
      setCatalogData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim().toLowerCase()]
      }));
      setKeywordInput("");
    }
  };

  const addSynonym = () => {
    if (synonymInput.trim() && !catalogData.synonyms.includes(synonymInput.trim().toLowerCase())) {
      setCatalogData(prev => ({
        ...prev,
        synonyms: [...prev.synonyms, synonymInput.trim().toLowerCase()]
      }));
      setSynonymInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setCatalogData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const removeSynonym = (synonym: string) => {
    setCatalogData(prev => ({
      ...prev,
      synonyms: prev.synonyms.filter(s => s !== synonym)
    }));
  };

  const handleImagesChanged = (images: ImageData[]) => {
    setCatalogData(prev => ({ ...prev, images }));
  };

  const handleCoverChanged = (index: number) => {
    setCatalogData(prev => ({ ...prev, cover_index: index }));
  };

  const handleComplete = () => {
    if (validateStep()) {
      onComplete(catalogData);
      toast({
        title: "Catalogue créé !",
        description: "Votre catalogue a été créé avec succès. Vous pouvez maintenant y ajouter des produits.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Créer un nouveau catalogue</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Étape {currentStep} sur 3 - {["Informations de base", "Catégorisation", "Zone de visibilité"][currentStep - 1]}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Annuler
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Informations de base</h3>
                <p className="text-sm text-muted-foreground">
                  Commencez par les informations essentielles de votre catalogue
                </p>
              </div>

              {/* Upload images */}
              <MultiImageEnforcer
                onImagesChanged={handleImagesChanged}
                onCoverChanged={handleCoverChanged}
                bucket="catalog-images"
                folder="galleries"
                currentImages={catalogData.images}
                coverIndex={catalogData.cover_index}
                minImages={4}
                maxImages={8}
                label="Galerie du catalogue (minimum 4 images) *"
                description="Format 16:9 automatique, max 2MB chacune"
              />

              {/* Nom du catalogue */}
              <div className="space-y-2">
                <Label htmlFor="catalog-name" className="text-base font-medium">
                  Nom du catalogue <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Exemple : "Chaussures enfants", "Vêtements d'été", "Spécialités locales"
                </p>
                <Input
                  id="catalog-name"
                  placeholder="Ex: Collection mode enfants"
                  value={catalogData.name}
                  onChange={(e) => setCatalogData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="catalog-description" className="text-base font-medium">
                  Description (optionnel mais recommandé)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Décrivez brièvement le contenu de ce catalogue
                </p>
                <Textarea
                  id="catalog-description"
                  placeholder="Ex: Collection de vêtements pour enfants de 2 à 10 ans, styles modernes et confortables..."
                  value={catalogData.description}
                  onChange={(e) => setCatalogData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Étape 2: Catégorisation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Tags className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Catégorisation</h3>
                <p className="text-sm text-muted-foreground">
                  Aidez vos clients à trouver facilement vos produits
                </p>
              </div>

              {/* Catégorie principale */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Catégorie principale <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={catalogData.category}
                  onValueChange={(value) => setCatalogData(prev => ({ ...prev, category: value, subcategory: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATEGORIES).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sous-catégorie */}
              {catalogData.category && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Sous-catégorie <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={catalogData.subcategory}
                    onValueChange={(value) => setCatalogData(prev => ({ ...prev, subcategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez une sous-catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES[catalogData.category as keyof typeof CATEGORIES]?.map(subcategory => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Mots-clés */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Mots-clés <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ajoutez des mots que vos clients utiliseraient pour chercher vos produits
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: enfant, coloré, pas cher..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button onClick={addKeyword} disabled={!keywordInput.trim()}>
                    Ajouter
                  </Button>
                </div>
                
                {catalogData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {catalogData.keywords.map(keyword => (
                      <Badge 
                        key={keyword}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeKeyword(keyword)}
                      >
                        {keyword}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {catalogData.keywords.length} mots-clés ajoutés (minimum 3 recommandé)
                </p>
              </div>

              {/* Synonymes */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Synonymes (optionnel mais recommandé)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Termes alternatifs pour améliorer la recherche
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: pas cher, économique, abordable..."
                    value={synonymInput}
                    onChange={(e) => setSynonymInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSynonym())}
                  />
                  <Button onClick={addSynonym} disabled={!synonymInput.trim()}>
                    Ajouter
                  </Button>
                </div>
                
                {catalogData.synonyms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {catalogData.synonyms.map(synonym => (
                      <Badge 
                        key={synonym}
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeSynonym(synonym)}
                      >
                        {synonym}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Étape 3: Zone de visibilité */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Zone de visibilité</h3>
                <p className="text-sm text-muted-foreground">
                  Définissez où vos produits seront visibles et disponibles
                </p>
              </div>

              {/* Zone géographique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="geo-city" className="text-base font-medium">
                    Ville <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="geo-city"
                    placeholder="Ex: Libreville"
                    value={catalogData.geo_city}
                    onChange={(e) => setCatalogData(prev => ({ ...prev, geo_city: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="geo-district" className="text-base font-medium">
                    Quartier (optionnel)
                  </Label>
                  <Input
                    id="geo-district"
                    placeholder="Ex: Glass"
                    value={catalogData.geo_district}
                    onChange={(e) => setCatalogData(prev => ({ ...prev, geo_district: e.target.value }))}
                  />
                </div>
              </div>

              {/* Zone de disponibilité */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Zone de disponibilité</Label>
                <p className="text-xs text-muted-foreground">
                  Dans quelle zone géographique livrez-vous ou vendez-vous ces produits ?
                </p>
                <RadioGroup
                  value={catalogData.availability_zone}
                  onValueChange={(value) => setCatalogData(prev => ({ 
                    ...prev, 
                    availability_zone: value as CatalogData["availability_zone"] 
                  }))}
                  className="space-y-3"
                >
                  {Object.entries(ZONE_LABELS).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="font-normal">
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Visibilité */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Visibilité du catalogue</Label>
                <RadioGroup
                  value={catalogData.visibility}
                  onValueChange={(value) => setCatalogData(prev => ({ 
                    ...prev, 
                    visibility: value as CatalogData["visibility"] 
                  }))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draft" id="draft" />
                    <Label htmlFor="draft" className="font-normal">
                      <div>
                        <div className="font-medium">Brouillon</div>
                        <div className="text-xs text-muted-foreground">
                          Visible uniquement par vous, pour travailler tranquillement
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="font-normal">
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-xs text-muted-foreground">
                          Visible par tous les utilisateurs dans votre zone
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Récapitulatif */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Récapitulatif</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Nom :</strong> {catalogData.name}</div>
                  <div><strong>Catégorie :</strong> {catalogData.category} &gt; {catalogData.subcategory}</div>
                  <div><strong>Mots-clés :</strong> {catalogData.keywords.join(", ")}</div>
                  <div><strong>Synonymes :</strong> {catalogData.synonyms.join(", ")}</div>
                  <div><strong>Ville :</strong> {catalogData.geo_city} {catalogData.geo_district && `(${catalogData.geo_district})`}</div>
                  <div><strong>Zone :</strong> {ZONE_LABELS[catalogData.availability_zone]}</div>
                  <div><strong>Statut :</strong> {catalogData.visibility === "draft" ? "Brouillon" : "Public"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <Check className="w-4 h-4 mr-2" />
                Créer le catalogue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};