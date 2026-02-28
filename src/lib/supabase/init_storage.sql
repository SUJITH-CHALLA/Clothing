-- CLOTHIFY STORAGE INITIALIZATION SCRIPT (V3)
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create the 'products' bucket manually via SQL insert
-- This is more reliable than the function wrap in some environments
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Public Access (Anyone can view product images)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- 3. Policy: Admin Upload (Only admins can upload images)
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'products' AND 
    (SELECT public.is_admin())
);

-- 4. Policy: Admin Delete (Only admins can remove images)
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'products' AND 
    (SELECT public.is_admin())
);


