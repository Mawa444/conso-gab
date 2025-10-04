-- ============================================
-- SYSTÈME DE RÔLES SÉCURISÉ
-- ============================================

-- 1. Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'business_owner', 'user');

-- 2. Créer la table user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- 3. Index pour performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- 4. Activer RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Fonction SECURITY DEFINER pour vérifier les rôles (évite récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Fonction pour vérifier si un utilisateur a AU MOINS UN des rôles spécifiés
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- 7. Politique RLS : les utilisateurs peuvent voir leurs propres rôles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 8. Politique RLS : seuls les admins peuvent attribuer des rôles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Attribuer automatiquement le rôle 'user' à tous les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 10. Trigger pour attribution automatique du rôle 'user'
CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();

-- 11. Fonction pour attribuer le rôle 'business_owner' automatiquement
CREATE OR REPLACE FUNCTION public.grant_business_owner_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Attribuer le rôle business_owner au créateur du business
  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (NEW.user_id, 'business_owner', NEW.user_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 12. Trigger sur business_profiles pour attribuer business_owner
CREATE TRIGGER on_business_created_grant_owner_role
AFTER INSERT ON public.business_profiles
FOR EACH ROW
EXECUTE FUNCTION public.grant_business_owner_role();

COMMENT ON TABLE public.user_roles IS 'Table sécurisée pour la gestion des rôles utilisateurs. Utiliser has_role() dans les RLS policies.';
COMMENT ON FUNCTION public.has_role IS 'Fonction SECURITY DEFINER pour vérifier les rôles sans récursion RLS';
COMMENT ON FUNCTION public.has_any_role IS 'Vérifie si un utilisateur possède au moins un des rôles spécifiés';