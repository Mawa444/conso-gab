/**
 * ============================================
 * VALIDATION SCHEMAS - ZOD
 * ============================================
 * Schémas de validation centralisés pour toutes les edge functions
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// ============================================
// CONVERSATION SCHEMAS
// ============================================

export const createConversationSchema = z.object({
  origin_type: z.enum(['business', 'direct', 'group', 'mimo_chat']),
  origin_id: z.string().uuid().nullable().optional(),
  title: z.string().max(255).optional(),
  type: z.enum(['private', 'group', 'business']).default('private'),
  participants: z.array(
    z.object({
      user_id: z.string().uuid('Invalid user ID'),
      role: z.enum(['consumer', 'business', 'member', 'admin', 'owner']).default('member')
    })
  ).min(1, 'At least one participant required').max(100, 'Too many participants')
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;

// ============================================
// ORDER SCHEMAS
// ============================================

export const orderItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  price_cents: z.number().int().positive('Price must be positive').max(1000000000, 'Price too large'),
  quantity: z.number().int().positive('Quantity must be positive').max(1000, 'Quantity too large')
});

export const createOrderSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID').optional(),
  seller_id: z.string().uuid('Invalid seller ID'),
  items: z.array(orderItemSchema).min(1, 'At least one item required').max(100, 'Too many items'),
  currency: z.enum(['XAF', 'EUR', 'USD']).default('XAF'),
  delivery_address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ============================================
// QUOTE SCHEMAS
// ============================================

export const quoteItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID').optional(),
  description: z.string().max(500),
  unit_price: z.number().positive('Unit price must be positive'),
  quantity: z.number().int().positive('Quantity must be positive').max(1000, 'Quantity too large')
});

export const createQuoteSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  customer_id: z.string().uuid('Invalid customer ID'),
  conversation_id: z.string().uuid('Invalid conversation ID').optional(),
  items: z.array(quoteItemSchema).min(1, 'At least one item required').max(100, 'Too many items'),
  discount_percentage: z.number().min(0).max(100).default(0),
  valid_until: z.string().datetime().optional(),
  notes: z.string().max(1000).optional()
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

// ============================================
// RESERVATION SCHEMAS
// ============================================

export const createReservationSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  customer_id: z.string().uuid('Invalid customer ID'),
  catalog_id: z.string().uuid('Invalid catalog ID').optional(),
  service_name: z.string().max(255),
  start_datetime: z.string().datetime(),
  duration_minutes: z.number().int().positive().max(1440, 'Duration too long'),
  guest_count: z.number().int().positive().max(100, 'Too many guests').default(1),
  special_requests: z.string().max(1000).optional()
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

// ============================================
// PROCESS PAYMENT SCHEMA
// ============================================

export const processPaymentSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  payment_method: z.enum(['mtn_momo', 'airtel_money', 'card', 'cash']),
  phone_number: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number').optional(),
  amount_cents: z.number().int().positive('Amount must be positive'),
  currency: z.enum(['XAF', 'EUR', 'USD']).default('XAF')
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;

// ============================================
// VALIDATION ERROR CLASS
// ============================================

export class ValidationError extends Error {
  errors: z.ZodError;
  
  constructor(zodError: z.ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = zodError;
  }
}

// ============================================
// HELPER: VALIDATE REQUEST
// ============================================

/**
 * Valide le body d'une requête avec un schéma Zod
 * Lance une erreur si la validation échoue
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await req.json();
  
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${messages}`);
    }
    throw error;
  }
}

/**
 * Valide un objet avec un schéma Zod (sync)
 * @throws ValidationError si validation échoue
 */
export function validateSync<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
}

/**
 * Formate une erreur de validation pour la réponse HTTP
 */
export function formatValidationError(error: z.ZodError): string {
  return error.errors
    .map(e => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
}
