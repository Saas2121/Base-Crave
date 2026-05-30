-- Base SQL Schema setup for CRAVE
-- Run this in your Supabase SQL Editor.
-- It sets up tables, constraints, default UUIDs, indexes, and explicit API grants to comply with new Supabase guidelines.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. USERS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('consumer', 'store_admin')),
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. STORES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
    image_url TEXT,
    is_open BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. PACKS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    pack_type TEXT NOT NULL CHECK (pack_type IN ('fixed', 'surprise')),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0.0),
    original_price NUMERIC(12, 2) CHECK (original_price IS NULL OR original_price > 0.0),
    pickup_start TEXT NOT NULL, -- e.g., "14:00"
    pickup_end TEXT NOT NULL, -- e.g., "19:00"
    total_quantity INTEGER NOT NULL CHECK (total_quantity >= 1),
    remaining_quantity INTEGER NOT NULL CHECK (remaining_quantity >= 0 AND remaining_quantity <= total_quantity),
    image_url TEXT,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'sold_out', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 4. RESERVATIONS TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    status TEXT DEFAULT 'reserved' NOT NULL CHECK (status IN ('reserved', 'in_process', 'ready', 'picked_up', 'cancelled')),
    pickup_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 5. FAVORITES TABLE
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, store_id)
);

-- =========================================================================
-- 6. INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_packs_store_id ON public.packs(store_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_pack_id ON public.reservations(pack_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- =========================================================================
-- 7. EXPLICIT GRANTS FOR API ROLES (Supabase Data API Protection Compliance)
-- =========================================================================

-- Grant access on tables to api roles (anon, authenticated, and service_role)
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.stores TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.packs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reservations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.favorites TO anon, authenticated, service_role;

-- Grant usage on sequence generation just in case any serial type gets used
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- If RLS (Row Level Security) is enabled on any table, remember to create the policies.
-- By default, if RLS is not enabled on a table, the above grants are enough to access it.
-- If RLS is enabled, you would also need to add policies such as:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all" ON public.users FOR SELECT USING (true);
