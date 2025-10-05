import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { AuthService } from '@/services/auth.service';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

// Mock NavigationService
vi.mock('@/services/navigation.service', () => ({
  NavigationService: {
    navigateToProfile: vi.fn(),
    shouldRedirectProfileToBusiness: vi.fn(() => false),
  },
}));

// Test component that simulates a complete auth flow
const AuthFlowTest = () => {
  const { user, loading, signIn, signUp, signOut, resetPassword } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {
    return (
      <div>
        <div data-testid="user-info">
          Welcome {user.email}
        </div>
        <button onClick={signOut} data-testid="sign-out-btn">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => signIn('test@example.com', 'password')}
        data-testid="sign-in-btn"
      >
        Sign In
      </button>
      <button
        onClick={() => signUp({
          email: 'new@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          userType: 'consumer'
        })}
        data-testid="sign-up-btn"
      >
        Sign Up
      </button>
      <button
        onClick={() => resetPassword('test@example.com')}
        data-testid="reset-btn"
      >
        Reset Password
      </button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  describe('Initial Load', () => {
    it('should show loading state initially', async () => {
      vi.mocked(supabase.auth.getSession).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { session: null },
          error: null,
        }), 100))
      );

      renderWithProviders(<AuthFlowTest />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    it('should show sign in options when no user', async () => {
      renderWithProviders(<AuthFlowTest />);

      await waitFor(() => {
        expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument();
        expect(screen.getByTestId('sign-up-btn')).toBeInTheDocument();
        expect(screen.getByTestId('reset-btn')).toBeInTheDocument();
      });
    });
  });

  describe('Sign In Flow', () => {
    it('should successfully sign in user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { firstName: 'John', lastName: 'Doe' }
      };

      const mockSignInResult = {
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockSignInResult);

      renderWithProviders(<AuthFlowTest />);

      const signInButton = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome test@example.com');
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign in error', async () => {
      const mockError = { message: 'Invalid credentials' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      // Mock console.error to avoid test output pollution
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProviders(<AuthFlowTest />);

      const signInButton = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Sign in failed:', mockError);
      });

      // Should still show sign in options
      expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Sign Up Flow', () => {
    it('should successfully create new account', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'new@example.com',
        user_metadata: { firstName: 'John', lastName: 'Doe' }
      };

      const mockSignUpResult = {
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockSignUpResult);

      renderWithProviders(<AuthFlowTest />);

      const signUpButton = screen.getByTestId('sign-up-btn');
      fireEvent.click(signUpButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome new@example.com');
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            firstName: 'John',
            lastName: 'Doe',
            userType: 'consumer',
          },
        },
      });
    });

    it('should handle sign up validation error', async () => {
      const mockError = { message: 'Password too weak' };
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProviders(<AuthFlowTest />);

      const signUpButton = screen.getByTestId('sign-up-btn');
      fireEvent.click(signUpButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Sign up failed:', mockError);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Sign Out Flow', () => {
    it('should successfully sign out user', async () => {
      // First sign in
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { firstName: 'John', lastName: 'Doe' }
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      renderWithProviders(<AuthFlowTest />);

      // Sign in first
      const signInButton = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toBeInTheDocument();
      });

      // Now sign out
      const signOutButton = screen.getByTestId('sign-out-btn');
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
        expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Password Reset Flow', () => {
    it('should send password reset email', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      renderWithProviders(<AuthFlowTest />);

      const resetButton = screen.getByTestId('reset-btn');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          { redirectTo: expect.any(String) }
        );
      });
    });
  });

  describe('Auth State Persistence', () => {
    it('should restore user session on reload', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'returning@example.com',
        user_metadata: { firstName: 'Jane', lastName: 'Smith' }
      };

      const mockSession = {
        data: {
          session: {
            user: mockUser,
            access_token: 'valid-token',
            refresh_token: 'refresh-token'
          }
        },
        error: null,
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);

      renderWithProviders(<AuthFlowTest />);

      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome returning@example.com');
      });
    });

    it('should handle expired session', async () => {
      // Start with valid session
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { firstName: 'John', lastName: 'Doe' }
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: mockUser,
            access_token: 'expired-token',
            refresh_token: 'expired-refresh'
          }
        },
        error: null,
      });

      // Mock auth state change to simulate token expiry
      let authStateCallback: any;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      renderWithProviders(<AuthFlowTest />);

      // Initially should show user
      await waitFor(() => {
        expect(screen.getByTestId('user-info')).toBeInTheDocument();
      });

      // Simulate token expiry
      authStateCallback('TOKEN_REFRESHED', null);

      // Should still show user (assuming refresh worked)
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProviders(<AuthFlowTest />);

      const signInButton = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Sign in failed:',
          expect.any(Error)
        );
      });

      // UI should remain stable
      expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should handle malformed responses', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: null, // Malformed response
        error: null,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProviders(<AuthFlowTest />);

      const signInButton = screen.getByTestId('sign-in-btn');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Sign in failed: Invalid response format'
        );
      });

      consoleSpy.mockRestore();
    });
  });
});