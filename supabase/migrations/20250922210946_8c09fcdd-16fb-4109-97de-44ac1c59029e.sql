-- Créer les politiques RLS pour les nouvelles tables de messagerie

-- Politiques pour la table conversations
CREATE POLICY "Users can view their conversations as customers"
ON conversations FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Business owners can view their conversations"
ON conversations FOR SELECT
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Customers can create conversations"
ON conversations FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Business owners can update their conversations"
ON conversations FOR UPDATE
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

-- Politiques pour la table messages
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE customer_id = auth.uid() 
    OR business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT id FROM conversations 
    WHERE customer_id = auth.uid() 
    OR business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid());

-- Politiques pour la table quotes
CREATE POLICY "Customers can view their quotes"
ON quotes FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Business owners can view their quotes"
ON quotes FOR SELECT
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Business owners can create quotes"
ON quotes FOR INSERT
WITH CHECK (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Business owners can update their quotes"
ON quotes FOR UPDATE
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Customers can update quote status"
ON quotes FOR UPDATE
USING (customer_id = auth.uid() AND status IN ('accepted', 'rejected'));

-- Politiques pour la table reservations
CREATE POLICY "Customers can view their reservations"
ON reservations FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Business owners can view their reservations"
ON reservations FOR SELECT
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Customers can create reservations"
ON reservations FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Business owners can update their reservations"
ON reservations FOR UPDATE
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Customers can cancel their reservations"
ON reservations FOR UPDATE
USING (customer_id = auth.uid() AND status IN ('pending', 'confirmed'));

-- Politiques pour la table support_tickets
CREATE POLICY "Customers can view their support tickets"
ON support_tickets FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Business owners can view their support tickets"
ON support_tickets FOR SELECT
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Customers can create support tickets"
ON support_tickets FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Business owners can update their support tickets"
ON support_tickets FOR UPDATE
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

-- Politiques pour la table message_templates
CREATE POLICY "Business owners can manage their message templates"
ON message_templates FOR ALL
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

-- Politiques pour la table automation_workflows
CREATE POLICY "Business owners can manage their automation workflows"
ON automation_workflows FOR ALL
USING (business_id IN (
  SELECT id FROM business_profiles WHERE user_id = auth.uid()
));

-- Activer la réplication en temps réel pour les tables importantes
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;