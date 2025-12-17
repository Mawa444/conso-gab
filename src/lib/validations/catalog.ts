import { z } from 'zod';

/**
 * 🔥 SCHÉMA ZOD COMPLET - Aligné avec la DB réelle
 * Tous les champs correspondent exactement à la table 'catalogs'
 */
export const catalogSchema = z.object({
  // Champs obligatoires
  business_id: z.string().uuid('ID business invalide'),
  name: z.string()
    .trim()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  
  // Champs de base
  description: z.string()
    .trim()
    .max(2000, 'La description ne doit pas dépasser 2000 caractères')
    .optional()
    .nullable(),
  
  category: z.string()
    .trim()
    .min(1, 'La catégorie est requise')
    .max(50, 'La catégorie ne doit pas dépasser 50 caractères')
    .optional()
    .nullable(),
  
  subcategory: z.string()
    .trim()
    .max(50, 'La sous-catégorie ne doit pas dépasser 50 caractères')
    .optional()
    .nullable(),
  
  catalog_type: z.enum(['products', 'services'])
    .default('products'),
  
  // Prix (utiliser 'price' comme en DB, pas 'base_price')
  price: z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .optional()
    .nullable(),
  
  price_currency: z.string()
    .default('XAF'),
  
  // Images
  cover_url: z.string()
    .url('URL de couverture invalide')
    .optional()
    .nullable(),
  
  images: z.array(z.string().url())
    .max(10, 'Maximum 10 images')
    .default([]),
  
  // SEO
  keywords: z.array(z.string())
    .max(20, 'Maximum 20 mots-clés')
    .default([]),
  
  seo_score: z.number()
    .int()
    .min(0)
    .max(100)
    .default(0),
  
  // Visibilité
  is_public: z.boolean()
    .default(false),
  
  is_active: z.boolean()
    .default(true),
  
  visibility: z.enum(['draft', 'published', 'archived'])
    .default('published'),
  
  // Livraison
  delivery_available: z.boolean()
    .default(false),
  
  delivery_cost: z.number()
    .min(0, 'Le coût de livraison ne peut pas être négatif')
    .optional()
    .nullable(),
  
  delivery_zones: z.array(z.string())
    .default([]),
  
  // Promotion
  on_sale: z.boolean()
    .default(false),
  
  sale_percentage: z.number()
    .min(0, 'La réduction ne peut pas être négative')
    .max(100, 'La réduction ne peut pas dépasser 100%')
    .optional()
    .nullable(),
  
  // Contact
  contact_whatsapp: z.string()
    .optional()
    .nullable(),
  
  contact_phone: z.string()
    .optional()
    .nullable(),
  
  contact_email: z.string()
    .email('Email invalide')
    .optional()
    .nullable(),
  
  // Géolocalisation
  geo_city: z.string()
    .optional()
    .nullable(),
  
  geo_district: z.string()
    .optional()
    .nullable(),
});

export const catalogCommentSchema = z.object({
  comment: z.string()
    .trim()
    .min(1, 'Le commentaire ne peut pas être vide')
    .max(1000, 'Le commentaire ne doit pas dépasser 1000 caractères'),
  
  rating: z.number()
    .int()
    .min(1, 'Note minimale: 1')
    .max(5, 'Note maximale: 5')
    .optional()
    .nullable()
});

export const catalogImageCommentSchema = z.object({
  comment: z.string()
    .trim()
    .min(1, 'Le commentaire ne peut pas être vide')
    .max(500, 'Le commentaire ne doit pas dépasser 500 caractères')
});

export type CatalogInput = z.infer<typeof catalogSchema>;
export type CatalogCommentInput = z.infer<typeof catalogCommentSchema>;
export type CatalogImageCommentInput = z.infer<typeof catalogImageCommentSchema>;
