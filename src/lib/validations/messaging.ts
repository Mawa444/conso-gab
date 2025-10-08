import { z } from 'zod';

export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Le message ne peut pas être vide')
    .max(5000, 'Le message ne doit pas dépasser 5000 caractères'),
  
  message_type: z.enum(['text', 'image', 'audio', 'document', 'location', 'system', 'file', 'video'])
    .default('text'),
  
  attachment_url: z.string().url('URL invalide').optional().nullable(),
  
  conversation_id: z.string().uuid('ID conversation invalide')
});

export const conversationSchema = z.object({
  title: z.string()
    .trim()
    .max(100, 'Le titre ne doit pas dépasser 100 caractères')
    .optional()
    .nullable(),
  
  conversation_type: z.enum(['private', 'group', 'business']).default('private')
});

export const businessConversationSchema = z.object({
  business_id: z.string().uuid('ID business invalide')
});

export type MessageInput = z.infer<typeof messageSchema>;
export type ConversationInput = z.infer<typeof conversationSchema>;
export type BusinessConversationInput = z.infer<typeof businessConversationSchema>;
