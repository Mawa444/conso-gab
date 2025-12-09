  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStorageUpload } from "@/hooks/use-storage-upload";
import { useCatalogMutations } from "@/hooks/use-catalog-mutations";

const catalogSchema = z.object({
  name: z.string().min(3, "Le nom doit faire au moins 3 caractères"),
  description: z.string().optional(),
  category: z.string({ required_error: "La catégorie est requise" }),
  price: z.string().optional(), // Handled as string in input, parsed later
  is_public: z.boolean().default(true),
});

type CatalogFormValues = z.infer<typeof catalogSchema>;

interface CatalogFormProps {
  businessId: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CatalogForm = ({ businessId, initialData, onSuccess, onCancel }: CatalogFormProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialData?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uploadImages } = useStorageUpload();
  const { createCatalog, updateCatalog } = useCatalogMutations(businessId);

  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      price: initialData?.min_price?.toString() || "",
      is_public: initialData?.is_public ?? true,
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CatalogFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrls = initialData?.images || [];

      // 1. Upload new images if any
      if (images.length > 0) {
        const uploaded = await uploadImages('catalog-images', images, { 
          folder: `${businessId}/catalogs` 
        });
        if (uploaded) {
          imageUrls = [...imageUrls, ...uploaded.map(u => u.url)];
        }
      }

      // 2. Prepare payload
      const payload = {
        ...data,
        min_price: data.price ? parseFloat(data.price) : null,
        images: imageUrls,
        visibility: data.is_public ? 'published' : 'draft'
      };

      // 3. Mutate
      if (initialData?.id) {
        await updateCatalog({ id: initialData.id, updates: payload });
      } else {
        await createCatalog(payload);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du catalogue</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Menu Déjeuner, Collection Été..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Décrivez le contenu de ce catalogue..." {...field} />
              </FormControl>
              <FormMessage />
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors aspect-square">
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Ajouter</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </label>
          </div>
        </div>

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visibilité Publique</FormLabel>
                <FormDescription>
                  Rendre ce catalogue visible par tous les utilisateurs
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? "Enregistrer" : "Créer le catalogue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
