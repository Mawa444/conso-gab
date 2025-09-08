import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateCatalog } from '@/hooks/use-create-catalog';

interface CatalogCreateFormProps {
  businessId: string;
  onCancel?: () => void;
  onCreated?: (catalogId?: string) => void;
}

export const CatalogCreateForm = ({ businessId, onCancel, onCreated }: CatalogCreateFormProps) => {
  const { createCatalog, isCreating } = useCreateCatalog(businessId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [subcategory, setSubcategory] = useState<string | undefined>();
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catalog = await createCatalog({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      subcategory,
      isPublic,
      images: [],
    });

    onCreated?.(catalog?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du catalogue</Label>
          <Input id="name" placeholder="Ex: Nouveautés" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Visibilité</Label>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm text-muted-foreground">Rendre public après création</span>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Décrivez le contenu du catalogue" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select value={category} onValueChange={(v) => setCategory(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mode">Mode</SelectItem>
              <SelectItem value="beaute">Beauté</SelectItem>
              <SelectItem value="restauration">Restauration</SelectItem>
              <SelectItem value="services">Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sous-catégorie</Label>
          <Select value={subcategory} onValueChange={(v) => setSubcategory(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homme">Homme</SelectItem>
              <SelectItem value="femme">Femme</SelectItem>
              <SelectItem value="enfants">Enfants</SelectItem>
              <SelectItem value="autres">Autres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isCreating}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};