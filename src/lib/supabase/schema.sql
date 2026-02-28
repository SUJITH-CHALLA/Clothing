-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 
-- 1. Profiles Table (Extends Supabase Auth Auth.Users)
--
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  role text default 'user'::text check (role in ('user', 'admin')),
  loyalty_points integer default 0,
  credit_balance integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 
-- 2. Products Table
--
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price integer not null, -- stored in cents/paise
  sale_price integer,
  images text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  category text not null,          -- e.g., "Men", "Women"
  subcategory text,                -- e.g., "T-Shirts", "Hoodies"
  collection text,                 -- e.g., "Summer 2026", "Essentials"
  fabric text,                     -- e.g., "100% Cotton", "Fleece"
  tags text[] default '{}',        -- for semantic search and filtering
  stock_count integer default 0 not null,
  is_limited_drop boolean default false not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 
-- 3. Discounts Table
--
create table public.discounts (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  type text not null check (type in ('percentage', 'fixed')),
  value integer not null,
  min_order_amount integer default 0,
  max_uses integer,
  used_count integer default 0 not null,
  expires_at timestamp with time zone,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Discounts RLS
alter table public.discounts enable row level security;
create policy "Admins can manage discounts" on public.discounts for all using (is_admin());
create policy "Anyone can check active discounts" on public.discounts for select using (is_active = true);

-- 
-- 4. Orders Table
--
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  status text default 'pending'::text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount integer not null,
  discount_applied integer default 0,
  shipping_address jsonb not null,
  contact_info jsonb not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 
-- 5. Order Items Table
--
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  price_at_purchase integer not null
);

-- Default RLS Policies (Row Level Security)

-- Helper function to check if user is admin
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

-- Profiles: Users can read and update their own profile. Admins can read all.
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Admins can view and update all profiles
-- Note: User requested USING(true) for visibility fixes
create policy "Admins can view all profiles" on public.profiles for select using (true);
create policy "Admins can update all profiles" on public.profiles for update using (is_admin());

-- Products: Anyone can read active products. Admins can manage all.
alter table public.products enable row level security;
create policy "Anyone can read active products" on public.products for select using (is_active = true or is_admin());

-- Admin Management for Products
create policy "Admins can insert products" on public.products for insert with check (is_admin());
create policy "Admins can update products" on public.products for update using (is_admin());
create policy "Admins can delete products" on public.products for delete using (is_admin());

-- Orders: Users can read their own orders. Admins can manage all.
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id or is_admin());
create policy "Admins can update orders" on public.orders for update using (is_admin());

-- Order Items: Users can read items of their own orders.
alter table public.order_items enable row level security;
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = public.order_items.order_id and (user_id = auth.uid() or is_admin()))
);

-- Trigger to create profile on sign up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 
-- 6. User Addresses Table
--
create table public.user_addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  is_default boolean default false not null,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  pincode text not null,
  country text default 'India'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Addresses: Users can manage their own addresses. 
alter table public.user_addresses enable row level security;
create policy "Users can view own addresses" on public.user_addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on public.user_addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on public.user_addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on public.user_addresses for delete using (auth.uid() = user_id);

-- 
-- 7. Product Reviews Table
--
create table public.product_reviews (
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

-- Reviews: Anyone can read active reviews. Users can insert their own.
alter table public.product_reviews enable row level security;
create policy "Anyone can read active reviews" on public.product_reviews for select using (is_active = true);
create policy "Authenticated users can insert reviews" on public.product_reviews for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own reviews" on public.product_reviews for delete using (auth.uid() = user_id);
create policy "Admins can moderate reviews" on public.product_reviews for update using (is_admin());
create policy "Admins can delete all reviews" on public.product_reviews for delete using (is_admin());

-- 
-- 8. Wishlist Table
--
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- Wishlist: Users can manage their own wishlist.
alter table public.wishlist enable row level security;
create policy "Users can view own wishlist" on public.wishlist for select using (auth.uid() = user_id);
create policy "Users can insert into own wishlist" on public.wishlist for insert with check (auth.uid() = user_id);
create policy "Users can delete from own wishlist" on public.wishlist for delete using (auth.uid() = user_id);
