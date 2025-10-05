import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
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
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create user account successfully', async () => {
      const mockSignUpData = {
        user: { id: 'user-123', email: 'test@example.com' },
        error: null,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockSignUpData);

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'password123',
        pseudo: 'TestUser',
        phone: '+1234567890',
        country: 'Gabon',
        province: 'Estuaire',
        department: 'Libreville',
        arrondissement: 'Libreville',
        quartier: 'Centre-ville',
        address: '123 Main St',
        latitude: 0.4162,
        longitude: 9.4673,
        role: 'client',
      });

      expect(result.user).toEqual(mockSignUpData.user);
      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: expect.objectContaining({
          emailRedirectTo: expect.any(String),
          data: expect.objectContaining({
            pseudo: 'TestUser',
            role: 'client',
          }),
        }),
      });
    });

    it('should handle signup error', async () => {
      const mockError = { message: 'Email already exists' };
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        user: null,
        error: mockError,
      });

      const result = await AuthService.signUp({
        email: 'existing@example.com',
        password: 'password123',
        pseudo: 'TestUser',
        phone: '+1234567890',
        country: 'Gabon',
        province: 'Estuaire',
        department: 'Libreville',
        arrondissement: 'Libreville',
        quartier: 'Centre-ville',
        address: '123 Main St',
        latitude: 0.4162,
        longitude: 9.4673,
        role: 'client',
      });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('createUserProfile', () => {
    it('should create user profile successfully', async () => {
      const mockResponse = { data: null, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any);

      const result = await AuthService.createUserProfile('user-123', {
        pseudo: 'TestUser',
        phone: '+1234567890',
        country: 'Gabon',
        province: 'Estuaire',
        department: 'Libreville',
        arrondissement: 'Libreville',
        quartier: 'Centre-ville',
        address: '123 Main St',
        latitude: 0.4162,
        longitude: 9.4673,
        role: 'client',
      });

      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should handle profile creation error', async () => {
      const mockError = { message: 'Database error' };
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      } as any);

      const result = await AuthService.createUserProfile('user-123', {
        pseudo: 'TestUser',
        phone: '+1234567890',
        country: 'Gabon',
        province: 'Estuaire',
        department: 'Libreville',
        arrondissement: 'Libreville',
        quartier: 'Centre-ville',
        address: '123 Main St',
        latitude: 0.4162,
        longitude: 9.4673,
        role: 'client',
      });

      expect(result.error).toEqual(mockError);
    });
  });

  describe('createBusinessProfile', () => {
    it('should create business profile successfully', async () => {
      const mockResponse = { data: { id: 'business-123' }, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any);

      const result = await AuthService.createBusinessProfile('user-123', {
        business_name: 'Test Business',
        business_category: 'restaurant',
        description: 'A test business',
        country: 'Gabon',
        province: 'Estuaire',
        department: 'Libreville',
        arrondissement: 'Libreville',
        quartier: 'Centre-ville',
        address: '123 Main St',
        latitude: 0.4162,
        longitude: 9.4673,
        is_primary: true,
        is_active: true,
      });

      expect(result.businessId).toBe('business-123');
      expect(result.error).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockSignInData = {
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockSignInData);

      const result = await AuthService.signIn('test@example.com', 'password123');

      expect(result.user).toEqual(mockSignInData.data.user);
      expect(result.error).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await AuthService.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});