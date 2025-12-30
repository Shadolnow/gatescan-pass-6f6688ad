-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'organizer', 'staff', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    account_type TEXT NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual', 'organizer')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create events table
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    venue TEXT NOT NULL,
    address TEXT,
    city TEXT,
    image_url TEXT,
    is_free BOOLEAN NOT NULL DEFAULT true,
    base_price NUMERIC(10,2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    capacity INTEGER,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket_tiers table
CREATE TABLE public.ticket_tiers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    capacity INTEGER,
    tickets_sold INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(event_id, code)
);

-- Update tickets table with new fields
ALTER TABLE public.tickets 
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
ADD COLUMN tier_id UUID REFERENCES public.ticket_tiers(id) ON DELETE SET NULL,
ADD COLUMN attendee_name TEXT,
ADD COLUMN attendee_email TEXT,
ADD COLUMN attendee_phone TEXT,
ADD COLUMN buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN qr_code_url TEXT;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user profile id
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins can manage, use security definer)
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Events policies
CREATE POLICY "Anyone can view published events" ON public.events
FOR SELECT USING (status = 'published' OR organizer_id = public.get_profile_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Organizers can create events" ON public.events
FOR INSERT WITH CHECK (organizer_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Organizers can update own events" ON public.events
FOR UPDATE USING (organizer_id = public.get_profile_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Organizers can delete own events" ON public.events
FOR DELETE USING (organizer_id = public.get_profile_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- Ticket tiers policies
CREATE POLICY "Anyone can view active tiers" ON public.ticket_tiers
FOR SELECT USING (true);

CREATE POLICY "Event owners can manage tiers" ON public.ticket_tiers
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
);

CREATE POLICY "Event owners can update tiers" ON public.ticket_tiers
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
);

CREATE POLICY "Event owners can delete tiers" ON public.ticket_tiers
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
);

-- Promo codes policies
CREATE POLICY "Event owners can view promo codes" ON public.promo_codes
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Event owners can manage promo codes" ON public.promo_codes
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
);

CREATE POLICY "Event owners can update promo codes" ON public.promo_codes
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
);

CREATE POLICY "Event owners can delete promo codes" ON public.promo_codes
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
);

-- Update tickets policies for new functionality
CREATE POLICY "Users can view own tickets" ON public.tickets
FOR SELECT USING (
  buyer_id = public.get_profile_id(auth.uid()) 
  OR EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
  OR public.has_role(auth.uid(), 'staff')
  OR public.has_role(auth.uid(), 'admin')
  OR buyer_id IS NULL -- legacy tickets
);

CREATE POLICY "Users can purchase tickets" ON public.tickets
FOR INSERT WITH CHECK (true);

CREATE POLICY "Event owners and staff can update tickets" ON public.tickets
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = public.get_profile_id(auth.uid()))
  OR public.has_role(auth.uid(), 'staff')
  OR public.has_role(auth.uid(), 'admin')
);

-- Create trigger for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_tiers_updated_at
  BEFORE UPDATE ON public.ticket_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_ticket_tiers_event ON public.ticket_tiers(event_id);
CREATE INDEX idx_tickets_event ON public.tickets(event_id);
CREATE INDEX idx_tickets_buyer ON public.tickets(buyer_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);