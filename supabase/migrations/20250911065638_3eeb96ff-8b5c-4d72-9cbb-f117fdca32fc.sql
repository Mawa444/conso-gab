-- Ajouter des colonnes pour les prix dans les catalogues
ALTER TABLE public.catalogs 
ADD COLUMN base_price numeric DEFAULT NULL,
ADD COLUMN price_type text DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'from', 'variable')),
ADD COLUMN price_currency text DEFAULT 'FCFA',
ADD COLUMN price_details jsonb DEFAULT '[]'::jsonb;

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN public.catalogs.base_price IS 'Prix de base du catalogue (optionnel)';
COMMENT ON COLUMN public.catalogs.price_type IS 'Type de prix: fixed (prix unique), from (à partir de), variable (prix par produit)';
COMMENT ON COLUMN public.catalogs.price_currency IS 'Devise utilisée pour les prix';
COMMENT ON COLUMN public.catalogs.price_details IS 'Détails des prix individuels pour chaque produit/service sous format JSON';