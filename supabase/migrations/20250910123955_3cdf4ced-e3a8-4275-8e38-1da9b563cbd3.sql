-- Allow accepted collaborators to manage catalogs for their businesses
DROP POLICY IF EXISTS "Collaborators can manage business catalogs" ON public.catalogs;
CREATE POLICY "Collaborators can manage business catalogs"
ON public.catalogs
FOR ALL
USING (
  business_id IN (
    SELECT bc.business_id
    FROM public.business_collaborators bc
    WHERE bc.user_id = auth.uid() AND bc.status = 'accepted'
  )
)
WITH CHECK (
  business_id IN (
    SELECT bc.business_id
    FROM public.business_collaborators bc
    WHERE bc.user_id = auth.uid() AND bc.status = 'accepted'
  )
);
