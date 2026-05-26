-- Supabase SQL Schema for FitVerse AI
-- Execute the following SQL script directly in the Supabase SQL Editor.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table (extends Supabase auth.users profile)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gender TEXT,
  body_type TEXT,
  height DECIMAL,
  weight DECIMAL,
  style_preference TEXT,
  favorite_colors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Outfits Table (catalog of items managed by admin)
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('casual', 'streetwear', 'formal', 'traditional', 'gymwear', 'partywear')),
  gender TEXT NOT NULL CHECK (gender IN ('men', 'women', 'unisex')),
  color TEXT NOT NULL,
  hex TEXT NOT NULL,
  image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  fit TEXT NOT NULL CHECK (fit IN ('slim', 'oversized', 'regular', 'loose')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Try-on History Table (logged virtual fit reviews)
CREATE TABLE IF NOT EXISTS public.tryon_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_before TEXT NOT NULL,
  image_after TEXT NOT NULL,
  category TEXT NOT NULL,
  style TEXT NOT NULL,
  gender TEXT NOT NULL,
  body_type TEXT NOT NULL,
  fit TEXT NOT NULL,
  fashion_score INTEGER,
  caption TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Saved Looks Table (starred before/after styles)
CREATE TABLE IF NOT EXISTS public.saved_looks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_before TEXT NOT NULL,
  image_after TEXT NOT NULL,
  fashion_score INTEGER DEFAULT 80,
  tags TEXT[] DEFAULT '{}',
  caption TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Recommendations Table (logged custom advice)
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  skin_tone TEXT,
  gender TEXT,
  occasion TEXT NOT NULL,
  trends TEXT[] DEFAULT '{}',
  matching_colors JSONB DEFAULT '[]'::jsonb,
  avoid_colors TEXT[] DEFAULT '{}',
  suggested_styles JSONB DEFAULT '[]'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryon_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

-- Create Policies for Users profiles
CREATE POLICY "Allow users to read their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create Policies for Outfits
CREATE POLICY "Allow anyone to read outfits" ON public.outfits
  FOR SELECT USING (true);

CREATE POLICY "Allow only admins to manage outfits" ON public.outfits
  FOR ALL USING (auth.jwt() ->> 'email' IN ('admin@fitverse.ai', 'harshathatipamula16@gmail.com'));

-- Create Policies for Try-on History
CREATE POLICY "Allow users to view their own try-on history" ON public.tryon_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to record try-on history" ON public.tryon_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to clear their tryon history" ON public.tryon_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create Policies for Saved Looks
CREATE POLICY "Allow users to view their own saved looks" ON public.saved_looks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create saved looks" ON public.saved_looks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete saved looks" ON public.saved_looks
  FOR DELETE USING (auth.uid() = user_id);

-- Create Policies for Recommendations
CREATE POLICY "Allow users to view their own recommendations" ON public.recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to save recommendations" ON public.recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tryon_history_user_id ON public.tryon_history(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_looks_user_id ON public.saved_looks(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
