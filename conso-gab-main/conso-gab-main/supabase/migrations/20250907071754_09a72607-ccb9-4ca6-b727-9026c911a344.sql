-- Add folder column to catalogs for organizing catalogs into folders
ALTER TABLE public.catalogs
ADD COLUMN IF NOT EXISTS folder TEXT;

-- Optional index to speed up folder filtering per business
CREATE INDEX IF NOT EXISTS idx_catalogs_business_folder ON public.catalogs (business_id, folder);
