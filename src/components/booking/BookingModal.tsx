import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  CheckCircle,
  Package,
  Store,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BookingConfig {
  id: string;
  booking_enabled: boolean;
  booking_type: string;
  require_approval: boolean;
  allow_online_payment: boolean;
  advance_booking_days: number;
  booking_slots_duration: number;
  available_days: string[];
  booking_hours: any;
  max_bookings_per_slot: number;
  deposit_required: boolean;
  deposit_amount: number;
  cancellation_policy?: string;
  special_instructions?: string;
}

interface Catalog {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  catalog_type: 'products' | 'services';
  business_id: string;
  businessName?: string;
  base_price?: number;
  price_currency?: string;
}

interface BookingModalProps {
  catalog: Catalog;
  open: boolean;
  onClose: () => void;
}

export const BookingModal = ({ catalog, open, onClose }: BookingModalProps) => {
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (open && catalog.id) {
      fetchBookingConfig();
    }
  }, [open, catalog.id]);

  const fetchBookingConfig = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('catalog_booking_config')
        .select('*')
        .eq('catalog_id', catalog.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching booking config:', error);
        return;
      }

      setBookingConfig(data as BookingConfig);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateTimeSlots = () => {
    if (!bookingConfig) return [];
    
    const slots = [];
    const startTime = bookingConfig.booking_hours.start;
    const endTime = bookingConfig.booking_hours.end;
    const duration = bookingConfig.booking_slots_duration;
    
    let current = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    while (current < end) {
      const timeString = current.toTimeString().slice(0, 5);
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + duration);
    }
    
    return slots;
  };

  const getBookingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      appointment: 'Rendez-vous',
      reservation: 'Réservation',
      order: 'Commande',
      rental: 'Location'
    };
    return labels[type] || type;
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Clock className="w-5 h-5" />;
      case 'reservation': return <CalendarIcon className="w-5 h-5" />;
      case 'order': return catalog.catalog_type === 'products' ? <Package className="w-5 h-5" /> : <Store className="w-5 h-5" />;
      case 'rental': return <Clock className="w-5 h-5" />;
      default: return <CalendarIcon className="w-5 h-5" />;
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !customerName) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const bookingData = {
        catalog_id: catalog.id,
        business_id: catalog.business_id,
        customer_id: user.user?.id,
        booking_number: `BKG-${Date.now()}`,
        booking_type: bookingConfig?.booking_type || 'appointment',
        booking_date: selectedDate.toISOString().split('T')[0],
        booking_time: selectedTime,
        status: bookingConfig?.require_approval ? 'pending' : 'confirmed',
        total_amount: catalog.base_price || 0,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        special_requests: specialRequests
      };

      const { data, error } = await (supabase as any)
        .from('catalog_bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Réservation créée",
        description: `Votre ${getBookingTypeLabel(bookingConfig?.booking_type || 'appointment').toLowerCase()} a été créée avec succès`,
      });

      setCurrentStep(3); // Step de confirmation
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de votre réservation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDate(new Date());
    setSelectedTime('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setSpecialRequests('');
  };

  if (!bookingConfig?.booking_enabled) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réservation non disponible</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Les réservations ne sont pas activées pour ce catalogue.
            </p>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getBookingTypeIcon(bookingConfig.booking_type)}
            {getBookingTypeLabel(bookingConfig.booking_type)} - {catalog.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === currentStep ? 'bg-primary text-white' :
                    step < currentStep ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
            <span className="text-muted-foreground">
              Étape {currentStep} sur 3
            </span>
          </div>

          <ScrollArea className="max-h-[60vh] pr-4">
            {/* Step 1: Date and Time Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Choisir une date
                  </Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => 
                      date < new Date() || 
                      (bookingConfig.advance_booking_days && 
                        date > new Date(Date.now() + bookingConfig.advance_booking_days * 24 * 60 * 60 * 1000))
                    }
                    className="rounded-md border w-full"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Choisir un créneau horaire
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {generateTimeSlots().map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="h-10"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {catalog.base_price && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Prix:</span>
                      <Badge variant="secondary" className="text-lg">
                        {catalog.base_price.toLocaleString()} {catalog.price_currency || 'FCFA'}
                      </Badge>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full"
                >
                  Continuer
                </Button>
              </div>
            )}

            {/* Step 2: Customer Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nom complet *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Téléphone *</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="votre@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Demandes spéciales</Label>
                  <Textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Informations supplémentaires..."
                    rows={3}
                  />
                </div>

                {bookingConfig.special_instructions && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Instructions spéciales</h4>
                    <p className="text-sm text-blue-800">{bookingConfig.special_instructions}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={handleBooking}
                    disabled={!customerName || !customerPhone || loading}
                    className="flex-1"
                  >
                    {loading ? 'Création...' : 'Confirmer la réservation'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {getBookingTypeLabel(bookingConfig.booking_type)} confirmée !
                  </h3>
                  <p className="text-muted-foreground">
                    {bookingConfig.require_approval
                      ? "Votre demande a été envoyée et est en attente d'approbation."
                      : "Votre réservation a été confirmée automatiquement."
                    }
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg text-left">
                  <h4 className="font-medium mb-2">Détails de la réservation</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{selectedDate?.toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heure:</span>
                      <span>{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{getBookingTypeLabel(bookingConfig.booking_type)}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={onClose} className="w-full">
                  Fermer
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};