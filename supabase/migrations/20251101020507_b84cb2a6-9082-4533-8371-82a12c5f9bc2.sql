-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'veterinarian', 'admin', 'government_inspector');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'farmer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create livestock_listings table for marketplace
CREATE TABLE public.livestock_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  animal_id TEXT NOT NULL,
  breed TEXT NOT NULL,
  price NUMERIC NOT NULL,
  age_years INTEGER,
  age_months INTEGER,
  weight_kg NUMERIC,
  health_status TEXT DEFAULT 'Excellent',
  vaccination_status TEXT DEFAULT 'Up to date',
  location TEXT NOT NULL,
  contact_phone TEXT,
  description TEXT,
  image_url TEXT,
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.livestock_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON public.livestock_listings FOR SELECT
  USING (NOT is_sold);

CREATE POLICY "Sellers can create listings"
  ON public.livestock_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
  ON public.livestock_listings FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings"
  ON public.livestock_listings FOR DELETE
  USING (auth.uid() = seller_id);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  prescription_required BOOLEAN DEFAULT FALSE,
  description TEXT,
  manufacturer TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medicines"
  ON public.medicines FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage medicines"
  ON public.medicines FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create veterinarians table
CREATE TABLE public.veterinarians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  clinic_name TEXT,
  clinic_address TEXT,
  phone TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  consultation_fee NUMERIC,
  available BOOLEAN DEFAULT TRUE,
  experience_years INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view veterinarians"
  ON public.veterinarians FOR SELECT
  USING (TRUE);

CREATE POLICY "Vets can update their own profile"
  ON public.veterinarians FOR UPDATE
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL,
  order_type TEXT NOT NULL, -- 'livestock' or 'medicine'
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price NUMERIC NOT NULL,
  delivery_address TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Create triggers for updated_at
CREATE TRIGGER update_livestock_listings_updated_at
  BEFORE UPDATE ON public.livestock_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample medicines
INSERT INTO public.medicines (name, type, price, stock_quantity, prescription_required, description, manufacturer) VALUES
('Ivermectin Injectable', 'Antiparasitic', 450, 100, TRUE, 'Broad spectrum antiparasitic for cattle and buffalo', 'VetPharma India'),
('Calcium Borogluconate', 'Supplement', 280, 150, FALSE, 'For treatment of milk fever and calcium deficiency', 'AnimalCare Ltd'),
('Oxytetracycline LA', 'Antibiotic', 520, 80, TRUE, 'Long-acting antibiotic for respiratory infections', 'LivestockMeds Co'),
('Vitamin B-Complex', 'Supplement', 180, 200, FALSE, 'Essential vitamins for livestock health and growth', 'NutriVet');

-- Insert sample veterinarians
INSERT INTO public.veterinarians (name, specialization, clinic_name, clinic_address, phone, rating, consultation_fee, experience_years) VALUES
('Dr. Rajesh Kumar', 'Large Animal Medicine', 'Rural Veterinary Clinic', 'Village Rampur, District Meerut, UP', '+91-9876543210', 4.8, 500, 15),
('Dr. Priya Sharma', 'Dairy Cattle Specialist', 'Dairy Health Center', 'Anand Road, Gujarat', '+91-9876543211', 4.9, 600, 12),
('Dr. Amit Patel', 'Buffalo & Cattle Expert', 'Livestock Care Hospital', 'Karnal, Haryana', '+91-9876543212', 4.7, 550, 18),
('Dr. Sunita Verma', 'Small Ruminant Specialist', 'GoatCare Clinic', 'Jaipur, Rajasthan', '+91-9876543213', 4.6, 400, 10);