import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OperatorDashboardModal } from '@/components/business/OperatorDashboardModal';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as ReactRouterDom from 'react-router-dom';
import * as ProfileMode from '@/hooks/use-profile-mode';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock useProfileMode
vi.mock('@/hooks/use-profile-mode', () => ({
  useProfileMode: vi.fn(),
}));

describe('OperatorDashboardModal', () => {
  const mockNavigate = vi.fn();
  const mockSwitchMode = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (ReactRouterDom.useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('navigates to dashboard when "Statistiques" is clicked', async () => {
    // Setup mock for business mode
    (ProfileMode.useProfileMode as any).mockReturnValue({
      currentMode: 'business',
      currentBusinessId: 'biz-123',
      businessProfiles: [],
      switchMode: mockSwitchMode,
      getCurrentBusiness: () => ({ id: 'biz-123', business_name: 'Test Biz' }),
    });

    render(<OperatorDashboardModal open={true} onOpenChange={mockOnOpenChange} />);

    // Find and click the Statistics button
    const statsButton = screen.getByText('Statistiques');
    fireEvent.click(statsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/business/biz-123/dashboard');
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('navigates to create business page when "Créer une entreprise" is clicked', () => {
    (ProfileMode.useProfileMode as any).mockReturnValue({
      currentMode: 'consumer',
      currentBusinessId: null,
      businessProfiles: [],
      switchMode: mockSwitchMode,
      getCurrentBusiness: () => null,
    });

    render(<OperatorDashboardModal open={true} onOpenChange={mockOnOpenChange} />);

    const createButton = screen.getByText('Créer une entreprise');
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/entreprises/create');
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
