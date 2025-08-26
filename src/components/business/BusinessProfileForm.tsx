import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';

interface BusinessProfile {
  id?: string;
  business_name: string;
  business_category: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  telegram: string;
  website: string;
}

interface BusinessProfileFormProps {
  businessProfile?: BusinessProfile;
  onSuccess: (profile: BusinessProfile) => void;
  onCancel?: () => void;
}

export const BusinessProfileForm = ({ businessProfile, onSuccess, onCancel }: BusinessProfileFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    business_name: businessProfile?.business_name || '',
    business_category: (businessProfile?.business_category || 'retail') as any,
    description: businessProfile?.description || '',
    address: businessProfile?.address || '',
    city: businessProfile?.city || '',
    phone: businessProfile?.phone || '',
    whatsapp: businessProfile?.whatsapp || '',
    email: businessProfile?.email || '',
    telegram: businessProfile?.telegram || '',
    website: businessProfile?.website || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      if (businessProfile?.id) {
        // Update existing profile
        const { data, error } = await supabase
          .from('business_profiles')
          .update(formData)
          .eq('id', businessProfile.id)
          .select()
          .single();

        if (error) throw error;
        onSuccess(data);
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('business_profiles')
          .insert({
            ...formData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        onSuccess(data);
      }

      toast({
        title: "Succès",
        description: businessProfile?.id ? "Profil mis à jour" : "Profil créé avec succès",
      });
    } catch (error: any) {
      console.error('Error saving business profile:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="business_name">Nom de l'entreprise *</Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_category">Catégorie *</Label>
          <Select 
            value={formData.business_category} 
            onValueChange={(value) => handleInputChange('business_category', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="retail">Commerce</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="technology">Technologie</SelectItem>
              <SelectItem value="healthcare">Santé</SelectItem>
              <SelectItem value="education">Éducation</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="real_estate">Immobilier</SelectItem>
              <SelectItem value="automotive">Automobile</SelectItem>
              <SelectItem value="beauty">Beauté</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="entertainment">Divertissement</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="manufacturing">Fabrication</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          placeholder="Décrivez votre entreprise..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informations de contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+241 XX XX XX XX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              placeholder="+241 XX XX XX XX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram</Label>
            <Input
              id="telegram"
              value={formData.telegram}
              onChange={(e) => handleInputChange('telegram', e.target.value)}
              placeholder="@username"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.example.com"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            businessProfile?.id ? 'Mettre à jour' : 'Créer le profil'
          )}
        </Button>
      </div>
    </form>
  );

  if (onCancel && businessProfile) {
    return (
      <Dialog open={true} onOpenChange={() => onCancel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le profil business</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {businessProfile?.id ? 'Modifier le profil business' : 'Créer votre profil business'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};