-- Wishlist Table Schema & RLS Fix

DO $$ 
BEGIN
    -- 1. Create table if not exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wishlist') THEN
        CREATE TABLE public.wishlist (
          id uuid default uuid_generate_v4() primary key,
          user_id uuid references auth.users(id) on delete cascade not null,
          product_id uuid references public.products(id) on delete cascade not null,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          unique(user_id, product_id)
        );
    END IF;
END $$;

-- 2. Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can insert into own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can delete from own wishlist" ON public.wishlist;

-- 3. Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 4. Recreate Policies
CREATE POLICY "Users can view own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into own wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from own wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- 5. Give authenticated users access to the sequence/table
GRANT ALL ON TABLE public.wishlist TO authenticated;
GRANT ALL ON TABLE public.wishlist TO service_role;
