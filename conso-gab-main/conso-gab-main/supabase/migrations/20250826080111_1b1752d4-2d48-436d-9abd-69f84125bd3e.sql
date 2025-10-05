-- Add location fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Gabon',
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,  
ADD COLUMN IF NOT EXISTS arrondissement TEXT,
ADD COLUMN IF NOT EXISTS quartier TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add location fields to business_profiles table (they already have some but let's ensure we have all we need)
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS arrondissement TEXT,
ADD COLUMN IF NOT EXISTS quartier TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);