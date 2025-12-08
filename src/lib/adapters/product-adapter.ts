import { TablesInsert } from '@/integrations/supabase/types';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  sku: string;
  stockQuantity: string;
  images: string[];
  tags: string[];
  isActive: boolean;
}

/**
 * Transforms the Product Creation Wizard data (camelCase) to the Supabase Database format (snake_case).
 * @param formData The form data from the Product Creation Wizard
 * @param businessId The ID of the business owning the product
 * @param catalogId Optional catalog ID to associate the product with
 * @returns The Supabase insert object
 */
export const adaptProductFormDataToSupabase = (
  formData: ProductFormData,
  businessId: string,
  catalogId?: string
): Omit<TablesInsert<'products'>, 'id' | 'created_at' | 'updated_at'> => {
  return {
    business_id: businessId,
    catalog_id: catalogId || null,
    name: formData.name,
    description: formData.description,
    price: parseFloat(formData.price) || 0,
    category: formData.category,
    sku: formData.sku || null,
    stock_quantity: parseInt(formData.stockQuantity) || 0,
    images: formData.images as any, // Json type casting
    tags: formData.tags.length > 0 ? formData.tags : null,
    is_active: formData.isActive,
    is_available: formData.isActive, // Sync is_available with isActive for now
    is_on_sale: false // Default to false
  };
};
