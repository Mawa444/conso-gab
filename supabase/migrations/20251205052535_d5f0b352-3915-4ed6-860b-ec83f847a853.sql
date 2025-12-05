-- =============================================
-- MIGRATION RLS - Activation et politiques pour toutes les tables
-- =============================================

-- Enable RLS on all tables that don't have it
ALTER TABLE action_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_booking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_image_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_image_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_share_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_image_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLITIQUES RLS PAR TABLE
-- =============================================

-- action_tracking
CREATE POLICY "Users can view their own actions" ON action_tracking FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own actions" ON action_tracking FOR INSERT WITH CHECK (user_id = auth.uid());

-- attachments
CREATE POLICY "Users can view attachments in their conversations" ON attachments FOR SELECT 
USING (message_id IN (SELECT id FROM messages WHERE conversation_id IN (SELECT conversation_id FROM participants WHERE user_id = auth.uid())));
CREATE POLICY "Users can insert attachments" ON attachments FOR INSERT WITH CHECK (true);

-- automation_workflows
CREATE POLICY "Business owners can manage workflows" ON automation_workflows FOR ALL 
USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid()));

-- blocked_users
CREATE POLICY "Users can manage their blocked list" ON blocked_users FOR ALL USING (blocker_id = auth.uid());

-- booking_time_slots
CREATE POLICY "Public can view time slots" ON booking_time_slots FOR SELECT USING (true);
CREATE POLICY "Business owners can manage time slots" ON booking_time_slots FOR ALL 
USING (catalog_id IN (SELECT id FROM catalog WHERE business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid())));

-- business_collaborators
CREATE POLICY "Users can view their collaborations" ON business_collaborators FOR SELECT 
USING (user_id = auth.uid() OR business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid()));
CREATE POLICY "Business owners can manage collaborators" ON business_collaborators FOR ALL 
USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid()));

-- catalog (legacy table)
CREATE POLICY "Public can view catalog" ON catalog FOR SELECT USING (true);
CREATE POLICY "Business owners can manage catalog" ON catalog FOR ALL 
USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid()));

-- catalog_booking_config
CREATE POLICY "Public can view booking config" ON catalog_booking_config FOR SELECT USING (true);
CREATE POLICY "Business owners can manage booking config" ON catalog_booking_config FOR ALL 
USING (catalog_id IN (SELECT id FROM catalog WHERE business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid())));

-- catalog_bookings
CREATE POLICY "Users can view their bookings" ON catalog_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON catalog_bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their bookings" ON catalog_bookings FOR UPDATE USING (user_id = auth.uid());

-- catalog_comments
CREATE POLICY "Public can view comments" ON catalog_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON catalog_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their comments" ON catalog_comments FOR DELETE USING (user_id = auth.uid());

-- catalog_image_comments
CREATE POLICY "Public can view image comments" ON catalog_image_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage their image comments" ON catalog_image_comments FOR ALL USING (user_id = auth.uid());

-- catalog_image_likes
CREATE POLICY "Public can view image likes" ON catalog_image_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their image likes" ON catalog_image_likes FOR ALL USING (user_id = auth.uid());

-- catalog_likes
CREATE POLICY "Public can view likes" ON catalog_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their likes" ON catalog_likes FOR ALL USING (user_id = auth.uid());

-- favorites
CREATE POLICY "Users can manage their favorites" ON favorites FOR ALL USING (user_id = auth.uid());

-- location_requests
CREATE POLICY "Users can view their location requests" ON location_requests FOR SELECT 
USING (user_id = auth.uid() OR requested_by = auth.uid());
CREATE POLICY "Users can create location requests" ON location_requests FOR INSERT WITH CHECK (requested_by = auth.uid());
CREATE POLICY "Users can update location requests" ON location_requests FOR UPDATE 
USING (user_id = auth.uid() OR requested_by = auth.uid());

-- location_share_history
CREATE POLICY "Users can view their location history" ON location_share_history FOR SELECT 
USING (user_id = auth.uid() OR shared_with = auth.uid());
CREATE POLICY "Users can insert their location history" ON location_share_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- media
CREATE POLICY "Public can view media" ON media FOR SELECT USING (true);
CREATE POLICY "Users can insert media" ON media FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their media" ON media FOR DELETE USING (user_id = auth.uid());

-- message_actions
CREATE POLICY "Users can view message actions" ON message_actions FOR SELECT 
USING (message_id IN (SELECT id FROM messages WHERE conversation_id IN (SELECT conversation_id FROM participants WHERE user_id = auth.uid())));
CREATE POLICY "Users can create message actions" ON message_actions FOR INSERT WITH CHECK (user_id = auth.uid());

-- message_templates
CREATE POLICY "Business owners can manage templates" ON message_templates FOR ALL 
USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid()));

-- order_items
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT 
USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- participants
CREATE POLICY "Users can manage their participations" ON participants FOR ALL USING (user_id = auth.uid());

-- payments
CREATE POLICY "Users can view their payments" ON payments FOR SELECT 
USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- product (legacy table)
CREATE POLICY "Public can view products" ON product FOR SELECT USING (true);
CREATE POLICY "Business owners can manage products" ON product FOR ALL 
USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid()));

-- profile_image_likes
CREATE POLICY "Public can view profile likes" ON profile_image_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their profile likes" ON profile_image_likes FOR ALL USING (user_id = auth.uid());

-- profiles
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their profile" ON profiles FOR ALL USING (user_id = auth.uid());

-- quotes
CREATE POLICY "Users can view their quotes" ON quotes FOR SELECT 
USING (user_id = auth.uid() OR business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid()));
CREATE POLICY "Users can create quotes" ON quotes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their quotes" ON quotes FOR UPDATE USING (user_id = auth.uid());

-- reservations
CREATE POLICY "Users can view their reservations" ON reservations FOR SELECT 
USING (user_id = auth.uid() OR business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid() OR owner_id = auth.uid()));
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their reservations" ON reservations FOR UPDATE USING (user_id = auth.uid());

-- review_replies
CREATE POLICY "Public can view replies" ON review_replies FOR SELECT USING (true);
CREATE POLICY "Users can manage their replies" ON review_replies FOR ALL USING (user_id = auth.uid());

-- support_tickets
CREATE POLICY "Users can view their tickets" ON support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their tickets" ON support_tickets FOR UPDATE USING (user_id = auth.uid());

-- typing_indicators
CREATE POLICY "Participants can view typing" ON typing_indicators FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their typing" ON typing_indicators FOR ALL USING (user_id = auth.uid());

-- user_sessions
CREATE POLICY "Users can manage their sessions" ON user_sessions FOR ALL USING (user_id = auth.uid());