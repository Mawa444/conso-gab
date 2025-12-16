import { renderHook, waitFor } from '@testing-library/react';
import { useBusinessDetail } from './useBusinessDetail';
import { supabase } from '@/integrations/supabase/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

// Mock useAuth
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

describe('useBusinessDetail Hook', () => {
  const businessId = 'test-business-id';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    // Mock initializing as loading
    const { result } = renderHook(() => useBusinessDetail(businessId));
    expect(result.current.isLoading).toBe(true);
  });

  it('should fetch and map business data correctly', async () => {
    const mockData = {
      id: businessId,
      business_name: 'Test Business',
      business_category: 'Retail',
      address: '123 Test St',
      phone: '1234567890',
      description: 'Test Description',
      is_sleeping: false,
      is_deactivated: false,
      logo_url: 'logo.jpg',
      cover_image_url: 'cover.jpg'
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useBusinessDetail(businessId));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.business).toEqual(expect.objectContaining({
      name: 'Test Business',
      type: 'Retail',
      phone: '1234567890',
      description: 'Test Description'
    }));
    
    expect(result.current.images.logoUrl).toBe('logo.jpg');
    expect(result.current.images.coverUrl).toBe('cover.jpg');
    expect(result.current.businessData.isSleeping).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ 
      data: null, 
      error: { message: 'Not found' } 
    });
    
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as any).mockImplementation(() => ({ select: mockSelect }));

    const { result } = renderHook(() => useBusinessDetail(businessId));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.business).toBeNull();
  });

  it('should allow updating local business data state', async () => {
    // Setup successful load first
    const mockSingle = vi.fn().mockResolvedValue({ 
        data: { 
            id: businessId,
            business_name: 'Test',
            business_category: 'Test',
            address: 'Test Addr',
            phone: '000',
            description: 'Desc'
        }, 
        error: null 
    });
    
    // Create a robust mock chain
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    (supabase.from as any).mockImplementation(() => ({ select: mockSelect }));

    const { result } = renderHook(() => useBusinessDetail(businessId));
    
    await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
    });

    // Act
    result.current.updateBusinessData({ isSleeping: true });

    // Assert
    expect(result.current.businessData.isSleeping).toBe(true);
  });
});
