-- Create reservations/bookings system tables

-- Table for booking/reservation configurations per catalog
CREATE TABLE public.catalog_booking_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id UUID NOT NULL,
  business_id UUID NOT NULL,
  booking_enabled BOOLEAN NOT NULL DEFAULT false,
  booking_type TEXT NOT NULL DEFAULT 'appointment', -- 'appointment', 'reservation', 'order', 'rental'
  require_approval BOOLEAN NOT NULL DEFAULT true,
  allow_online_payment BOOLEAN NOT NULL DEFAULT false,
  advance_booking_days INTEGER DEFAULT 30,
  booking_slots_duration INTEGER DEFAULT 60, -- minutes
  available_days TEXT[] DEFAULT '{"monday","tuesday","wednesday","thursday","friday"}',
  booking_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}',
  max_bookings_per_slot INTEGER DEFAULT 1,
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount NUMERIC DEFAULT 0,
  cancellation_policy TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for actual bookings/reservations
CREATE TABLE public.catalog_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id UUID NOT NULL,
  business_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  booking_number TEXT NOT NULL,
  booking_type TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  end_time TIME,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  total_amount NUMERIC DEFAULT 0,
  deposit_paid NUMERIC DEFAULT 0,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  special_requests TEXT,
  notes TEXT,
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'partial', 'paid', 'refunded'
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for booking time slots (for services with specific time slots)
CREATE TABLE public.booking_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id UUID NOT NULL,
  business_id UUID NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catalog_booking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_time_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for catalog_booking_config
CREATE POLICY "Business owners can manage their booking configs"
ON public.catalog_booking_config
FOR ALL
USING (business_id IN (
  SELECT bp.id FROM business_profiles bp WHERE bp.user_id = auth.uid()
));

CREATE POLICY "Anyone can view booking configs for public catalogs"
ON public.catalog_booking_config
FOR SELECT
USING (catalog_id IN (
  SELECT c.id FROM catalogs c WHERE c.is_public = true AND c.is_active = true
));

-- RLS Policies for catalog_bookings
CREATE POLICY "Business owners can manage bookings for their business"
ON public.catalog_bookings
FOR ALL
USING (business_id IN (
  SELECT bp.id FROM business_profiles bp WHERE bp.user_id = auth.uid()
));

CREATE POLICY "Customers can view their own bookings"
ON public.catalog_bookings
FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Customers can create bookings"
ON public.catalog_bookings
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can cancel their own bookings"
ON public.catalog_bookings
FOR UPDATE
USING (customer_id = auth.uid() AND status IN ('pending', 'confirmed'));

-- RLS Policies for booking_time_slots
CREATE POLICY "Business owners can manage their time slots"
ON public.booking_time_slots
FOR ALL
USING (business_id IN (
  SELECT bp.id FROM business_profiles bp WHERE bp.user_id = auth.uid()
));

CREATE POLICY "Anyone can view available time slots"
ON public.booking_time_slots
FOR SELECT
USING (is_available = true);

-- Triggers for updated_at
CREATE TRIGGER update_catalog_booking_config_updated_at
BEFORE UPDATE ON public.catalog_booking_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_catalog_bookings_updated_at
BEFORE UPDATE ON public.catalog_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_time_slots_updated_at
BEFORE UPDATE ON public.booking_time_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate booking numbers
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'BKG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;