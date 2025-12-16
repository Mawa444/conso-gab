import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, signUpSchema, signInSchema } from '@/services/auth.service';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(),
    })),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation Schemas', () => {
    it('devrait valider un email correct', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un email invalide', () => {
      const result = signInSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toContain('Email invalide');
    });

    it('devrait rejeter un mot de passe trop court', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'short',
        pseudo: 'testuser',
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0].message).toContain('au moins 8 caractères');
    });

    it('devrait valider un pseudo correct', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        pseudo: 'validuser',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('signUp', () => {
    it('devrait créer un compte avec des données valides', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'password123',
        pseudo: 'testuser',
        role: 'consumer',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
        })
      );
    });

    it('devrait retourner une erreur si les données sont invalides', async () => {
      const result = await AuthService.signUp({
        email: 'invalid-email',
        password: '123',
        pseudo: 'a', // trop court
        role: 'consumer',
      });

      expect(result.user).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBeTruthy();
    });

    it('devrait gérer les erreurs de Supabase', async () => {
      const mockError = { message: 'User already registered' };
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'password123',
        pseudo: 'testuser',
        role: 'consumer',
      });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signIn', () => {
    it('devrait connecter un utilisateur avec des credentials valides', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('devrait retourner une erreur pour des credentials invalides', async () => {
      const mockError = { message: 'Invalid login credentials' };
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('devrait déconnecter un utilisateur', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({ error: null });

      const result = await AuthService.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('devrait envoyer un email de réinitialisation', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        })
      );
    });

    it('devrait rejeter un email invalide', async () => {
      const result = await AuthService.resetPassword('invalid-email');

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Email invalide');
    });
  });

  describe('createUserProfile', () => {
    it('devrait créer un profil utilisateur', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        error: null,
      });
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const result = await AuthService.createUserProfile('user-123', {
        pseudo: 'testuser',
        role: 'consumer',
      });

      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });
  });

  describe('createBusinessProfile', () => {
    it('devrait créer un profil business', async () => {
      const mockBusinessId = 'business-123';
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockBusinessId },
            error: null,
          }),
        }),
      });
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const result = await AuthService.createBusinessProfile('user-123', {
        business_name: 'Test Business',
        business_category: 'Services',
        is_primary: true,
        is_active: true,
      });

      expect(result.businessId).toBe(mockBusinessId);
      expect(result.error).toBeNull();
    });
  });
});
