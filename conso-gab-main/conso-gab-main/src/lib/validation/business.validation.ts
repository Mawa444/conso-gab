import { z } from 'zod';

/**
 * ============================================
 * VALIDATION SCHEMAS - BUSINESS
 * ============================================
 * Schémas de validation centralisés pour toutes les opérations business
 * Utilisés côté client ET serveur (edge functions)
 */

// Validation des emails
const emailSchema = z.string()
  .trim()
  .email("Email invalide")
  .max(255, "Email trop long (max 255 caractères)")
  .transform(val => val.toLowerCase());

// Validation des téléphones (format international)
const phoneSchema = z.string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, "Format de téléphone invalide (format international requis)")
  .min(8, "Téléphone trop court")
  .max(20, "Téléphone trop long");

// Validation des URLs
const urlSchema = z.string()
  .trim()
  .url("URL invalide")
  .max(500, "URL trop longue");

// Validation du nom d'entreprise
const businessNameSchema = z.string()
  .trim()
  .min(2, "Le nom doit contenir au moins 2 caractères")
  .max(100, "Le nom ne peut dépasser 100 caractères")
  .regex(/^[a-zA-Z0-9À-ÿ\s\-'&.]+$/, "Caractères invalides dans le nom");

// Validation de la description
const descriptionSchema = z.string()
  .trim()
  .min(10, "La description doit contenir au moins 10 caractères")
  .max(1000, "La description ne peut dépasser 1000 caractères");

// Validation des coordonnées GPS
const latitudeSchema = z.number()
  .min(-90, "Latitude invalide")
  .max(90, "Latitude invalide");

const longitudeSchema = z.number()
  .min(-180, "Longitude invalide")
  .max(180, "Longitude invalide");

/**
 * Schema pour la création d'une entreprise
 */
export const createBusinessSchema = z.object({
  businessName: businessNameSchema,
  businessCategory: z.string()
    .min(1, "Catégorie requise"),
  description: descriptionSchema,
  
  // Optionnels mais validés si présents
  logoUrl: urlSchema.optional(),
  coverImageUrl: urlSchema.optional(),
  
  // Localisation
  country: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  arrondissement: z.string().max(100).optional(),
  quartier: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  
  // Contact
  businessPhone: phoneSchema.optional(),
  whatsapp: phoneSchema.optional(),
  businessEmail: emailSchema.optional(),
  website: urlSchema.optional(),
  openingHours: z.string().max(500).optional(),
  
  // Réseaux sociaux
  socialMedia: z.object({
    facebook: z.object({ enabled: z.boolean(), url: urlSchema.optional() }).optional(),
    instagram: z.object({ enabled: z.boolean(), url: urlSchema.optional() }).optional(),
    linkedin: z.object({ enabled: z.boolean(), url: urlSchema.optional() }).optional(),
    twitter: z.object({ enabled: z.boolean(), url: urlSchema.optional() }).optional(),
    tiktok: z.object({ enabled: z.boolean(), url: urlSchema.optional() }).optional(),
    youtube: z.object({ enabled: z.boolean(), url: urlSchema.optional() }).optional(),
  }).optional(),
  
  // Paiement
  bankAccount: z.string().max(100).optional(),
  mobileMoney: phoneSchema.optional(),
});

/**
 * Schema pour la mise à jour d'une entreprise
 */
export const updateBusinessSchema = createBusinessSchema.partial();

/**
 * Schema pour la création d'un catalogue
 */
export const createCatalogSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(200, "Le nom ne peut dépasser 200 caractères"),
  
  description: z.string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(2000, "La description ne peut dépasser 2000 caractères")
    .optional(),
  
  category: z.string().min(1, "Catégorie requise").optional(),
  subcategory: z.string().max(100).optional(),
  
  basePrice: z.number()
    .min(0, "Le prix ne peut être négatif")
    .max(100000000, "Prix trop élevé")
    .optional(),
  
  images: z.array(urlSchema)
    .max(10, "Maximum 10 images")
    .optional(),
  
  contactPhone: phoneSchema.optional(),
  contactWhatsapp: phoneSchema.optional(),
  contactEmail: emailSchema.optional(),
  
  keywords: z.array(z.string().max(50))
    .max(20, "Maximum 20 mots-clés")
    .optional(),
  
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

/**
 * Schema pour la création d'un produit
 */
export const createProductSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(200, "Le nom ne peut dépasser 200 caractères"),
  
  description: z.string()
    .trim()
    .max(5000, "La description ne peut dépasser 5000 caractères")
    .optional(),
  
  price: z.number()
    .min(0, "Le prix ne peut être négatif")
    .max(100000000, "Prix trop élevé"),
  
  compareAtPrice: z.number()
    .min(0, "Le prix ne peut être négatif")
    .optional(),
  
  stock: z.number()
    .int("Le stock doit être un nombre entier")
    .min(0, "Le stock ne peut être négatif")
    .optional(),
  
  sku: z.string()
    .max(100, "SKU trop long")
    .optional(),
  
  images: z.array(urlSchema)
    .max(10, "Maximum 10 images")
    .optional(),
  
  isActive: z.boolean().default(true),
});

/**
 * Type inference pour TypeScript
 */
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type CreateCatalogInput = z.infer<typeof createCatalogSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;

/**
 * Fonction helper pour valider et sanitizer les données
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Sanitize HTML content pour prévenir XSS
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}