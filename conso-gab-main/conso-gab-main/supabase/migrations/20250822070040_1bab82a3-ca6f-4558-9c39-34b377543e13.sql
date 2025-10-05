-- Create user types enum
CREATE TYPE public.user_type AS ENUM ('explorateur', 'createur', 'consommateur');

-- Create provinces table
CREATE TABLE public.provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create departments table  
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id UUID REFERENCES public.provinces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create arrondissements table
CREATE TABLE public.arrondissements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quartiers table
CREATE TABLE public.quartiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arrondissement_id UUID REFERENCES public.arrondissements(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type public.user_type NOT NULL DEFAULT 'explorateur',
    full_name VARCHAR(150),
    phone VARCHAR(20),
    avatar_url TEXT,
    quartier_id UUID REFERENCES public.quartiers(id),
    points INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    patriote_eco_pledge BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create business profiles table
CREATE TABLE public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    logo_url TEXT,
    quartier_id UUID REFERENCES public.quartiers(id),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    main_services TEXT[] DEFAULT '{}',
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arrondissements ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.quartiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for geographic tables (public read)
CREATE POLICY "Geographic data is publicly readable" ON public.provinces FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Geographic data is publicly readable" ON public.departments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Geographic data is publicly readable" ON public.arrondissements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Geographic data is publicly readable" ON public.quartiers FOR SELECT TO anon, authenticated USING (true);

-- Create policies for user profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create their own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create policies for business profiles  
CREATE POLICY "Business profiles are publicly viewable" ON public.business_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create their own business profile" ON public.business_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business profile" ON public.business_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Insert sample geographic data for Gabon
INSERT INTO public.provinces (name, code) VALUES
('Estuaire', 'EST'),
('Haut-Ogooué', 'HO'),
('Moyen-Ogooué', 'MO'), 
('Ngounié', 'NG'),
('Nyanga', 'NY'),
('Ogooué-Ivindo', 'OI'),
('Ogooué-Lolo', 'OL'),
('Ogooué-Maritime', 'OM'),
('Woleu-Ntem', 'WN');

-- Insert departments for Estuaire province
INSERT INTO public.departments (province_id, name, code) 
SELECT p.id, 'Libreville', 'LBV' FROM public.provinces p WHERE p.code = 'EST'
UNION ALL
SELECT p.id, 'Komo-Mondah', 'KM' FROM public.provinces p WHERE p.code = 'EST'
UNION ALL  
SELECT p.id, 'Noya', 'NY' FROM public.provinces p WHERE p.code = 'EST';

-- Insert arrondissements for Libreville
INSERT INTO public.arrondissements (department_id, name, code)
SELECT d.id, '1er Arrondissement', '1ER' FROM public.departments d WHERE d.code = 'LBV'
UNION ALL
SELECT d.id, '2ème Arrondissement', '2EM' FROM public.departments d WHERE d.code = 'LBV'  
UNION ALL
SELECT d.id, '3ème Arrondissement', '3EM' FROM public.departments d WHERE d.code = 'LBV'
UNION ALL
SELECT d.id, '4ème Arrondissement', '4EM' FROM public.departments d WHERE d.code = 'LBV'
UNION ALL
SELECT d.id, '5ème Arrondissement', '5EM' FROM public.departments d WHERE d.code = 'LBV'
UNION ALL
SELECT d.id, '6ème Arrondissement', '6EM' FROM public.departments d WHERE d.code = 'LBV';

-- Insert quartiers for different arrondissements
INSERT INTO public.quartiers (arrondissement_id, name)
SELECT a.id, 'Glass' FROM public.arrondissements a WHERE a.code = '1ER'
UNION ALL
SELECT a.id, 'Louis' FROM public.arrondissements a WHERE a.code = '1ER'
UNION ALL
SELECT a.id, 'Cocotiers' FROM public.arrondissements a WHERE a.code = '2EM'
UNION ALL  
SELECT a.id, 'Chantiers' FROM public.arrondissements a WHERE a.code = '2EM'
UNION ALL
SELECT a.id, 'Mont-Bouët' FROM public.arrondissements a WHERE a.code = '3EM'
UNION ALL
SELECT a.id, 'Nombakélé' FROM public.arrondissements a WHERE a.code = '4EM'
UNION ALL
SELECT a.id, 'Akébé' FROM public.arrondissements a WHERE a.code = '4EM'
UNION ALL
SELECT a.id, 'Nzeng-Ayong' FROM public.arrondissements a WHERE a.code = '5EM'
UNION ALL
SELECT a.id, 'PK5' FROM public.arrondissements a WHERE a.code = '5EM'
UNION ALL
SELECT a.id, 'PK8' FROM public.arrondissements a WHERE a.code = '5EM'
UNION ALL
SELECT a.id, 'Soweto' FROM public.arrondissements a WHERE a.code = '6EM'
UNION ALL
SELECT a.id, 'Oloumi' FROM public.arrondissements a WHERE a.code = '6EM';

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full name, points)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 10);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();