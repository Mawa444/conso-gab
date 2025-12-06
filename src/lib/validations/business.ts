import { z } from 'zod';

export const businessProfileSchema = z.object({
  business_name: z.string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  
  business_category: z.string()
    .trim()
    .min(1, 'La catégorie est requise')
    .max(50),
  
  description: z.string()
    .trim()
    .max(2000, 'La description ne doit pas dépasser 2000 caractères')
    .optional()
    .nullable(),
  
  address: z.string()
    .trim()
    .max(200, 'L\'adresse ne doit pas dépasser 200 caractères')
    .optional()
    .nullable(),
  
  city: z.string()
    .trim()
    .max(100)
    .optional()
    .nullable(),
  
  phone: z.string()
    .trim()
    .regex(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable(),
  
  email: z.string()
    .trim()
    .email('Email invalide')
    .max(255)
    .optional()
    .nullable(),
  
  whatsapp: z.string()
    .trim()
    .regex(/^\+?[0-9]{8,15}$/, 'Numéro WhatsApp invalide')
    .optional()
    .nullable(),
  
  latitude: z.number()
    .min(-90)
    .max(90)
    .optional()
    .nullable(),
  
  longitude: z.number()
    .min(-180)
    .max(180)
    .optional()
    .nullable(),
  
  logo_url: z.string().url('URL invalide').optional().nullable(),
  cover_image_url: z.string().url('URL invalide').optional().nullable(),
});

export const bookingSchema = z.object({
  catalog_id: z.string().uuid('ID catalogue invalide'),
  business_id: z.string().uuid('ID business invalide'),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format YYYY-MM-DD)'),
  booking_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Heure invalide (format HH:MM:SS)'),
  customer_name: z.string().trim().min(2).max(100),
  customer_phone: z.string().trim().regex(/^\+?[0-9]{8,15}$/).optional().nullable(),
  customer_email: z.string().email().max(255).optional().nullable(),
  special_requests: z.string().trim().max(1000).optional().nullable(),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
