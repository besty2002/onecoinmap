-- ワンコインマップ Database Schema

-- 1. Create Profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Places table
CREATE TABLE public.places (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  price_label text NOT NULL, -- e.g. "500円", "1000円"
  price_value integer,
  category text NOT NULL, -- e.g. "lunch", "cafe"
  address text,
  prefecture text,
  city text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  author_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Place Images table
CREATE TABLE public.place_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id uuid REFERENCES public.places(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Tags & Place_Tags
CREATE TABLE public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text UNIQUE
);

CREATE TABLE public.place_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id uuid REFERENCES public.places(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(place_id, tag_id)
);

-- 5. Create Saves table (User's saved places)
CREATE TABLE public.saves (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  place_id uuid REFERENCES public.places(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, place_id)
);

-------------------------------------------------------
-- RLS (Row Level Security) Policies (Basic Setup)
-------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, users update their own
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Places: Anyone can read active, Authenticated can create
CREATE POLICY "Places are viewable by everyone." ON public.places FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create places." ON public.places FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can edit own places." ON public.places FOR UPDATE USING (auth.uid() = author_id);

-- Saves: Users can only see and manage their own saves
CREATE POLICY "Users can view own saves." ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saves." ON public.saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saves." ON public.saves FOR DELETE USING (auth.uid() = user_id);

-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
