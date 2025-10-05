-- ============================================
-- PHASE 3: SÉCURITÉ RLS + PERFORMANCE INDEXES
-- ============================================

-- 1. RLS pour order_items
-- ============================================

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_buyer_select" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.buyer_id = auth.uid()
  )
);

CREATE POLICY "order_items_seller_select" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.seller_id = auth.uid()
  )
);

CREATE POLICY "order_items_seller_insert" ON order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.seller_id = auth.uid()
  )
);

CREATE POLICY "order_items_seller_update" ON order_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.seller_id = auth.uid()
  )
);

CREATE POLICY "order_items_seller_delete" ON order_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.seller_id = auth.uid()
  )
);

-- 2. RLS pour media (CRUD complet)
-- ============================================

CREATE POLICY "media_owner_delete" ON media
FOR DELETE USING (
  owner_id = auth.uid()
);

CREATE POLICY "media_owner_update" ON media
FOR UPDATE USING (
  owner_id = auth.uid()
);

-- 3. Index critiques pour performance
-- ============================================

-- Index pour order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

-- Index pour media
CREATE INDEX IF NOT EXISTS idx_media_owner_entity
ON media(owner_id, entity_type, entity_id);

-- Index pour business_profiles (géolocalisation)
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_active
ON business_profiles(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_business_profiles_geo
ON business_profiles(latitude, longitude) WHERE is_active = true AND latitude IS NOT NULL;

-- Index pour catalogs (recherche)
CREATE INDEX IF NOT EXISTS idx_catalogs_business_visibility
ON catalogs(business_id, visibility, is_active) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_catalogs_category
ON catalogs(category, is_active) WHERE is_public = true;

-- Index pour messages (conversations)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON messages(conversation_id, created_at DESC);

-- Index pour favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_created
ON favorites(user_id, created_at DESC);

-- Index pour participants
CREATE INDEX IF NOT EXISTS idx_participants_conversation_user
ON participants(conversation_id, user_id);

-- Index pour business_subscriptions
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_business_active
ON business_subscriptions(business_id, is_active) WHERE is_active = true;

-- Index pour conversation_members
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_active
ON conversation_members(user_id, is_active) WHERE is_active = true;
