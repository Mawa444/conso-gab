-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing messaging tables to start fresh
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS message_actions CASCADE;
DROP TABLE IF EXISTS participants CASCADE; 
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS catalog CASCADE;
DROP TABLE IF EXISTS product CASCADE;

-- Update profiles table to match new spec
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pin_hash text,
ADD COLUMN IF NOT EXISTS pin_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS home_location jsonb;

-- Update business_profiles to match new spec  
ALTER TABLE business_profiles
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS office_location jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'unverified';

-- Add unique constraint separately to avoid conflicts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_profiles_slug_key') THEN
        ALTER TABLE business_profiles ADD CONSTRAINT business_profiles_slug_key UNIQUE (slug);
    END IF;
END $$;

-- Catalogues
CREATE TABLE catalog (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id uuid REFERENCES business_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'published', -- published|draft|archived
  seo_metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX ON catalog(business_id);

-- Products
CREATE TABLE product (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  catalog_id uuid REFERENCES catalog(id) ON DELETE CASCADE,
  business_id uuid REFERENCES business_profiles(id),
  title text NOT NULL,
  description text,
  price_cents bigint,
  currency char(3) DEFAULT 'XAF',
  stock int DEFAULT 0,
  metadata jsonb, -- état, couleur, taille, expiry, signes distinctifs, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX ON product(business_id);
CREATE INDEX ON product(catalog_id);

-- Media (images for catalog/product)
CREATE TABLE media (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users(id),
  entity_type text NOT NULL CHECK(entity_type IN ('catalog','product','business')),
  entity_id uuid NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  width int,
  height int,
  size_bytes int,
  format text,
  is_cover boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON media(entity_type, entity_id);

-- Conversations / Messaging
CREATE TABLE conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  origin_type text, -- catalog|product|order|reservation|support|direct
  origin_id uuid,
  title text,
  last_activity timestamptz DEFAULT now(),
  visibility text DEFAULT 'private',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE participants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  role text, -- consumer|business_owner|staff|delivery|support
  last_read timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id),
  message_type text DEFAULT 'text', -- text|system|action|attachment|location|qr
  content text,
  content_json jsonb,
  attachment_url text,
  status text DEFAULT 'sent', -- sent|delivered|read
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON messages(conversation_id, created_at);

-- Actions table (structured actions tied to messages)
CREATE TABLE message_actions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  action_type text, -- order|reservation|payment|location_request|stock_update|appointment
  payload jsonb,
  status text,
  created_at timestamptz DEFAULT now()
);

-- Orders & Payments simplified
CREATE TABLE orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id uuid REFERENCES auth.users(id),
  seller_id uuid REFERENCES business_profiles(id),
  items jsonb NOT NULL, -- [{product_id, qty, price_cents, metadata}]
  total_cents bigint,
  currency char(3) DEFAULT 'XAF',
  status text DEFAULT 'pending', -- pending|paid|cancelled|delivered|refunded
  escrow_id text, -- ref to escrow ledger
  created_at timestamptz DEFAULT now()
);

CREATE TABLE payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES orders(id),
  amount_cents bigint,
  method text,
  status text DEFAULT 'locked', -- locked|released|refunded
  receipt_qr text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- conversations: select if participant
CREATE POLICY "convo_select_if_participant" ON conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM participants p WHERE p.conversation_id = conversations.id AND p.user_id = auth.uid())
);

CREATE POLICY "convo_insert_authenticated" ON conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- participants: owner control  
CREATE POLICY "participants_insert_owner" ON participants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "participants_select" ON participants FOR SELECT USING (
  user_id = auth.uid()
);

-- messages: select only if participant
CREATE POLICY "messages_select_participant" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM participants p WHERE p.conversation_id = messages.conversation_id AND p.user_id = auth.uid())
);

CREATE POLICY "messages_insert_author" ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- media: select if owner OR attached to published catalog
CREATE POLICY "media_select_owner_or_public_catalog" ON media FOR SELECT USING (
  owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM catalog c WHERE c.id = media.entity_id AND c.status = 'published'
  )
);

CREATE POLICY "media_insert_owner" ON media FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- catalog policies
CREATE POLICY "catalog_select_published" ON catalog FOR SELECT USING (
  status = 'published' OR 
  business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "catalog_insert_owner" ON catalog FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- product policies  
CREATE POLICY "product_select_published" ON product FOR SELECT USING (
  catalog_id IN (SELECT id FROM catalog WHERE status = 'published') OR
  business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "product_insert_owner" ON product FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- orders policies
CREATE POLICY "orders_select_participant" ON orders FOR SELECT USING (
  buyer_id = auth.uid() OR 
  seller_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "orders_insert_buyer" ON orders FOR INSERT
WITH CHECK (buyer_id = auth.uid());

-- payments policies  
CREATE POLICY "payments_select_order_participant" ON payments FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE 
    buyer_id = auth.uid() OR 
    seller_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
  )
);