import { z } from 'zod';

export const catalogSchema = z.object({
  name: z.string()
    .trim()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  
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
  
  base_price: z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .optional()
    .nullable(),
  
  is_public: z.boolean().default(true),
  is_active: z.boolean().default(true),
  
  delivery_available: z.boolean().default(false),
  delivery_cost: z.number().min(0).optional().nullable(),
  
  images: z.array(z.string().url()).max(10, 'Maximum 10 images').optional(),
  
  business_id: z.string().uuid('ID business invalide')
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
