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
import { ArrowLeft, ArrowRight, Package, Store, Tags, Image, Check, Settings, Clock, Phone, Percent, Truck } from 'lucide-react';
import { MultiImageEnforcer } from './MultiImageEnforcer';
import { ProductManager } from './ProductManager';
import { useCreateCatalog } from '@/hooks/use-create-catalog';
import { businessCategories } from '@/data/businessCategories';
import { CatalogBookingStep } from './CatalogBookingStep';
import { supabase } from '@/integrations/supabase/client';

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
  const totalSteps = 9;

  // Étape 1: Type de catalogue et informations de base
  const [catalogType, setCatalogType] = useState<'products' | 'services'>('products');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Étape 2: Catégories
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');

  // Étape 3: Métadonnées SEO
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [newSynonym, setNewSynonym] = useState('');
  const [geoCity, setGeoCity] = useState('');
  const [geoDistrict, setGeoDistrict] = useState('');

  // Étape 4: Paramètres commerciaux
  const [hasLimitedQuantity, setHasLimitedQuantity] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [salePercentage, setSalePercentage] = useState(0);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState<string[]>([]);
  const [newDeliveryZone, setNewDeliveryZone] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);

  // Étape 5: Contact et horaires
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '18:00', closed: false },
    saturday: { open: '08:00', close: '18:00', closed: false },
    sunday: { open: '08:00', close: '18:00', closed: true }
  });

  // Étape 6: Images du catalogue
  const [catalogImages, setCatalogImages] = useState<ImageData[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [coverImage, setCoverImage] = useState<ImageData | null>(null);

  // Étape 6: Paramètres de prix
  const [priceType, setPriceType] = useState<'fixed' | 'from' | 'variable'>('fixed');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [priceCurrency, setPriceCurrency] = useState('FCFA');
  const [priceDetails, setPriceDetails] = useState<any[]>([]);

  // Étape 7: Configuration de réservation/commande
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [bookingType, setBookingType] = useState<'appointment' | 'reservation' | 'order' | 'rental'>('appointment');
  const [requireApproval, setRequireApproval] = useState(true);
  const [allowOnlinePayment, setAllowOnlinePayment] = useState(false);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);
  const [bookingSlotsDuration, setBookingSlotsDuration] = useState(60);
  const [availableDays, setAvailableDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [bookingHours, setBookingHours] = useState({ start: '08:00', end: '18:00' });
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState(1);
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Étape 9: États finaux
  const [createdCatalogId, setCreatedCatalogId] = useState<string | null>(null);

  const selectedCategory = businessCategories.find(cat => cat.id === categoryId);
  const selectedSubcategory = selectedCategory?.subcategories.find(sub => sub.id === subcategoryId);

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

  const addDeliveryZone = () => {
    if (newDeliveryZone.trim() && !deliveryZones.includes(newDeliveryZone.trim())) {
      setDeliveryZones([...deliveryZones, newDeliveryZone.trim()]);
      setNewDeliveryZone('');
    }
  };

  const removeDeliveryZone = (zone: string) => {
    setDeliveryZones(deliveryZones.filter(z => z !== zone));
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
        return name.trim() && catalogType;
      case 2:
        return categoryId;
      case 3:
        return keywords.length >= 3;
      case 4:
        return true; 
      case 5:
        return true; 
      case 6:
        return catalogImages.length >= 1 && coverImage;
      case 7:
        return priceType === 'variable' ? priceDetails.length > 0 : basePrice > 0;
      case 8:
        return true; 
      case 9:
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
      catalog_type: catalogType,
      category: selectedCategory?.nom,
      subcategory: selectedSubcategory?.nom,
      isPublic,
      images: catalogImages,
      cover_url: catalogImages[coverImageIndex]?.url,
      cover_image_url: coverImage?.url,
      geo_city: geoCity || undefined,
      geo_district: geoDistrict || undefined,
      keywords,
      synonyms,
      has_limited_quantity: hasLimitedQuantity,
      on_sale: onSale,
      sale_percentage: onSale ? salePercentage : 0,
      delivery_available: deliveryAvailable,
      delivery_zones: deliveryZones,
      delivery_cost: deliveryAvailable ? deliveryCost : 0,
      contact_whatsapp: contactWhatsapp || undefined,
      contact_phone: contactPhone || undefined,
      contact_email: contactEmail || undefined,
      business_hours: businessHours,
      base_price: basePrice > 0 ? basePrice : undefined,
      price_type: priceType,
      price_currency: priceCurrency,
      price_details: priceDetails
    });

    if (catalog?.id) {
      setCreatedCatalogId(catalog.id);
      
      if (bookingEnabled) {
        try {
          await supabase.from('catalog_booking_config').insert({
            catalog_id: catalog.id,
            business_id: businessId,
            booking_enabled: true,
            booking_type: bookingType,
            require_approval: requireApproval,
            allow_online_payment: allowOnlinePayment,
            advance_booking_days: advanceBookingDays,
            booking_slots_duration: bookingSlotsDuration,
            available_days: availableDays,
            booking_hours: bookingHours,
            max_bookings_per_slot: maxBookingsPerSlot,
            deposit_required: depositRequired,
            deposit_amount: depositRequired ? depositAmount : 0,
            cancellation_policy: cancellationPolicy || null,
            special_instructions: specialInstructions || null
          });
        } catch (error) {
          console.error('Error creating booking config:', error);
        }
      }
      
      setCurrentStep(9);
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return catalogType === 'products' ? <Package className="w-5 h-5" /> : <Store className="w-5 h-5" />;
      case 2: return <Tags className="w-5 h-5" />;
      case 3: return <Tags className="w-5 h-5" />;
      case 4: return <Settings className="w-5 h-5" />;
      case 5: return <Phone className="w-5 h-5" />;
      case 6: return <Image className="w-5 h-5" />;
      case 7: return <Settings className="w-5 h-5" />;
      case 8: return <Clock className="w-5 h-5" />;
      case 9: return <Check className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStepTitle = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return 'Type & Infos';
      case 2: return 'Catégorie';
      case 3: return 'Référencement';
      case 4: return 'Commerce';
      case 5: return 'Contact';
      case 6: return 'Images';
      case 7: return 'Prix';
      case 8: return 'Réservations';
      case 9: return catalogType === 'products' ? 'Produits' : 'Services';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>Étape {currentStep} sur {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% terminé</span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} />
        
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
            <div 
              key={step}
              className={`flex flex-col items-center gap-2 ${
                step === currentStep ? 'text-primary' : 
                step < currentStep ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step === currentStep ? 'border-primary bg-primary text-white' :
                step < currentStep ? 'border-green-600 bg-green-600 text-white' : 'border-muted'
              }`}>
                {step < currentStep ? <Check className="w-5 h-5" /> : getStepIcon(step)}
              </div>
              <span className="text-xs font-medium text-center">
                {getStepTitle(step)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Type de catalogue et informations'}
            {currentStep === 2 && 'Catégorie et domaine d\'activité'}
            {currentStep === 3 && 'Métadonnées et référencement'}
            {currentStep === 4 && 'Paramètres commerciaux'}
            {currentStep === 5 && 'Contact et horaires d\'ouverture'}
            {currentStep === 6 && 'Images et couverture'}
            {currentStep === 7 && 'Paramètres de prix'}
            {currentStep === 8 && 'Configuration des réservations'}
            {currentStep === 9 && `Gérer les ${catalogType === 'products' ? 'produits' : 'services'}`}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Type de catalogue *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${catalogType === 'products' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'}`}
                    onClick={() => setCatalogType('products')}
                  >
                    <CardContent className="p-4 text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">Produits</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Objets physiques, marchandises, articles à vendre
                      </p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${catalogType === 'services' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'}`}
                    onClick={() => setCatalogType('services')}
                  >
                    <CardContent className="p-4 text-center">
                      <Store className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">Services</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Prestations, réparations, conseils, consultations
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du catalogue *</Label>
                  <Input 
                    id="name" 
                    placeholder={catalogType === 'products' ? "Ex: Nouveautés Automne 2024" : "Ex: Services de plomberie"}
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
                  placeholder={catalogType === 'products' ? "Décrivez vos produits..." : "Décrivez vos services..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Catégorie principale *</Label>
                <Select value={categoryId} onValueChange={(value) => {
                  setCategoryId(value);
                  setSubcategoryId(''); 
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.nom}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <Label>Sous-catégorie</Label>
                  <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une sous-catégorie (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedCategory && (
                <div className="space-y-2">
                  <Label>Tags suggérés pour cette catégorie</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.tags.slice(0, 10).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {selectedSubcategory && selectedSubcategory.tags.slice(0, 8).map((tag, index) => (
                      <Badge key={`sub-${index}`} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
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
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-1">
                    <span className="font-medium">Quantité limitée</span>
                    <p className="text-sm text-muted-foreground">
                      {catalogType === 'products' ? 'Indiquer si certains produits sont en stock limité' : 'Indiquer si vos services ont une disponibilité limitée'}
                    </p>
                  </div>
                  <Switch checked={hasLimitedQuantity} onCheckedChange={setHasLimitedQuantity} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="space-y-1">
                      <span className="font-medium flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Promotion active
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Afficher une réduction sur ce catalogue
                      </p>
                    </div>
                    <Switch checked={onSale} onCheckedChange={setOnSale} />
                  </div>

                  {onSale && (
                    <div className="space-y-2 ml-4">
                      <Label>Pourcentage de réduction</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number"
                          min="0"
                          max="99"
                          value={salePercentage}
                          onChange={(e) => setSalePercentage(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="space-y-1">
                      <span className="font-medium flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Livraison disponible
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {catalogType === 'products' ? 'Proposer la livraison de vos produits' : 'Proposer des services à domicile'}
                      </p>
                    </div>
                    <Switch checked={deliveryAvailable} onCheckedChange={setDeliveryAvailable} />
                  </div>

                  {deliveryAvailable && (
                    <div className="space-y-4 ml-4">
                      <div className="space-y-2">
                        <Label>Zones de livraison</Label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Ex: Libreville Centre"
                            value={newDeliveryZone}
                            onChange={(e) => setNewDeliveryZone(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliveryZone())}
                          />
                          <Button type="button" onClick={addDeliveryZone} variant="outline">
                            Ajouter
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {deliveryZones.map((zone, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeDeliveryZone(zone)}>
                              {zone} ×
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Coût de livraison (FCFA)</Label>
                        <Input 
                          type="number"
                          min="0"
                          value={deliveryCost}
                          onChange={(e) => setDeliveryCost(parseInt(e.target.value) || 0)}
                          placeholder="Ex: 2000"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input 
                    placeholder="+241 XX XX XX XX"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input 
                    placeholder="+241 XX XX XX XX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="contact@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horaires d'ouverture
                </Label>
                <div className="space-y-3">
                  {Object.entries(businessHours).map(([day, hours]) => {
                    const dayNamesShort = {
                      monday: 'Lundi',
                      tuesday: 'Mardi', 
                      wednesday: 'Mercredi',
                      thursday: 'Jeudi',
                      friday: 'Vendredi',
                      saturday: 'Samedi',
                      sunday: 'Dimanche'
                    };

                    return (
                      <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-20 text-sm font-medium">
                          {dayNamesShort[day as keyof typeof dayNamesShort]}
                        </div>
                        <Switch 
                          checked={!hours.closed}
                          onCheckedChange={(checked) => 
                            setBusinessHours(prev => ({
                              ...prev,
                              [day]: { ...prev[day as keyof typeof prev], closed: !checked }
                            }))
                          }
                        />
                        {!hours.closed && (
                          <>
                            <Input 
                              type="time"
                              value={hours.open}
                              onChange={(e) => 
                                setBusinessHours(prev => ({
                                  ...prev,
                                  [day]: { ...prev[day as keyof typeof prev], open: e.target.value }
                                }))
                              }
                              className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">à</span>
                            <Input 
                              type="time"
                              value={hours.close}
                              onChange={(e) => 
                                setBusinessHours(prev => ({
                                  ...prev,
                                  [day]: { ...prev[day as keyof typeof prev], close: e.target.value }
                                }))
                              }
                              className="w-24"
                            />
                          </>
                        )}
                        {hours.closed && (
                          <span className="text-sm text-muted-foreground">Fermé</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Image de couverture</h3>
                  <p className="text-sm text-muted-foreground">
                    Choisissez l'image principale qui représentera votre catalogue
                  </p>
                </div>

                <MultiImageEnforcer
                  onImagesChanged={(images) => {
                    setCoverImage(images[0] || null);
                  }}
                  onCoverChanged={() => {}}
                  bucket="catalog-covers"
                  folder="covers"
                  currentImages={coverImage ? [coverImage] : []}
                  coverIndex={0}
                  minImages={1}
                  maxImages={1}
                  label="Image de couverture *"
                  description="Format 16:9 recommandé, max 2MB"
                />
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Images de présentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez des images pour présenter vos {catalogType === 'products' ? 'produits' : 'services'}
                  </p>
                </div>

                <MultiImageEnforcer
                  onImagesChanged={setCatalogImages}
                  onCoverChanged={setCoverImageIndex}
                  bucket="catalog-images"
                  folder="catalogs"
                  currentImages={catalogImages}
                  coverIndex={coverImageIndex}
                  minImages={1}
                  maxImages={10}
                  label="Images du catalogue (minimum 1) *"
                  description="Format libre, max 2MB chacune"
                />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Configuration des prix</h3>
                <p className="text-muted-foreground">
                  Définissez les prix de vos {catalogType === 'products' ? 'produits' : 'services'}
                </p>
              </div>

              <div className="space-y-4">
                <Label>Type de tarification *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${priceType === 'fixed' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'}`}
                    onClick={() => setPriceType('fixed')}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium">Prix fixe</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Un prix unique pour tout le catalogue
                      </p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${priceType === 'from' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'}`}
                    onClick={() => setPriceType('from')}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium">À partir de</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Prix de base "à partir de"
                      </p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${priceType === 'variable' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'}`}
                    onClick={() => setPriceType('variable')}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium">Prix variables</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Prix différents par {catalogType === 'products' ? 'produit' : 'service'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {(priceType === 'fixed' || priceType === 'from') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">
                      {priceType === 'fixed' ? 'Prix unique' : 'Prix de base'} *
                    </Label>
                    <Input 
                      id="basePrice"
                      type="number"
                      placeholder="Ex: 15000"
                      value={basePrice || ''}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la devise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FCFA">FCFA</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">Dollar ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {priceType === 'variable' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Prix individuels *</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPriceDetails([...priceDetails, { name: '', price: 0, description: '' }])}
                    >
                      Ajouter un prix
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {priceDetails.map((detail, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Nom du {catalogType === 'products' ? 'produit' : 'service'}</Label>
                            <Input 
                              placeholder={catalogType === 'products' ? "Ex: T-shirt rouge" : "Ex: Consultation 1h"}
                              value={detail.name}
                              onChange={(e) => {
                                const newDetails = [...priceDetails];
                                newDetails[index].name = e.target.value;
                                setPriceDetails(newDetails);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Prix ({priceCurrency})</Label>
                            <Input 
                              type="number"
                              placeholder="15000"
                              value={detail.price || ''}
                              onChange={(e) => {
                                const newDetails = [...priceDetails];
                                newDetails[index].price = Number(e.target.value);
                                setPriceDetails(newDetails);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description (optionnel)</Label>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Description courte"
                                value={detail.description}
                                onChange={(e) => {
                                  const newDetails = [...priceDetails];
                                  newDetails[index].description = e.target.value;
                                  setPriceDetails(newDetails);
                                }}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const newDetails = priceDetails.filter((_, i) => i !== index);
                                  setPriceDetails(newDetails);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 8 && (
            <CatalogBookingStep 
              catalogType={catalogType}
              bookingEnabled={bookingEnabled}
              setBookingEnabled={setBookingEnabled}
              bookingType={bookingType}
              setBookingType={setBookingType}
              requireApproval={requireApproval}
              setRequireApproval={setRequireApproval}
              allowOnlinePayment={allowOnlinePayment}
              setAllowOnlinePayment={setAllowOnlinePayment}
              advanceBookingDays={advanceBookingDays}
              setAdvanceBookingDays={setAdvanceBookingDays}
              bookingSlotsDuration={bookingSlotsDuration}
              setBookingSlotsDuration={setBookingSlotsDuration}
              availableDays={availableDays}
              setAvailableDays={setAvailableDays}
              bookingHours={bookingHours}
              setBookingHours={setBookingHours}
              maxBookingsPerSlot={maxBookingsPerSlot}
              setMaxBookingsPerSlot={setMaxBookingsPerSlot}
              depositRequired={depositRequired}
              setDepositRequired={setDepositRequired}
              depositAmount={depositAmount}
              setDepositAmount={setDepositAmount}
              cancellationPolicy={cancellationPolicy}
              setCancellationPolicy={setCancellationPolicy}
              specialInstructions={specialInstructions}
              setSpecialInstructions={setSpecialInstructions}
            />
          )}

          {currentStep === 9 && (
            <div className="space-y-6">
              {createdCatalogId ? (
                <ProductManager 
                  catalogId={createdCatalogId}
                  businessId={businessId}
                />
              ) : (
                <div className="text-center py-12">
                  {catalogType === 'products' ? (
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  ) : (
                    <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  )}
                  <h3 className="text-lg font-semibold mb-2">Prêt à créer votre catalogue</h3>
                  <p className="text-muted-foreground mb-6">
                    Cliquez sur "Créer le catalogue" pour continuer vers l'ajout de {catalogType === 'products' ? 'produits' : 'services'}
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
