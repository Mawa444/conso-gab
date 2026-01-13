import { CatalogCard } from './CatalogCard';
import { Catalog } from '@/types/entities/catalog.types';

interface PublicCatalogCardProps {
  catalog: any; // Using any to handle the joined data structure from usePublicCatalogs
  onSelect?: () => void;
}

export const PublicCatalogCard = ({ catalog, onSelect }: PublicCatalogCardProps) => {
  const business = catalog.business_profiles;

  // Adapter to convert the joined data to the expected Catalog type
  const adaptedCatalog: Catalog = {
    ...catalog,
    // Ensure we map the joined city to geo_city if not already present
    geo_city: catalog.geo_city || business?.city,
    // Ensure images is any (JSON compatible)
    images: Array.isArray(catalog.images) ? catalog.images : [],
    // Fallbacks for required fields if missing in raw data (should match * selection though)
    id: catalog.id,
    business_id: catalog.business_id,
    catalog_type: catalog.catalog_type || 'products',
    created_at: catalog.created_at || new Date().toISOString(),
    updated_at: catalog.updated_at || new Date().toISOString(),
  };

  return (
    <CatalogCard 
      catalog={adaptedCatalog} 
      businessId={catalog.business_id}
      businessName={business?.business_name}
      showActions={false}
      onClick={onSelect}
    />
  );
};
