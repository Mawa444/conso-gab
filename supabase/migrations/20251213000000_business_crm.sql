-- Migration Business CRM & Feature Toggles
-- Date: 13 Dec 2025

-- 1. Create business_customers table
CREATE TABLE IF NOT EXISTS public.business_customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'new', -- 'new', 'regular', 'vip', 'archived'
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    last_interaction_at TIMESTAMPTZ DEFAULT now(),
    total_spent NUMERIC DEFAULT 0,
    total_orders INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(business_id, customer_id)
);

-- 2. RLS Policies
ALTER TABLE public.business_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their customers" 
ON public.business_customers FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.business_profiles 
        WHERE id = business_customers.business_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Business owners can update their customers" 
ON public.business_customers FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.business_profiles 
        WHERE id = business_customers.business_id 
        AND user_id = auth.uid()
    )
);

-- 3. Trigger Function to Auto-Add Customer from Transactions
CREATE OR REPLACE FUNCTION public.update_crm_from_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    txn_business_id UUID;
    txn_customer_id UUID;
    txn_amount NUMERIC;
BEGIN
    -- Determine source table and extract values
    IF TG_TABLE_NAME = 'orders' THEN
        txn_business_id := NEW.business_id;
        txn_customer_id := NEW.buyer_id; -- Assuming buyer_id is the user column in orders
        txn_amount := COALESCE(NEW.total_amount, 0); 
    ELSIF TG_TABLE_NAME = 'catalog_bookings' THEN
        txn_business_id := NEW.business_id;
        txn_customer_id := NEW.user_id; -- Assuming user_id is the user column in catalog_bookings
        txn_amount := COALESCE(NEW.total_price, 0);
    END IF;

    -- If business_id is null (some old orders might be), skip
    IF txn_business_id IS NULL OR txn_customer_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Upsert into business_customers
    INSERT INTO public.business_customers (
        business_id, 
        customer_id, 
        last_interaction_at, 
        total_spent, 
        total_orders,
        status
    )
    VALUES (
        txn_business_id,
        txn_customer_id,
        now(),
        txn_amount,
        1,
        'new'
    )
    ON CONFLICT (business_id, customer_id) DO UPDATE SET
        last_interaction_at = now(),
        total_spent = business_customers.total_spent + EXCLUDED.total_spent,
        total_orders = business_customers.total_orders + 1,
        updated_at = now();

    RETURN NEW;
END;
$$;

-- 4. Apply Triggers
-- Check if tables exist before creating trigger to avoid errors during migration replay
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        DROP TRIGGER IF EXISTS trigger_update_crm_orders ON public.orders;
        CREATE TRIGGER trigger_update_crm_orders
        AFTER INSERT ON public.orders
        FOR EACH ROW
        EXECUTE FUNCTION public.update_crm_from_transaction();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalog_bookings') THEN
        DROP TRIGGER IF EXISTS trigger_update_crm_bookings ON public.catalog_bookings;
        CREATE TRIGGER trigger_update_crm_bookings
        AFTER INSERT ON public.catalog_bookings
        FOR EACH ROW
        EXECUTE FUNCTION public.update_crm_from_transaction();
    END IF;
END $$;


-- 5. RPC: Get Business Customers (Paginated & Search)
CREATE OR REPLACE FUNCTION public.get_business_customers(
    p_business_id UUID,
    p_search TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    customer_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    status TEXT,
    tags TEXT[],
    notes TEXT,
    total_spent NUMERIC,
    total_orders INT,
    last_interaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM public.business_profiles 
        WHERE id = p_business_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    SELECT 
        bc.id,
        bc.customer_id,
        p.full_name,
        p.avatar_url,
        p.email, -- Be careful with PII, maybe only if necessary
        bc.status,
        bc.tags,
        bc.notes,
        bc.total_spent,
        bc.total_orders,
        bc.last_interaction_at,
        bc.created_at
    FROM 
        public.business_customers bc
    JOIN 
        public.profiles p ON bc.customer_id = p.id
    WHERE 
        bc.business_id = p_business_id
        AND (p_search IS NULL OR p.full_name ILIKE '%' || p_search || '%')
        AND (p_status IS NULL OR bc.status = p_status)
    ORDER BY 
        bc.last_interaction_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


-- 6. RPC: Toggle Business Feature
CREATE OR REPLACE FUNCTION public.toggle_business_feature(
    p_business_id UUID,
    p_feature_key TEXT,
    p_is_enabled BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_settings JSONB;
BEGIN
    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM public.business_profiles 
        WHERE id = p_business_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Update settings
    UPDATE public.business_profiles
    SET settings = jsonb_set(
        COALESCE(settings, '{}'::jsonb), 
        ARRAY['features', p_feature_key], 
        to_jsonb(p_is_enabled)
    )
    WHERE id = p_business_id
    RETURNING settings INTO updated_settings;

    RETURN updated_settings;
END;
$$;
