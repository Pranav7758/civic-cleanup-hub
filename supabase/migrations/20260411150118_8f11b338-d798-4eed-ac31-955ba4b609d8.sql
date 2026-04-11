
-- ========================
-- ENUMS
-- ========================
CREATE TYPE public.app_role AS ENUM ('citizen', 'worker', 'ngo', 'scrap_dealer', 'admin');
CREATE TYPE public.waste_type AS ENUM ('dry', 'wet', 'hazardous', 'mixed');
CREATE TYPE public.report_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'rejected');
CREATE TYPE public.pickup_status AS ENUM ('pending', 'accepted', 'on_the_way', 'completed', 'cancelled');
CREATE TYPE public.donation_category AS ENUM ('clothing', 'books', 'toys', 'furniture', 'other');
CREATE TYPE public.scrap_category AS ENUM ('paper', 'plastic', 'metal', 'ewaste');
CREATE TYPE public.benefit_type AS ENUM ('light_bill', 'water_tax', 'property_tax');
CREATE TYPE public.transaction_type AS ENUM ('earned', 'spent', 'redeemed');

-- ========================
-- UPDATED_AT TRIGGER FUNCTION
-- ========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ========================
-- PROFILES
-- ========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT DEFAULT 'Delhi',
  ward TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- USER ROLES (separate table per security guidelines)
-- ========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own role on signup" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- CLEANLINESS SCORES
-- ========================
CREATE TABLE public.cleanliness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'Bronze',
  total_reports INTEGER DEFAULT 0,
  total_scrap_sold INTEGER DEFAULT 0,
  total_donations INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cleanliness_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own score" ON public.cleanliness_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all scores" ON public.cleanliness_scores FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own score" ON public.cleanliness_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update scores" ON public.cleanliness_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create cleanliness score on profile creation
CREATE OR REPLACE FUNCTION public.create_cleanliness_score()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.cleanliness_scores (user_id) VALUES (NEW.user_id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_profile_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_cleanliness_score();

-- ========================
-- TRAINING MODULES & PROGRESS
-- ========================
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'BookOpen',
  duration_minutes INTEGER DEFAULT 15,
  lesson_count INTEGER DEFAULT 3,
  sort_order INTEGER DEFAULT 0,
  requires_previous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view training modules" ON public.training_modules FOR SELECT TO authenticated USING (true);

CREATE TABLE public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.training_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.training_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.training_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ========================
-- WASTE REPORTS
-- ========================
CREATE TABLE public.waste_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  waste_type waste_type NOT NULL DEFAULT 'mixed',
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  assigned_worker_id UUID REFERENCES auth.users(id),
  completion_image_url TEXT,
  reward_points INTEGER DEFAULT 50,
  priority TEXT DEFAULT 'medium',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citizens can view own reports" ON public.waste_reports FOR SELECT TO authenticated USING (auth.uid() = citizen_id);
CREATE POLICY "Workers can view assigned or pending reports" ON public.waste_reports FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'worker') AND (status = 'pending' OR assigned_worker_id = auth.uid())
);
CREATE POLICY "Admins can view all reports" ON public.waste_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Citizens can create reports" ON public.waste_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Workers can update assigned reports" ON public.waste_reports FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'worker') AND (assigned_worker_id = auth.uid() OR status = 'pending')
);
CREATE POLICY "Admins can update all reports" ON public.waste_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_waste_reports_updated_at BEFORE UPDATE ON public.waste_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- WALLET TRANSACTIONS
-- ========================
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ========================
-- GOVERNMENT BENEFITS
-- ========================
CREATE TABLE public.government_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  benefit_type benefit_type NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  valid_from DATE,
  valid_until DATE,
  provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.government_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own benefits" ON public.government_benefits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all benefits" ON public.government_benefits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert benefits" ON public.government_benefits FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update benefits" ON public.government_benefits FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ========================
-- SCRAP PRICE LIST
-- ========================
CREATE TABLE public.scrap_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category scrap_category NOT NULL,
  item_name TEXT NOT NULL,
  price_per_kg NUMERIC(10,2) NOT NULL,
  dealer_id UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scrap_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view scrap prices" ON public.scrap_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Dealers can manage own prices" ON public.scrap_prices FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'scrap_dealer') AND (dealer_id = auth.uid() OR dealer_id IS NULL)
);
CREATE POLICY "Admins can manage all prices" ON public.scrap_prices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ========================
-- SCRAP LISTINGS
-- ========================
CREATE TABLE public.scrap_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  status pickup_status NOT NULL DEFAULT 'pending',
  dealer_id UUID REFERENCES auth.users(id),
  total_estimate NUMERIC(10,2) DEFAULT 0,
  total_weight NUMERIC(10,2) DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scrap_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citizens can view own listings" ON public.scrap_listings FOR SELECT TO authenticated USING (auth.uid() = citizen_id);
CREATE POLICY "Dealers can view available listings" ON public.scrap_listings FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'scrap_dealer') AND (status = 'pending' OR dealer_id = auth.uid())
);
CREATE POLICY "Citizens can create listings" ON public.scrap_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Dealers can update listings" ON public.scrap_listings FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'scrap_dealer') AND (dealer_id = auth.uid() OR status = 'pending')
);
CREATE POLICY "Admins can view all listings" ON public.scrap_listings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_scrap_listings_updated_at BEFORE UPDATE ON public.scrap_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.scrap_listing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.scrap_listings(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category scrap_category NOT NULL,
  weight_kg NUMERIC(10,2) NOT NULL DEFAULT 1,
  price_per_kg NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) GENERATED ALWAYS AS (weight_kg * price_per_kg) STORED
);
ALTER TABLE public.scrap_listing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Viewable with listing" ON public.scrap_listing_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.scrap_listings sl WHERE sl.id = listing_id AND (sl.citizen_id = auth.uid() OR sl.dealer_id = auth.uid() OR public.has_role(auth.uid(), 'scrap_dealer') OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Citizens can insert items" ON public.scrap_listing_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.scrap_listings sl WHERE sl.id = listing_id AND sl.citizen_id = auth.uid())
);

-- ========================
-- DONATIONS
-- ========================
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES auth.users(id),
  category donation_category NOT NULL,
  description TEXT,
  image_url TEXT,
  status pickup_status NOT NULL DEFAULT 'pending',
  proof_image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  reward_points INTEGER DEFAULT 100,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citizens can view own donations" ON public.donations FOR SELECT TO authenticated USING (auth.uid() = citizen_id);
CREATE POLICY "NGOs can view relevant donations" ON public.donations FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'ngo') AND (status = 'pending' OR ngo_id = auth.uid())
);
CREATE POLICY "Citizens can create donations" ON public.donations FOR INSERT TO authenticated WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "NGOs can update donations" ON public.donations FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'ngo') AND (ngo_id = auth.uid() OR status = 'pending')
);
CREATE POLICY "Admins can view all donations" ON public.donations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================
-- COMMUNITY EVENTS
-- ========================
CREATE TABLE public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'cleanup_drive',
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  max_participants INTEGER,
  reward_points INTEGER DEFAULT 150,
  image_url TEXT,
  organizer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON public.community_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage events" ON public.community_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all registrations" ON public.event_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ========================
-- NOTIFICATIONS
-- ========================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ========================
-- MESSAGES (Chat)
-- ========================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can mark messages as read" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- ========================
-- REDEEM ITEMS
-- ========================
CREATE TABLE public.redeem_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  image_emoji TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.redeem_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view redeem items" ON public.redeem_items FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "Admins can manage redeem items" ON public.redeem_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ========================
-- STORAGE BUCKETS
-- ========================
INSERT INTO storage.buckets (id, name, public) VALUES ('waste-images', 'waste-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('scrap-images', 'scrap-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('donation-images', 'donation-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('proof-images', 'proof-images', true);

CREATE POLICY "Public read for waste images" ON storage.objects FOR SELECT USING (bucket_id = 'waste-images');
CREATE POLICY "Auth users can upload waste images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'waste-images');
CREATE POLICY "Public read for scrap images" ON storage.objects FOR SELECT USING (bucket_id = 'scrap-images');
CREATE POLICY "Auth users can upload scrap images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'scrap-images');
CREATE POLICY "Public read for donation images" ON storage.objects FOR SELECT USING (bucket_id = 'donation-images');
CREATE POLICY "Auth users can upload donation images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'donation-images');
CREATE POLICY "Public read for avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Public read for proof images" ON storage.objects FOR SELECT USING (bucket_id = 'proof-images');
CREATE POLICY "Auth users can upload proof images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'proof-images');

-- ========================
-- SEED TRAINING MODULES
-- ========================
INSERT INTO public.training_modules (title, description, icon, duration_minutes, lesson_count, sort_order, requires_previous) VALUES
  ('Waste Segregation', 'Learn to separate dry, wet, and hazardous waste correctly at source', 'Trash2', 25, 5, 1, false),
  ('Composting Basics', 'Turn kitchen waste into nutrient-rich compost for your garden', 'Leaf', 20, 4, 2, true),
  ('Environmental Impact', 'Understand how waste affects our water, air, and soil', 'Droplets', 15, 3, 3, true),
  ('Hazardous Waste', 'Properly handle batteries, chemicals, and medical waste', 'AlertTriangle', 18, 4, 4, true),
  ('Platform Guide', 'Master all features: reporting, scrap selling, donations, and rewards', 'BookOpen', 12, 3, 5, true);

-- ========================
-- SEED DEFAULT SCRAP PRICES
-- ========================
INSERT INTO public.scrap_prices (category, item_name, price_per_kg) VALUES
  ('paper', 'Newspapers', 15),
  ('paper', 'Cardboard', 10),
  ('paper', 'Books/Magazines', 12),
  ('plastic', 'PET Bottles', 10),
  ('plastic', 'HDPE Containers', 15),
  ('plastic', 'Mixed Plastic', 8),
  ('metal', 'Iron/Steel', 25),
  ('metal', 'Aluminum Cans', 80),
  ('metal', 'Copper Wire', 450),
  ('ewaste', 'Old Laptop', 250),
  ('ewaste', 'Mobile Phone', 150),
  ('ewaste', 'Batteries', 50);

-- ========================
-- SEED REDEEM ITEMS
-- ========================
INSERT INTO public.redeem_items (title, points_cost, stock, image_emoji) VALUES
  ('Steel Dustbin Set', 500, 23, '🗑️'),
  ('Compost Kit', 350, 15, '🌱'),
  ('Eco Tote Bag', 150, 50, '👜'),
  ('₹100 Grocery Coupon', 400, 8, '🎟️'),
  ('Tree Planting Certificate', 200, 99, '🌳'),
  ('Solar Lamp', 800, 5, '💡');

-- ========================
-- INDEXES
-- ========================
CREATE INDEX idx_waste_reports_citizen ON public.waste_reports(citizen_id);
CREATE INDEX idx_waste_reports_status ON public.waste_reports(status);
CREATE INDEX idx_waste_reports_worker ON public.waste_reports(assigned_worker_id);
CREATE INDEX idx_scrap_listings_citizen ON public.scrap_listings(citizen_id);
CREATE INDEX idx_scrap_listings_dealer ON public.scrap_listings(dealer_id);
CREATE INDEX idx_donations_citizen ON public.donations(citizen_id);
CREATE INDEX idx_donations_ngo ON public.donations(ngo_id);
CREATE INDEX idx_wallet_transactions_user ON public.wallet_transactions(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);

-- ========================
-- HELPER FUNCTION: Add points and update score
-- ========================
CREATE OR REPLACE FUNCTION public.add_points(
  _user_id UUID,
  _points INTEGER,
  _action TEXT,
  _ref_id UUID DEFAULT NULL,
  _ref_type TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallet_transactions (user_id, type, action, points, reference_id, reference_type)
  VALUES (_user_id, 'earned', _action, _points, _ref_id, _ref_type);

  UPDATE public.cleanliness_scores
  SET score = score + _points,
      updated_at = now(),
      tier = CASE
        WHEN score + _points >= 800 THEN 'Platinum'
        WHEN score + _points >= 500 THEN 'Gold'
        WHEN score + _points >= 200 THEN 'Silver'
        ELSE 'Bronze'
      END
  WHERE user_id = _user_id;
END;
$$;
