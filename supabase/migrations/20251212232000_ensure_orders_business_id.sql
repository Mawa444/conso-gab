-- Migration de secours pour orders
-- Date: 12 Dec 2025

-- S'assurer que la table orders a bien foreign key vers business_id
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'business_id') THEN
        ALTER TABLE public.orders ADD COLUMN business_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL;
        CREATE INDEX idx_orders_business_id ON public.orders(business_id);
    END IF;
END $$;
