// ✅ COMPOSANT ACCESSIBLE ET PERFORMANT - Version Simplifiée

import React, { memo, useCallback, useMemo } from 'react';

// Types simplifiés (inline pour éviter dépendances)
interface Catalog {
  id: string;
  catalog_name: string;
  catalog_type: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  business_profiles?: {
    business_name?: string;
    logo_url?: string;
    is_verified?: boolean;
    city?: string;
  };
  view_count?: number;
  like_count?: number;
}

interface CatalogCardProps {
  catalog: Catalog;
  onView?: (catalog: Catalog) => void;
  onLike?: (catalogId: string) => void;
  onShare?: (catalog: Catalog) => void;
  onAddToCart?: (catalog: Catalog) => void;
  showBusinessInfo?: boolean;
  showLocation?: boolean;
  className?: string;
}

// ✅ COMPOSANT MEMOIZÉ AVEC DÉPENDANCES STABLES
export const CatalogCard = memo<CatalogCardProps>(({
  catalog,
  onView,
  onLike,
  onShare,
  onAddToCart,
  showBusinessInfo = true,
  showLocation = false,
  className = ''
}) => {

  // ✅ VALEURS MEMOIZÉES (calculées une seule fois)
  const businessName = useMemo(() =>
    catalog.business_profiles?.business_name || 'Business',
    [catalog.business_profiles?.business_name]
  );

  const isVerified = useMemo(() =>
    catalog.business_profiles?.is_verified || false,
    [catalog.business_profiles?.is_verified]
  );

  const catalogTypeLabel = useMemo(() =>
    catalog.catalog_type === 'products' ? 'Produits' : 'Services',
    [catalog.catalog_type]
  );

  const imageUrl = useMemo(() =>
    catalog.cover_image_url || '/placeholder-catalog.jpg',
    [catalog.cover_image_url]
  );

  const altText = useMemo(() =>
    `${catalog.catalog_name} - Catalogue ${catalogTypeLabel} par ${businessName}`,
    [catalog.catalog_name, catalogTypeLabel, businessName]
  );

  // ✅ CALLBACKS STABLES (pas de dépendances changeantes)
  const handleView = useCallback(() => {
    onView?.(catalog);
  }, [onView]); // catalog stable via memo

  const handleLike = useCallback(() => {
    onLike?.(catalog.id);
  }, [onLike, catalog.id]);

  const handleShare = useCallback(() => {
    onShare?.(catalog);
  }, [onShare]); // catalog stable via memo

  const handleAddToCart = useCallback(() => {
    onAddToCart?.(catalog);
  }, [onAddToCart]); // catalog stable via memo

  return (
    <article
      className={`group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}
      role="article"
      aria-labelledby={`catalog-${catalog.id}-title`}
    >
      {/* Image Header avec accessibilité */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={altText}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Badges avec contraste élevé */}
        <span
          className="absolute top-2 left-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white"
          aria-label={`Type: ${catalogTypeLabel}`}
        >
          {catalogTypeLabel}
        </span>

        {isVerified && (
          <span
            className="absolute top-2 right-2 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white"
            aria-label="Business vérifié"
          >
            ✓ Vérifié
          </span>
        )}
      </div>

      {/* Contenu principal */}
      <div className="p-4">
        <h3
          id={`catalog-${catalog.id}-title`}
          className="font-semibold text-lg leading-tight mb-2 line-clamp-2"
        >
          {catalog.catalog_name}
        </h3>

        {catalog.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
            {catalog.description}
          </p>
        )}

        {/* Infos business avec accessibilité */}
        {showBusinessInfo && (
          <div className="flex items-center gap-2 mb-3">
            <img
              src={catalog.business_profiles?.logo_url || '/default-avatar.png'}
              alt={`Logo de ${businessName}`}
              className="h-6 w-6 rounded-full object-cover"
              loading="lazy"
            />
            <span className="text-sm font-medium truncate">
              {businessName}
            </span>
            {isVerified && (
              <span
                className="rounded border px-1 py-0 text-xs"
                aria-label="Business certifié"
              >
                ✓
              </span>
            )}
          </div>
        )}

        {/* Localisation */}
        {showLocation && catalog.business_profiles?.city && (
          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{catalog.business_profiles.city}</span>
          </div>
        )}

        {/* Statistiques avec aria-labels */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span aria-label={`${catalog.view_count || 0} vues`}>
                {catalog.view_count || 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span aria-label={`${catalog.like_count || 0} likes`}>
                {catalog.like_count || 0}
              </span>
            </div>
          </div>

          <time
            dateTime={catalog.created_at}
            className="text-xs"
            title={new Date(catalog.created_at).toLocaleDateString('fr-FR')}
          >
            {getRelativeTime(catalog.created_at)}
          </time>
        </div>
      </div>

      {/* Actions accessibles */}
      <div className="flex gap-2 p-4 pt-0">
        <button
          onClick={handleView}
          className="flex-1 rounded border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={`Voir le catalogue ${catalog.catalog_name}`}
        >
          <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Voir
        </button>

        <button
          onClick={handleLike}
          className="rounded border p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={`Aimer le catalogue ${catalog.catalog_name}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <button
          onClick={handleShare}
          className="rounded border p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={`Partager le catalogue ${catalog.catalog_name}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>

        {onAddToCart && (
          <button
            onClick={handleAddToCart}
            className="flex-1 rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`Ajouter ${catalog.catalog_name} au panier`}
          >
            <svg className="mr-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
            </svg>
            Ajouter
          </button>
        )}
      </div>
    </article>
  );
});

CatalogCard.displayName = 'CatalogCard';

// Fonction utilitaire pour le temps relatif
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Aujourd\'hui';
  if (diffInDays === 1) return 'Hier';
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;

  return date.toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}