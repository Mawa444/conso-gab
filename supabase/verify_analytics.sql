-- Script de vérification des analytics
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('business_analytics_events', 'business_analytics_summary');

-- 2. Compter les événements enregistrés
SELECT COUNT(*) as total_events 
FROM business_analytics_events;

-- 3. Voir les derniers événements (devrait montrer nos tests)
SELECT 
  event_type,
  event_category,
  business_id,
  device_type,
  created_at,
  metadata
FROM business_analytics_events 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Vérifier les événements par type
SELECT 
  event_type,
  event_category,
  COUNT(*) as count
FROM business_analytics_events 
GROUP BY event_type, event_category
ORDER BY count DESC;

-- 5. Vérifier le résumé quotidien (auto-généré par trigger)
SELECT 
  date,
  total_views,
  total_clicks,
  total_conversions,
  business_id
FROM business_analytics_summary 
ORDER BY date DESC 
LIMIT 5;
