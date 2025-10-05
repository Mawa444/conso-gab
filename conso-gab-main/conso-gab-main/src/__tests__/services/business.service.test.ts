import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BusinessService } from '@/services/business.service';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('BusinessService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBusinessProfiles', () => {
    it('should fetch business profiles successfully', async () => {
      const mockData = [{
        id: 'test-id',
        business_name: 'Test Business',
        logo_url: 'test.jpg',
        is_primary: true,
        user_id: 'user-id',
        owner_id: 'user-id'
      }];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      } as any);

      const result = await BusinessService.fetchBusinessProfiles('user-id');

      expect(result).toHaveLength(1);
      expect(result[0].business_name).toBe('Test Business');
    });

    it('should throw error when fetch fails', async () => {
      const mockError = { message: 'Database error' };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      } as any);

      await expect(
        BusinessService.fetchBusinessProfiles('user-id')
      ).rejects.toThrow('Impossible de charger les profils business');
    });
  });

  describe('fetchCurrentMode', () => {
    it('should fetch current mode successfully', async () => {
      const mockData = {
        user_id: 'user-id',
        current_mode: 'business',
        current_business_id: 'business-id'
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      } as any);

      const result = await BusinessService.fetchCurrentMode('user-id');

      expect(result.current_mode).toBe('business');
      expect(result.current_business_id).toBe('business-id');
    });
  });

  describe('switchMode', () => {
    it('should switch mode successfully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null } as any);

      await expect(
        BusinessService.switchMode('user-id', 'business', 'business-id')
      ).resolves.not.toThrow();

      expect(supabase.rpc).toHaveBeenCalledWith('switch_user_profile', {
        profile_id: 'business-id'
      });
    });

    it('should throw error when switch fails', async () => {
      const mockError = { message: 'RPC error' };
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: mockError } as any);

      await expect(
        BusinessService.switchMode('user-id', 'business', 'business-id')
      ).rejects.toThrow('RPC error');
    });
  });

  describe('isBusinessOwner', () => {
    it('should return true when user is owner', async () => {
      const mockData = {
        user_id: 'user-id',
        owner_id: 'user-id'
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      } as any);

      const result = await BusinessService.isBusinessOwner('user-id', 'business-id');

      expect(result).toBe(true);
    });

    it('should return false when user is not owner', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
          })
        })
      } as any);

      const result = await BusinessService.isBusinessOwner('user-id', 'business-id');

      expect(result).toBe(false);
    });
  });

  describe('updateBusiness', () => {
    it('should update business successfully', async () => {
      // Mock isBusinessOwner
      vi.spyOn(BusinessService, 'isBusinessOwner').mockResolvedValue(true);

      const mockData = { id: 'business-id', business_name: 'Updated Name' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockData, error: null })
            })
          })
        })
      } as any);

      const result = await BusinessService.updateBusiness(
        'business-id', 
        'user-id', 
        { business_name: 'Updated Name' }
      );

      expect(result.business_name).toBe('Updated Name');
    });

    it('should throw error when user is not owner', async () => {
      vi.spyOn(BusinessService, 'isBusinessOwner').mockResolvedValue(false);

      await expect(
        BusinessService.updateBusiness('business-id', 'user-id', {})
      ).rejects.toThrow('Vous n\'avez pas les permissions');
    });
  });
});
