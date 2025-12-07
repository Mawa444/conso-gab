import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Globe } from 'lucide-react';
import { useBusinessCreationContext } from './BusinessCreationContext';

export const StepContact = () => {
  const { formData, updateFormData } = useBusinessCreationContext();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Phone className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Contact</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Informations de contact (optionnel)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Téléphone
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="+241 xx xx xx xx"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="whatsapp" className="text-sm font-medium">
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => updateFormData({ whatsapp: e.target.value })}
            placeholder="+241 xx xx xx xx"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email professionnel
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="contact@monentreprise.ga"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Site web
          </Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => updateFormData({ website: e.target.value })}
            placeholder="https://monentreprise.ga"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};
