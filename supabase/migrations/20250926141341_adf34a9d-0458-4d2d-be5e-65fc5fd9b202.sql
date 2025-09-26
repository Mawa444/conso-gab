-- Créer la table des abonnements
CREATE TABLE public.business_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_user_id UUID NOT NULL,
  business_id UUID NOT NULL,
  notification_types JSONB NOT NULL DEFAULT '{"new_catalog": true, "new_comment": true, "new_message": true, "new_order": true, "business_update": true}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subscriber_user_id, business_id)
);

-- Enable RLS
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies pour les abonnements
CREATE POLICY "Users can create their own subscriptions" 
ON public.business_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = subscriber_user_id);

CREATE POLICY "Users can view their own subscriptions" 
ON public.business_subscriptions 
FOR SELECT 
USING (auth.uid() = subscriber_user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.business_subscriptions 
FOR UPDATE 
USING (auth.uid() = subscriber_user_id);

CREATE POLICY "Users can delete their own subscriptions" 
ON public.business_subscriptions 
FOR DELETE 
USING (auth.uid() = subscriber_user_id);

CREATE POLICY "Business owners can view their subscribers" 
ON public.business_subscriptions 
FOR SELECT 
USING (business_id IN (
  SELECT bp.id FROM business_profiles bp WHERE bp.user_id = auth.uid()
));

-- Créer la table des notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_id UUID,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS pour les notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour les notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fonction pour créer des notifications pour les abonnés
CREATE OR REPLACE FUNCTION public.notify_business_subscribers(
  business_id_param UUID,
  notification_type_param TEXT,
  title_param TEXT,
  message_param TEXT,
  data_param JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, business_id, notification_type, title, message, data)
  SELECT 
    bs.subscriber_user_id,
    business_id_param,
    notification_type_param,
    title_param,
    message_param,
    data_param
  FROM public.business_subscriptions bs
  WHERE bs.business_id = business_id_param 
    AND bs.is_active = true
    AND (bs.notification_types::jsonb ->> notification_type_param)::boolean = true;
END;
$$;

-- Trigger pour nouveau catalogue
CREATE OR REPLACE FUNCTION public.trigger_new_catalog_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  business_name TEXT;
BEGIN
  -- Récupérer le nom du business
  SELECT bp.business_name INTO business_name
  FROM business_profiles bp
  WHERE bp.id = NEW.business_id;
  
  -- Notifier les abonnés si le catalogue est public et actif
  IF NEW.is_public = true AND NEW.is_active = true THEN
    PERFORM public.notify_business_subscribers(
      NEW.business_id,
      'new_catalog',
      'Nouveau catalogue disponible',
      business_name || ' a publié un nouveau catalogue: ' || NEW.name,
      jsonb_build_object('catalog_id', NEW.id, 'catalog_name', NEW.name)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attacher le trigger à la table catalogs
CREATE TRIGGER on_catalog_published
  AFTER INSERT ON public.catalogs
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_new_catalog_notification();

-- Trigger pour nouveaux commentaires sur catalogues
CREATE OR REPLACE FUNCTION public.trigger_new_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  business_id_var UUID;
  catalog_name TEXT;
  business_name TEXT;
BEGIN
  -- Récupérer business_id et catalog_name
  SELECT c.business_id, c.name INTO business_id_var, catalog_name
  FROM catalogs c
  WHERE c.id = NEW.catalog_id;
  
  -- Récupérer le nom du business
  SELECT bp.business_name INTO business_name
  FROM business_profiles bp
  WHERE bp.id = business_id_var;
  
  -- Notifier les abonnés
  PERFORM public.notify_business_subscribers(
    business_id_var,
    'new_comment',
    'Nouveau commentaire',
    'Nouveau commentaire sur ' || catalog_name || ' de ' || business_name,
    jsonb_build_object('catalog_id', NEW.catalog_id, 'comment_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$;

-- Attacher le trigger aux commentaires
CREATE TRIGGER on_catalog_comment_created
  AFTER INSERT ON public.catalog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_new_comment_notification();

-- Trigger pour nouvelles commandes
CREATE OR REPLACE FUNCTION public.trigger_new_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  business_name TEXT;
BEGIN
  -- Récupérer le nom du business
  SELECT bp.business_name INTO business_name
  FROM business_profiles bp
  WHERE bp.id = NEW.seller_id;
  
  -- Notifier les abonnés
  PERFORM public.notify_business_subscribers(
    NEW.seller_id,
    'new_order',
    'Nouvelle commande',
    'Nouvelle commande chez ' || business_name,
    jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number)
  );
  
  RETURN NEW;
END;
$$;

-- Attacher le trigger aux commandes (si la table orders existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    CREATE TRIGGER on_order_created
      AFTER INSERT ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_new_order_notification();
  END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX idx_business_subscriptions_business_id ON public.business_subscriptions(business_id);
CREATE INDEX idx_business_subscriptions_subscriber ON public.business_subscriptions(subscriber_user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_business_subscriptions_updated_at
  BEFORE UPDATE ON public.business_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();