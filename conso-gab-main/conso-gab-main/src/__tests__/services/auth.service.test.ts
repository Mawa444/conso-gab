import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService, SignUpData } from '@/services/auth.service';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser: User = {
    id: 'test-user-id',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const signUpData: SignUpData = {
    email: 'test@example.com',
    password: 'password123',
    pseudo: 'tester',
    phone: '123456789',
    country: 'Gabon',
    province: 'Estuaire',
    department: 'Komo-Mondah',
    arrondissement: '1er',
    quartier: 'Centre-ville',
    address: '123 Rue Principale',
    latitude: 0.3924,
    longitude: 9.4586,
    role: 'client',
  };

  // --- Test signUp ---
  describe('signUp', () => {
    it('should sign up a user successfully', async () => {
      const signUpResponse = { data: { user: mockUser }, error: null };
      vi.mocked(supabase.auth.signUp).mockResolvedValue(signUpResponse as any);

      const { user, error } = await AuthService.signUp(signUpData);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            pseudo: signUpData.pseudo,
            role: signUpData.role,
          },
        },
      });
      expect(user).toEqual(mockUser);
      expect(error).toBeNull();
    });

    it('should return an error if sign up fails', async () => {
      const mockError = { message: 'Sign up failed' };
      const signUpResponse = { data: { user: null }, error: mockError };
      vi.mocked(supabase.auth.signUp).mockResolvedValue(signUpResponse as any);

      const { user, error } = await AuthService.signUp(signUpData);

      expect(user).toBeNull();
      expect(error).toEqual(mockError);
    });
  });

  // --- Test signIn ---
  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      const signInResponse = { data: { user: mockUser }, error: null };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(signInResponse as any);

      const { user, error } = await AuthService.signIn('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(user).toEqual(mockUser);
      expect(error).toBeNull();
    });

    it('should return an error if sign in fails', async () => {
      const mockError = { message: 'Invalid credentials' };
      const signInResponse = { data: { user: null }, error: mockError };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(signInResponse as any);

      const { user, error } = await AuthService.signIn('test@example.com', 'wrongpassword');

      expect(user).toBeNull();
      expect(error).toEqual(mockError);
    });
  });

  // --- Test signOut ---
  describe('signOut', () => {
    it('should sign out the user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any);

      const { error } = await AuthService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(error).toBeNull();
    });
  });

  // --- Test createUserProfile ---
  describe('createUserProfile', () => {
    it('should create a user profile successfully', async () => {
      const profileData = { ...signUpData };
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      const { error } = await AuthService.createUserProfile('test-user-id', profileData);

      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(error).toBeNull();
    });

    it('should return an error if profile creation fails', async () => {
        const profileData = { ...signUpData };
        const mockError = { message: 'Insert failed' };
        vi.mocked(supabase.from).mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: mockError }),
        } as any);

        const { error } = await AuthService.createUserProfile('test-user-id', profileData);

        expect(error).toEqual(mockError);
    });
  });
});