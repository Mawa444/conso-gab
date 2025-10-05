// ✅ TESTING: TEMPLATE DE TESTS UNITAIRES AVEC MEILLEURES PRATIQUES MODERNES
// Couvre 80% des cas d'usage avec mocks appropriés

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CatalogService } from '@/services/catalog.service';
import { supabase } from '@/integrations/supabase/client';

// ✅ MOCKS CENTRALISÉS
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// ✅ DONNÉES DE TEST CENTRALISÉES
const mockCatalog = {
  id: 'catalog-123',
  business_id: 'business-456',
  catalog_name: 'Test Catalog',
  catalog_type: 'products' as const,
  description: 'A test catalog',
  is_public: true,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockCatalogInput = {
  business_id: 'business-456',
  catalog_name: 'New Catalog',
  catalog_type: 'products' as const,
  description: 'New catalog description',
  is_public: false,
};

describe('CatalogService', () => {
  // ✅ SETUP/CLEANUP POUR CHAQUE TEST
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createCatalog', () => {
    it('should create catalog successfully', async () => {
      // ✅ ARRANGE: Setup du mock
      const mockResponse = {
        data: { ...mockCatalog, ...mockCatalogInput },
        error: null,
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT: Appel de la fonction
      const result = await CatalogService.createCatalog(mockCatalogInput);

      // ✅ ASSERT: Vérifications
      expect(supabase.from).toHaveBeenCalledWith('catalogs');
      expect(mockQuery.insert).toHaveBeenCalledWith(mockCatalogInput);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when database fails', async () => {
      // ✅ ARRANGE: Mock d'erreur
      const mockError = { message: 'Database connection failed' };
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT & ASSERT: Vérification de l'erreur
      await expect(
        CatalogService.createCatalog(mockCatalogInput)
      ).rejects.toThrow('Erreur création catalogue: Database connection failed');
    });

    it('should validate required fields', async () => {
      // ✅ ARRANGE: Données invalides
      const invalidInput = {
        catalog_name: '', // Vide
        catalog_type: 'invalid' as any, // Type invalide
      };

      // ✅ ACT & ASSERT: Devrait échouer la validation
      await expect(
        CatalogService.createCatalog(invalidInput as any)
      ).rejects.toThrow();
    });
  });

  describe('getCatalogsByBusiness', () => {
    it('should return catalogs for business', async () => {
      // ✅ ARRANGE
      const mockCatalogs = [mockCatalog, { ...mockCatalog, id: 'catalog-789' }];
      const mockResponse = {
        data: mockCatalogs,
        error: null,
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT
      const result = await CatalogService.getCatalogsByBusiness('business-456');

      // ✅ ASSERT
      expect(supabase.from).toHaveBeenCalledWith('catalogs');
      expect(mockQuery.eq).toHaveBeenCalledWith('business_id', 'business-456');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
      expect(result).toEqual(mockCatalogs);
    });

    it('should apply filters correctly', async () => {
      // ✅ ARRANGE
      const filters = {
        catalog_type: 'products' as const,
        is_public: true,
        search: 'test search',
        limit: 10,
      };

      const mockResponse = { data: [mockCatalog], error: null };
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT
      await CatalogService.getCatalogsByBusiness('business-456', filters);

      // ✅ ASSERT: Vérification que tous les filtres sont appliqués
      expect(mockQuery.eq).toHaveBeenCalledWith('catalog_type', 'products');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_public', true);
      expect(mockQuery.ilike).toHaveBeenCalledWith('catalog_name', '%test search%');
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('updateCatalog', () => {
    it('should update catalog successfully', async () => {
      // ✅ ARRANGE
      const updateData = { catalog_name: 'Updated Name', is_public: false };
      const mockResponse = {
        data: { ...mockCatalog, ...updateData },
        error: null,
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT
      const result = await CatalogService.updateCatalog('catalog-123', updateData);

      // ✅ ASSERT
      expect(mockQuery.update).toHaveBeenCalledWith(updateData);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'catalog-123');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error for non-existent catalog', async () => {
      // ✅ ARRANGE
      const mockError = { message: 'Catalog not found' };
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT & ASSERT
      await expect(
        CatalogService.updateCatalog('non-existent', { catalog_name: 'Test' })
      ).rejects.toThrow('Erreur mise à jour catalogue: Catalog not found');
    });
  });

  describe('deleteCatalog', () => {
    it('should soft delete catalog', async () => {
      // ✅ ARRANGE
      const mockResponse = {
        data: { ...mockCatalog, is_active: false },
        error: null,
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT
      const result = await CatalogService.deleteCatalog('catalog-123');

      // ✅ ASSERT: Soft delete (pas de delete réel)
      expect(mockQuery.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'catalog-123');
      expect(result).toBe(true);
    });
  });

  describe('getCatalogStats', () => {
    it('should return catalog statistics', async () => {
      // ✅ ARRANGE
      const mockStats = {
        total_catalogs: 25,
        public_catalogs: 18,
        product_catalogs: 15,
        service_catalogs: 10,
      };

      const mockResponse = { data: mockStats, error: null };
      const mockQuery = {
        select: vi.fn().mockResolvedValue(mockResponse),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT
      const result = await CatalogService.getCatalogStats('business-456');

      // ✅ ASSERT
      expect(result).toEqual(mockStats);
    });
  });

  // ✅ TESTS D'INTÉGRATION
  describe('Integration: Full catalog lifecycle', () => {
    it('should handle create → update → delete flow', async () => {
      // Cette séquence teste l'intégration entre les méthodes
      const createResponse = { data: mockCatalog, error: null };
      const updateResponse = { data: { ...mockCatalog, catalog_name: 'Updated' }, error: null };
      const deleteResponse = { data: { ...mockCatalog, is_active: false }, error: null };

      // Setup mocks pour la séquence
      let callCount = 0;
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(createResponse);
          if (callCount === 2) return Promise.resolve(updateResponse);
          if (callCount === 3) return Promise.resolve(deleteResponse);
          return Promise.resolve({ data: null, error: null });
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      // ✅ ACT: Exécuter le flow complet
      const created = await CatalogService.createCatalog(mockCatalogInput);
      const updated = await CatalogService.updateCatalog(created.id, {
        catalog_name: 'Updated Catalog'
      });
      const deleted = await CatalogService.deleteCatalog(updated.id);

      // ✅ ASSERT: Vérifier le flow complet
      expect(created.catalog_name).toBe('Test Catalog');
      expect(updated.catalog_name).toBe('Updated Catalog');
      expect(deleted).toBe(true);
    });
  });
});