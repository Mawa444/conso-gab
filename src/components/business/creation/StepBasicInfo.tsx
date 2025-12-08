import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { getAllBusinessCategories } from '@/data/businessCategories';
import { useBusinessCreationContext } from './BusinessCreationContext';

export const StepBasicInfo = () => {
  const { formData, updateFormData } = useBusinessCreationContext();
  const categories = getAllBusinessCategories();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Informations de base</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Présentez votre entreprise
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName" className="text-sm font-medium">
            Nom de l'entreprise *
          </Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => updateFormData({ businessName: e.target.value })}
            placeholder="Ex: Restaurant Le Gabonais"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium">
            Catégorie *
          </Label>
          <Select
            value={formData.businessCategory}
            onValueChange={(value) => updateFormData({ businessCategory: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.nom}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Décrivez votre activité en quelques mots..."
            maxLength={300}
            className="mt-1 min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.description.length}/300 caractères
          </p>
        </div>
      </div>
    </div>
  );
};
