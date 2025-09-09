import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Package, Tags, Image, Check } from 'lucide-react';
import { MultiImageEnforcer } from './MultiImageEnforcer';
import { ProductManager } from './ProductManager';
import { useCreateCatalog } from '@/hooks/use-create-catalog';

interface ImageData {
  url: string;
  path: string;
  id: string;
}

interface CatalogWizardProps {
  businessId: string;
  onCancel?: () => void;
  onCompleted?: (catalogId?: string) => void;
}

export const CatalogCreationWizard = ({ businessId, onCancel, onCompleted }: CatalogWizardProps) => {
  const { createCatalog, isCreating } = useCreateCatalog(businessId);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Étape 1: Informations de base
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);

  // Étape 2: Métadonnées SEO
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [newSynonym, setNewSynonym] = useState('');
  const [geoCity, setGeoCity] = useState('');
  const [geoDistrict, setGeoDistrict] = useState('');

  // Étape 3: Images du catalogue
  const [catalogImages, setCatalogImages] = useState<ImageData[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);

  // Étape 4: États finaux
  const [createdCatalogId, setCreatedCatalogId] = useState<string | null>(null);

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const addSynonym = () => {
    if (newSynonym.trim() && !synonyms.includes(newSynonym.trim())) {
      setSynonyms([...synonyms, newSynonym.trim()]);
      setNewSynonym('');
    }
  };

  const removeSynonym = (synonym: string) => {
    setSynonyms(synonyms.filter(s => s !== synonym));
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

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return name.trim() && category;
      case 2:
        return keywords.length >= 3;
      case 3:
        return catalogImages.length >= 4;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleCreateCatalog = async () => {
    if (!canProceedToNext()) return;

    const catalog = await createCatalog({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      subcategory: subcategory || undefined,
      isPublic,
      images: catalogImages,
      cover_url: catalogImages[coverImageIndex]?.url,
      geo_city: geoCity || undefined,
      geo_district: geoDistrict || undefined,
      keywords,
      synonyms,
    });

    if (catalog?.id) {
      setCreatedCatalogId(catalog.id);
      setCurrentStep(4);
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return <Package className="w-5 h-5" />;
      case 2: return <Tags className="w-5 h-5" />;
      case 3: return <Image className="w-5 h-5" />;
      case 4: return <Check className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>Étape {currentStep} sur {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% terminé</span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} />
        
        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step}
              className={`flex items-center gap-2 ${
                step === currentStep ? 'text-primary' : 
                step < currentStep ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === currentStep ? 'border-primary bg-primary text-white' :
                step < currentStep ? 'border-green-600 bg-green-600 text-white' : 'border-muted'
              }`}>
                {step < currentStep ? <Check className="w-4 h-4" /> : getStepIcon(step)}
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {step === 1 && 'Informations'}
                {step === 2 && 'Référencement'}
                {step === 3 && 'Images'}
                {step === 4 && 'Produits'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Informations du catalogue'}
            {currentStep === 2 && 'Métadonnées et référencement'}
            {currentStep === 3 && 'Images du catalogue'}
            {currentStep === 4 && 'Gérer les produits'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du catalogue *</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: Nouveautés Automne 2024"
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visibilité</Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm">Rendre public immédiatement</span>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Décrivez le contenu de votre catalogue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mode">Mode</SelectItem>
                      <SelectItem value="beaute">Beauté & Cosmétiques</SelectItem>
                      <SelectItem value="restauration">Restauration</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="electronique">Électronique</SelectItem>
                      <SelectItem value="maison">Maison & Jardin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sous-catégorie</Label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optionnel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homme">Homme</SelectItem>
                      <SelectItem value="femme">Femme</SelectItem>
                      <SelectItem value="enfants">Enfants</SelectItem>
                      <SelectItem value="unisexe">Unisexe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Métadonnées SEO */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input 
                    placeholder="Ex: Libreville"
                    value={geoCity}
                    onChange={(e) => setGeoCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quartier/District</Label>
                  <Input 
                    placeholder="Ex: Akanda"
                    value={geoDistrict}
                    onChange={(e) => setGeoDistrict(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Mots-clés (minimum 3) *</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ajouter un mot-clé..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword} variant="outline">
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                      {keyword} ×
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Les mots-clés aident les clients à trouver votre catalogue
                </p>
              </div>

              <div className="space-y-3">
                <Label>Synonymes et termes associés</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ajouter un synonyme..."
                    value={newSynonym}
                    onChange={(e) => setNewSynonym(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSynonym())}
                  />
                  <Button type="button" onClick={addSynonym} variant="outline">
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {synonyms.map((synonym, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeSynonym(synonym)}>
                      {synonym} ×
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Améliorez la découverte avec des termes similaires
                </p>
              </div>
            </div>
          )}

          {/* Étape 3: Images du catalogue */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Images de présentation</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des images attractives pour présenter votre catalogue
                </p>
              </div>

              <MultiImageEnforcer
                onImagesChanged={setCatalogImages}
                onCoverChanged={setCoverImageIndex}
                bucket="catalog-images"
                folder="catalogs"
                currentImages={catalogImages}
                coverIndex={coverImageIndex}
                minImages={4}
                maxImages={8}
                label="Images du catalogue (minimum 4) *"
                description="Format 16:9 automatique, max 2MB chacune"
              />
            </div>
          )}

          {/* Étape 4: Gestion des produits */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {createdCatalogId ? (
                <ProductManager 
                  catalogId={createdCatalogId}
                  businessId={businessId}
                />
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Prêt à créer votre catalogue</h3>
                  <p className="text-muted-foreground mb-6">
                    Cliquez sur "Créer le catalogue" pour continuer vers l'ajout de produits
                  </p>
                  <Button onClick={handleCreateCatalog} disabled={isCreating} size="lg">
                    {isCreating ? 'Création...' : 'Créer le catalogue'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={currentStep === 1 ? onCancel : prevStep}
          disabled={isCreating}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'Annuler' : 'Précédent'}
        </Button>

        <Button 
          onClick={currentStep === totalSteps ? () => onCompleted?.(createdCatalogId) : nextStep}
          disabled={!canProceedToNext() || isCreating}
        >
          {currentStep === totalSteps ? 'Terminer' : (
            <>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};