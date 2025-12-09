-- Création du bucket 'catalogs' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalogs', 'catalogs', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Note: On ne touche pas à 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;' 
-- car cela provoque une erreur 42501 et c'est déjà activé par défaut sur Supabase.

-- Policies (On supprime d'abord pour éviter les erreurs de duplication si on relance le script)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Policy: Lecture publique
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'catalogs' );

-- Policy: Insertion pour les utilisateurs authentifiés
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'catalogs' AND auth.role() = 'authenticated' );

-- Policy: Mise à jour (pour l'instant ouvert aux authentifiés pour simplifier, idéalement vérifier l'owner)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'catalogs' AND auth.role() = 'authenticated' );

-- Policy: Suppression
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'catalogs' AND auth.role() = 'authenticated' );
