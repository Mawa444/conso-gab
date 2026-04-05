import { z } from 'zod';

export const MessageTypeSchema = z.enum(['text', 'image', 'file', 'audio', 'video', 'location', 'document', 'system']);
export const MessageStatusSchema = z.enum(['sent', 'delivered', 'read', 'failed', 'sending']);

export const SenderProfileSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  avatar_url: z.string().optional().nullable(),
  pseudo: z.string().optional().nullable(),
});

export const MessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  content: z.string(),
  message_type: MessageTypeSchema,
  status: MessageStatusSchema.optional().default('sent'),
  created_at: z.string(),
  updated_at: z.string().optional(),
  attachment_url: z.string().optional().nullable(),
  reply_to_message_id: z.string().optional().nullable(),
  sender_profile: SenderProfileSchema.optional(),
});

export const ParticipantSchema = z.object({
  user_id: z.string(),
  role: z.enum(['admin', 'member', 'business', 'consumer']),
  last_read_at: z.string().optional().nullable(),
  joined_at: z.string(),
  profile: SenderProfileSchema.optional(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string().optional().nullable(),
  type: z.enum(['private', 'group', 'business']),
  created_at: z.string(),
  updated_at: z.string(),
  last_message_at: z.string().optional().nullable(),
  unread_count: z.number().optional().default(0),
  participants: z.array(ParticipantSchema),
  last_message: MessageSchema.optional().nullable(),
});
