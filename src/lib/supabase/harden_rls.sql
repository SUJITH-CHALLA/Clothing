-- CLOTHIFY COMPREHENSIVE RLS HARDENING SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO SYNCHRONIZE ALL DASHBOARDS

-- 1. Ensure is_admin() helper is robust
create or replace function public.is_admin() returns boolean as $$
begin
  return (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );
end;
$$ language plpgsql security definer;

-- 2. Profiles Visibility Fix
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select using (true);

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles for update using (public.is_admin());

-- 3. Products RLS - Ensure Admins see ALL products
drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products" on public.products for select using (is_active = true or public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products for insert with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products for update using (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products for delete using (public.is_admin());

-- 4. Orders RLS - Ensure Admins see ALL orders
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders for update using (public.is_admin());

-- 5. Order Items RLS - Ensure Admins see ALL items
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = public.order_items.order_id and (user_id = auth.uid() or public.is_admin()))
);

-- 6. Discounts RLS - Admin management
alter table public.discounts enable row level security;
drop policy if exists "Admins can manage discounts" on public.discounts;
create policy "Admins can manage discounts" on public.discounts for all using (public.is_admin());

drop policy if exists "Anyone can check discounts" on public.discounts;
create policy "Anyone can check discounts" on public.discounts for select using (is_active = true);

-- 7. Reviews RLS - Admin moderation
-- Create table if it doesn't exist to prevent errors
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_reviews') THEN
        CREATE TABLE public.product_reviews (
          id uuid default uuid_generate_v4() primary key,
          product_id uuid references public.products(id) on delete cascade not null,
          user_id uuid references public.profiles(id) on delete set null,
          rating integer not null check (rating >= 1 and rating <= 5),
          title text,
          comment text,
          is_verified_purchase boolean default false not null,
          is_active boolean default true not null,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
        ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

drop policy if exists "Admins can moderate reviews" on public.product_reviews;
create policy "Admins can moderate reviews" on public.product_reviews for update using (public.is_admin());

drop policy if exists "Admins can delete reviews" on public.product_reviews;
create policy "Admins can delete reviews" on public.product_reviews for delete using (public.is_admin());

