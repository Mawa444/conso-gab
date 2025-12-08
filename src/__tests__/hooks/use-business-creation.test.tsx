import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBusinessCreation } from '@/hooks/use-business-creation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn()
  }
}));

describe('useBusinessCreation', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('should initialize with closed form', () => {
    const { result } = renderHook(() => useBusinessCreation());
    
    expect(result.current.showCreateForm).toBe(false);
  });

  it('should open business creation form', () => {
    const { result } = renderHook(() => useBusinessCreation());
    
    act(() => {
      result.current.openBusinessCreation();
    });

    expect(result.current.showCreateForm).toBe(true);
  });

  it('should close business creation form', () => {
    const { result } = renderHook(() => useBusinessCreation());
    
    act(() => {
      result.current.openBusinessCreation();
    });
    
    expect(result.current.showCreateForm).toBe(true);

    act(() => {
      result.current.closeBusinessCreation();
    });

    expect(result.current.showCreateForm).toBe(false);
  });

  it('should navigate to creation page', () => {
    const { result } = renderHook(() => useBusinessCreation());
    
    act(() => {
      result.current.goToCreationPage();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/entreprises/create');
  });

  it('should handle business created successfully', () => {
    const { result } = renderHook(() => useBusinessCreation());
    const businessId = 'test-business-id';
    
    act(() => {
      result.current.openBusinessCreation();
    });

    act(() => {
      result.current.handleBusinessCreated(businessId);
    });

    expect(result.current.showCreateForm).toBe(false);
    expect(toast.success).toHaveBeenCalledWith("Entreprise créée avec succès !");
    expect(mockNavigate).toHaveBeenCalledWith(`/business/${businessId}/profile`);
  });

  it('should handle business creation cancelled', () => {
    const { result } = renderHook(() => useBusinessCreation());
    
    act(() => {
      result.current.openBusinessCreation();
    });

    act(() => {
      result.current.handleBusinessCreationCancelled();
    });

    expect(result.current.showCreateForm).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/entreprises');
  });
});
