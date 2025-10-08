import { z } from 'zod';

export const profileSchema = z.object({
  display_name: z.string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères')
    .optional()
    .nullable(),
  
  first_name: z.string()
    .trim()
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères')
    .optional()
    .nullable(),
  
  phone: z.string()
    .trim()
    .regex(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable(),
  
  avatar_url: z.string().url('URL invalide').optional().nullable(),
  cover_image_url: z.string().url('URL invalide').optional().nullable()
});

export const locationDataSchema = z.object({
  latitude: z.number()
    .min(-90, 'Latitude invalide')
    .max(90, 'Latitude invalide'),
  
  longitude: z.number()
    .min(-180, 'Longitude invalide')
    .max(180, 'Longitude invalide'),
  
  address: z.string().trim().max(200).optional(),
  formatted_address: z.string().trim().max(500).optional()
});

export const locationRequestSchema = z.object({
  target_id: z.string().uuid('ID utilisateur invalide'),
  conversation_id: z.string().uuid('ID conversation invalide'),
  purpose: z.enum(['delivery', 'meeting', 'emergency', 'general']).default('general'),
  share_mode: z.enum(['one_time', 'temporary', 'live']).default('one_time')
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type LocationDataInput = z.infer<typeof locationDataSchema>;
export type LocationRequestInput = z.infer<typeof locationRequestSchema>;
