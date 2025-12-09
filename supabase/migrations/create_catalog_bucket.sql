-- Create the storage bucket for catalog images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-images', 'catalog-images', true)
ON CONFLICT (id) DO NOTHING;

-- COMMENTED OUT: ENABLE RLS is usually reserved for superusers or owners. 
-- storage.objects usually has RLS enabled by default in Supabase.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view catalog images (public)
-- We use DO blocks to avoid errors if policies already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access Catalog Images'
    ) THEN
        CREATE POLICY "Public Access Catalog Images"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'catalog-images' );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload catalog images'
    ) THEN
        CREATE POLICY "Authenticated users can upload catalog images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = 'catalog-images' );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can update catalog images'
    ) THEN
        CREATE POLICY "Authenticated users can update catalog images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING ( bucket_id = 'catalog-images' );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can delete catalog images'
    ) THEN
        CREATE POLICY "Authenticated users can delete catalog images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING ( bucket_id = 'catalog-images' );
    END IF;
END
$$;
