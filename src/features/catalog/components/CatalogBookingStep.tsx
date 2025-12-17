import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, CreditCard, Shield } from 'lucide-react';

interface BookingStepProps {
  catalogType: 'products' | 'services';
  bookingEnabled: boolean;
  setBookingEnabled: (enabled: boolean) => void;
  bookingType: 'appointment' | 'reservation' | 'order' | 'rental';
  setBookingType: (type: 'appointment' | 'reservation' | 'order' | 'rental') => void;
  requireApproval: boolean;
  setRequireApproval: (required: boolean) => void;
  allowOnlinePayment: boolean;
  setAllowOnlinePayment: (allowed: boolean) => void;
  advanceBookingDays: number;
  setAdvanceBookingDays: (days: number) => void;
  bookingSlotsDuration: number;
  setBookingSlotsDuration: (duration: number) => void;
  availableDays: string[];
  setAvailableDays: (days: string[]) => void;
  bookingHours: { start: string; end: string };
  setBookingHours: (hours: { start: string; end: string }) => void;
  maxBookingsPerSlot: number;
  setMaxBookingsPerSlot: (max: number) => void;
  depositRequired: boolean;
  setDepositRequired: (required: boolean) => void;
  depositAmount: number;
  setDepositAmount: (amount: number) => void;
  cancellationPolicy: string;
  setCancellationPolicy: (policy: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (instructions: string) => void;
}

export const CatalogBookingStep = ({ 
  catalogType, bookingEnabled, setBookingEnabled, bookingType, setBookingType,
  requireApproval, setRequireApproval, allowOnlinePayment, setAllowOnlinePayment,
  advanceBookingDays, setAdvanceBookingDays, bookingSlotsDuration, setBookingSlotsDuration,
  availableDays, setAvailableDays, bookingHours, setBookingHours,
  maxBookingsPerSlot, setMaxBookingsPerSlot, depositRequired, setDepositRequired,
  depositAmount, setDepositAmount, cancellationPolicy, setCancellationPolicy,
  specialInstructions, setSpecialInstructions
}: BookingStepProps) => {
  const dayNames = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Configuration des réservations</h3>
        <p className="text-muted-foreground">
          Permettez à vos clients de réserver vos {catalogType === 'products' ? 'produits' : 'services'}
        </p>
      </div>

      {/* Enable booking toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1">
          <Label className="text-base font-medium">
            Activer les réservations
          </Label>
          <p className="text-sm text-muted-foreground">
            Permettre aux clients de réserver directement depuis votre catalogue
          </p>
        </div>
        <Switch checked={bookingEnabled} onCheckedChange={setBookingEnabled} />
      </div>

      {bookingEnabled && (
        <div className="space-y-6">
          {/* Booking Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Type de réservation</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'appointment', label: 'Rendez-vous', icon: Calendar },
                { key: 'reservation', label: 'Réservation', icon: Clock },
                { key: 'order', label: 'Commande', icon: CreditCard },
                { key: 'rental', label: 'Location', icon: Shield }
              ].map(({ key, label, icon: Icon }) => (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all ${bookingType === key ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'}`}
                  onClick={() => setBookingType(key as any)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <span className="text-sm font-medium">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Approbation requise</Label>
              <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Paiement en ligne</Label>
              <Switch checked={allowOnlinePayment} onCheckedChange={setAllowOnlinePayment} />
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Réservation à l'avance (jours)</Label>
              <Input 
                type="number" 
                value={advanceBookingDays} 
                onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Durée des créneaux (minutes)</Label>
              <Select value={bookingSlotsDuration.toString()} onValueChange={(v) => setBookingSlotsDuration(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                  <SelectItem value="240">4 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Clients par créneau</Label>
              <Input 
                type="number" 
                value={maxBookingsPerSlot} 
                onChange={(e) => setMaxBookingsPerSlot(Number(e.target.value))}
                min="1"
              />
            </div>
          </div>

          {/* Available Days */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Jours disponibles</Label>
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(dayNames).map(([key, name]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDay(key)}
                  className={`p-2 text-sm rounded border transition-colors ${
                    availableDays.includes(key) 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heure de début</Label>
              <Input 
                type="time" 
                value={bookingHours.start} 
                onChange={(e) => setBookingHours({ ...bookingHours, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure de fin</Label>
              <Input 
                type="time" 
                value={bookingHours.end} 
                onChange={(e) => setBookingHours({ ...bookingHours, end: e.target.value })}
              />
            </div>
          </div>

          {/* Deposit */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Acompte requis</Label>
              <Switch checked={depositRequired} onCheckedChange={setDepositRequired} />
            </div>
            {depositRequired && (
              <div className="space-y-2">
                <Label>Montant de l'acompte (FCFA)</Label>
                <Input 
                  type="number" 
                  value={depositAmount} 
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Politique d'annulation</Label>
              <Textarea 
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                placeholder="Ex: Annulation gratuite jusqu'à 24h avant..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Instructions spéciales</Label>
              <Textarea 
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Instructions pour vos clients..."
                rows={3}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
