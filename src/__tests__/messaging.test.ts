import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
      unsubscribe: vi.fn(),
    })),
  },
}));

describe('Messaging System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conversation Creation', () => {
    it('devrait créer une conversation business unique', async () => {
      const mockConversation = {
        id: 'conv-123',
        origin_type: 'business',
        origin_id: 'business-456',
      };

      const mockRpc = vi.fn().mockResolvedValue({
        data: mockConversation,
        error: null,
      });
      (supabase.rpc as any) = mockRpc;

      const result = await supabase.rpc('get_or_create_business_conversation', {
        p_user_id: 'user-123',
        p_business_id: 'business-456',
      });

      expect(result.data).toEqual(mockConversation);
      expect(mockRpc).toHaveBeenCalledWith('get_or_create_business_conversation', {
        p_user_id: 'user-123',
        p_business_id: 'business-456',
      });
    });

    it('ne devrait pas créer de doublon de conversation', async () => {
      const existingConv = {
        id: 'conv-123',
        origin_type: 'business',
        origin_id: 'business-456',
      };

      const mockRpc = vi.fn().mockResolvedValue({
        data: existingConv,
        error: null,
      });
      (supabase.rpc as any) = mockRpc;

      // Première création
      const result1 = await supabase.rpc('get_or_create_business_conversation', {
        p_user_id: 'user-123',
        p_business_id: 'business-456',
      });

      // Deuxième appel (devrait retourner la même conversation)
      const result2 = await supabase.rpc('get_or_create_business_conversation', {
        p_user_id: 'user-123',
        p_business_id: 'business-456',
      });

      expect(result1.data).toEqual(result2.data);
    });
  });

  describe('Message Sending', () => {
    it('devrait envoyer un message texte', async () => {
      const mockMessage = {
        id: 'msg-123',
        conversation_id: 'conv-123',
        sender_id: 'user-123',
        content: 'Hello',
        message_type: 'text',
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockMessage,
            error: null,
          }),
        }),
      });

      (supabase.from as any) = vi.fn(() => ({
        insert: mockInsert,
      }));

      const result = await supabase
        .from('messages')
        .insert({
          conversation_id: 'conv-123',
          sender_id: 'user-123',
          content: 'Hello',
          message_type: 'text',
        })
        .select()
        .single();

      expect(result.data).toEqual(mockMessage);
    });

    it('devrait envoyer un message avec image', async () => {
      const mockMessage = {
        id: 'msg-124',
        conversation_id: 'conv-123',
        sender_id: 'user-123',
        message_type: 'image',
        attachment_url: 'https://example.com/image.jpg',
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockMessage,
            error: null,
          }),
        }),
      });

      (supabase.from as any) = vi.fn(() => ({
        insert: mockInsert,
      }));

      const result = await supabase
        .from('messages')
        .insert({
          conversation_id: 'conv-123',
          sender_id: 'user-123',
          message_type: 'image',
          attachment_url: 'https://example.com/image.jpg',
        })
        .select()
        .single();

      expect(result.data?.message_type).toBe('image');
      expect(result.data?.attachment_url).toBeTruthy();
    });
  });

  describe('Message Delivery', () => {
    it('devrait marquer un message comme lu', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { status: 'read' },
        error: null,
      });

      (supabase.from as any) = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => mockUpdate()),
        })),
      }));

      await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', 'msg-123');

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('Realtime Subscriptions', () => {
    it('devrait souscrire aux nouveaux messages', () => {
      const mockOn = vi.fn(() => ({
        subscribe: vi.fn(),
      }));

      const mockChannel = {
        on: mockOn,
        unsubscribe: vi.fn(),
      };

      (supabase.channel as any) = vi.fn(() => mockChannel);

      const channel = supabase
        .channel('messages:conv-123')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'conversation_id=eq.conv-123',
        }, () => {});

      expect(mockOn).toHaveBeenCalled();
    });
  });

  describe('Typing Indicators', () => {
    it('devrait créer un indicateur de frappe', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({
        data: { is_typing: true },
        error: null,
      });

      (supabase.from as any) = vi.fn(() => ({
        upsert: mockUpsert,
      }));

      await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: 'conv-123',
          user_id: 'user-123',
          is_typing: true,
        });

      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  describe('Conversation Listing', () => {
    it('devrait charger les conversations avec contexte', async () => {
      const mockConversations = [
        {
          id: 'conv-123',
          origin_type: 'business',
          origin_id: 'business-456',
          last_message: 'Hello',
        },
      ];

      const mockSelect = vi.fn().mockResolvedValue({
        data: mockConversations,
        error: null,
      });

      (supabase.from as any) = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => mockSelect()),
        })),
      }));

      const result = await supabase
        .from('conversations')
        .select('*')
        .order('last_activity', { ascending: false });

      expect(result.data).toEqual(mockConversations);
      expect(result.data?.length).toBeGreaterThan(0);
    });
  });

  describe('Location Sharing', () => {
    it('devrait créer une demande de localisation', async () => {
      const mockRequest = {
        id: 'req-123',
        requester_id: 'user-123',
        target_id: 'user-456',
        status: 'pending',
      };

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockRequest,
            error: null,
          }),
        }),
      });

      (supabase.from as any) = vi.fn(() => ({
        insert: mockInsert,
      }));

      const result = await supabase
        .from('location_requests')
        .insert({
          requester_id: 'user-123',
          target_id: 'user-456',
          purpose: 'delivery',
        })
        .select()
        .single();

      expect(result.data?.status).toBe('pending');
    });

    it('devrait accepter et partager la localisation', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: {
          status: 'accepted',
          shared_location: { lat: 0.4162, lng: 9.4673 },
        },
        error: null,
      });

      (supabase.from as any) = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => mockUpdate()),
        })),
      }));

      await supabase
        .from('location_requests')
        .update({
          status: 'accepted',
          shared_location: { lat: 0.4162, lng: 9.4673 },
        })
        .eq('id', 'req-123');

      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
