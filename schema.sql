-- ============================================================
-- JUTT MOBILES — SUPABASE DATABASE SCHEMA & INITIAL SEED DATA
-- ============================================================

-- Enable pgcrypto for generating random UUIDs if needed
create extension if not exists "pgcrypto";

-- Clean existing tables/functions (in reverse order of dependencies)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop function if exists is_admin();
drop function if exists decrement_stock(text, integer);

drop table if exists reviews cascade;
drop table if exists orders cascade;
drop table if exists settings cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;

-- 1. Profiles Table (Linked to Supabase Auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- 2. Categories Table
create table categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  color text,
  created_at timestamptz default now()
);

-- 3. Products Table
create table products (
  id text primary key,
  sku text unique,
  name text not null,
  slug text not null unique,
  category_id text references categories(id) on delete set null,
  category_slug text,
  price numeric not null check (price >= 0),
  sale_price numeric check (sale_price >= 0),
  stock_quantity integer default 0 check (stock_quantity >= 0),
  status text default 'published' check (status in ('published', 'draft')),
  badge text,
  rating numeric default 5.0 check (rating >= 0 and rating <= 5),
  review_count integer default 0 check (review_count >= 0),
  short_description text,
  description text,
  images text[] default '{}',
  specifications jsonb default '{}',
  created_at timestamptz default now()
);

-- 4. Orders Table
create table orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  city text,
  province text,
  payment_method text not null,
  notes text,
  subtotal numeric not null check (subtotal >= 0),
  shipping_fee numeric not null check (shipping_fee >= 0),
  discount numeric default 0 check (discount >= 0),
  total numeric not null check (total >= 0),
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  items jsonb not null default '[]'::jsonb,
  user_id uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

-- 5. Settings Table (Single Row Store Configurations)
create table settings (
  id integer primary key default 1 check (id = 1),
  shop_name text not null default 'Jutt Mobiles',
  shop_tagline text default 'Premium Mobile Accessories in Pakistan',
  support_email text default 'support@juttmobile.pk',
  support_phone text default '+92 300 1234567',
  address text default 'Lahore, Punjab, Pakistan',
  whatsapp_number text default '923001234567',
  announcement_bar text default 'Free delivery on orders above Rs. 2,000 | 7-day easy returns | Authentic products, warranty included',
  shipping_flat_rate numeric default 250,
  free_shipping_threshold numeric default 2000,
  free_shipping_enabled boolean default true,
  cod_enabled boolean default true,
  bank_transfer_enabled boolean default true,
  bank_name text default 'HBL (Habib Bank)',
  account_title text default 'Jutt Mobiles Pakistan',
  account_number text default '0001-1234567890',
  iban text default 'PK36HABB0000000001234567',
  currency text default 'PKR',
  currency_symbol text default 'Rs.',
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  created_at timestamptz default now()
);

-- 6. Reviews Table
create table reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text references products(id) on delete cascade not null,
  author text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- ============================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to check if a user is an admin
create or replace function is_admin()
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Trigger to automatically create profile on sign up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC Function to decrement product stock on order
create or replace function decrement_stock(product_id text, qty integer)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set stock_quantity = greatest(0, stock_quantity - qty)
  where id = product_id;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;
alter table reviews enable row level security;

-- 1. Profiles Policies
create policy "Allow users to read own profile" on profiles
  for select using (auth.uid() = id or is_admin());

create policy "Allow users to update own profile" on profiles
  for update using (auth.uid() = id or is_admin());

create policy "Allow admin full access on profiles" on profiles
  for all using (is_admin());

-- 2. Categories Policies
create policy "Allow public read-only access to categories" on categories
  for select using (true);

create policy "Allow admin full access on categories" on categories
  for all using (is_admin());

-- 3. Products Policies
create policy "Allow public read-only access to products" on products
  for select using (true);

create policy "Allow admin full access on products" on products
  for all using (is_admin());

-- 4. Reviews Policies
create policy "Allow public read-only access to reviews" on reviews
  for select using (true);

create policy "Allow anyone to insert reviews" on reviews
  for insert with check (true);

create policy "Allow admin full access on reviews" on reviews
  for all using (is_admin());

-- 5. Orders Policies
create policy "Allow users to read own orders" on orders
  for select using (auth.uid() = user_id or is_admin());

create policy "Allow anyone to insert orders" on orders
  for insert with check (true);

create policy "Allow admin full access on orders" on orders
  for all using (is_admin());

-- 6. Settings Policies
create policy "Allow public read-only access to settings" on settings
  for select using (true);

create policy "Allow admin full access on settings" on settings
  for all using (is_admin());


-- ============================================================
-- DATA SEEDING
-- ============================================================

-- 1. Seed Settings
insert into settings (id, shop_name, shop_tagline, support_email, support_phone, address, whatsapp_number, announcement_bar, shipping_flat_rate, free_shipping_threshold, free_shipping_enabled, cod_enabled, bank_transfer_enabled, bank_name, account_title, account_number, iban, currency, currency_symbol)
values (
  1,
  'Jutt Mobiles',
  'Premium Mobile Accessories in Pakistan',
  'support@juttmobile.pk',
  '+92 300 1234567',
  'Lahore, Punjab, Pakistan',
  '923001234567',
  'Free delivery on orders above Rs. 2,000 | 7-day easy returns | Authentic products, warranty included',
  250,
  2000,
  true,
  true,
  true,
  'HBL (Habib Bank)',
  'Jutt Mobiles Pakistan',
  '0001-1234567890',
  'PK36HABB0000000001234567',
  'PKR',
  'Rs.'
);

-- 2. Seed Categories
insert into categories (id, name, slug, description, icon, color) values
('cat-1', 'Mobile Accessories', 'mobile-accessories', 'Cases, screen protectors, stands and more', '📱', '#06b6d4'),
('cat-2', 'Accessories', 'accessories', 'Cables, mounts, tripods and everyday essentials', '🔌', '#3b82f6'),
('cat-3', 'Power Banks & Chargers', 'power-banks', 'Fast chargers, power banks and wireless pads', '⚡', '#f59e0b'),
('cat-4', 'Earphones & Headsets', 'earphones', 'TWS earbuds, neckbands, and studio headphones', '🎧', '#8b5cf6'),
('cat-5', 'Smart Watches', 'smart-watches', 'Fitness bands, AMOLED smartwatches and GPS trackers', '⌚', '#10b981'),
('cat-6', 'Gaming', 'gaming', 'Controllers, triggers, cooling fans and gaming headsets', '🎮', '#ef4444'),
('cat-7', 'Tech Gadgets', 'tech-gadgets', 'Bluetooth speakers, ring lights, smart plugs and more', '💡', '#ec4899');

insert into products (id, sku, name, slug, category_id, category_slug, price, sale_price, stock_quantity, status, badge, rating, review_count, short_description, description, images, specifications) values
-- Mobile Accessories
(
  'mb-1', 'JM-MB-001', 'Jutt Tempered Glass Screen Protector', 'mb-1', 'cat-1', 'mobile-accessories',
  350, 299, 150, 'published', 'New', 4.5, 38,
  'Ultra-clear 9H hardness tempered glass screen protector with full coverage.',
  'Protect your screen with Jutt premium tempered glass. 9H hardness rating offers superior scratch resistance. Easy bubble-free installation kit included.',
  array['/assets/feature-product-BP1DexGI.jpg'],
  '{"Hardness": "9H", "Material": "Tempered Glass", "Coverage": "Full", "Thickness": "0.3mm", "Oleophobic Coating": "Yes", "Touch Response": "99%"}'::jsonb
),
(
  'mb-2', 'JM-MB-002', 'Jutt MagSafe Silicone Phone Case', 'mb-2', 'cat-1', 'mobile-accessories',
  1199, 899, 85, 'published', null, 4.7, 56,
  'Premium liquid silicone case with built-in MagSafe magnet ring for wireless charging.',
  'Crafted from premium liquid silicone with a soft microfiber lining, this MagSafe-compatible case perfectly balances protection and elegance. Features precise cutouts and a raised bezel for screen and camera protection.',
  array['/assets/powerbank-4-17eCjlqr.jpg'],
  '{"Material": "Liquid Silicone", "Compatibility": "iPhone 13/14/15 Series", "MagSafe": "Yes", "Drop Protection": "2m", "Colors Available": "8"}'::jsonb
),
(
  'mb-3', 'JM-MB-003', 'Jutt Foldable Tablet Stand Aluminium', 'mb-3', 'cat-1', 'mobile-accessories',
  1499, 1299, 40, 'published', 'Hot', 4.6, 29,
  'Adjustable aluminium alloy desktop stand for phones and tablets up to 13".',
  'Sleek and sturdy aluminium alloy tablet stand with 360° rotation and adjustable angle. Anti-slip silicone pads prevent scratches and keep devices secure. Folds flat for travel convenience.',
  array['/assets/powerbank-3-Dzxoht3C.jpg'],
  '{"Material": "Aluminium Alloy", "Device Size": "Up to 13\"", "Adjustable Angle": "Yes", "Rotation": "360°", "Foldable": "Yes", "Weight": "280g"}'::jsonb
),
(
  'mb-4', 'JM-MB-004', 'Jutt USB-C to Lightning Braided Cable 1m', 'mb-4', 'cat-1', 'mobile-accessories',
  799, 599, 200, 'published', null, 4.4, 72,
  'Premium braided USB-C to Lightning cable with 30W fast charging support.',
  'Double-braided nylon cable with reinforced connector heads for durability. Supports 30W PD fast charging and high-speed data transfer.',
  array['/assets/powerbank-2-l4eDv4NK.jpg'],
  '{"Length": "1m", "Material": "Braided Nylon", "Power Delivery": "30W", "Data Speed": "USB 2.0", "MFi Certified": "Yes"}'::jsonb
),

-- Accessories
(
  'ac-1', 'JM-AC-001', 'Jutt 3-in-1 Charging Cable Braided', 'ac-1', 'cat-2', 'accessories',
  899, 699, 120, 'published', null, 4.5, 91,
  'Charge all your devices with one cable — Lightning, USB-C, and Micro USB.',
  'Premium braided 3-in-1 multi-charging cable compatible with all major device types. Tangle-free design with 25W fast charging. 1.2m length with retractable ends.',
  array['/assets/powerbank-2-l4eDv4NK.jpg'],
  '{"Connectors": "Lightning, USB-C, Micro-USB", "Length": "1.2m", "Power": "25W Max", "Material": "Braided Nylon", "Compatibility": "Universal"}'::jsonb
),
(
  'ac-2', 'JM-AC-002', 'Jutt Universal Phone Holder Car Mount', 'ac-2', 'cat-2', 'accessories',
  1199, 999, 65, 'published', 'New', 4.3, 44,
  'Gravity-sensing car mount with CD slot and dashboard mounting options.',
  'Auto-lock gravity car mount compatible with 4" to 7" phones. Fits CD slot or dashboard with included suction cup. One-handed operation with 360° rotation.',
  array['/assets/powerbank-4-17eCjlqr.jpg'],
  '{"Mount Type": "CD Slot / Dashboard", "Device Size": "4\" - 7\"", "Rotation": "360°", "Lock Type": "Gravity Auto-Lock", "Material": "ABS + Silicone"}'::jsonb
),
(
  'ac-3', 'JM-AC-003', 'Jutt Bluetooth Selfie Tripod Stand', 'ac-3', 'cat-2', 'accessories',
  1899, 1599, 35, 'published', null, 4.6, 33,
  'Extendable Bluetooth remote shutter tripod, doubles as a selfie stick.',
  'Multi-function tripod that extends from 21cm to 160cm. Detachable Bluetooth remote works up to 10m range. Foldable and ultra-lightweight for travel.',
  array['/assets/earphone-2-DGaIUvk1.jpg'],
  '{"Extended Length": "Up to 160cm", "Bluetooth Range": "10m", "Battery": "Built-in rechargeable", "Compatibility": "iOS & Android", "Weight": "200g"}'::jsonb
),
(
  'ac-4', 'JM-AC-004', 'Jutt OTG Type-C Card Reader', 'ac-4', 'cat-2', 'accessories',
  450, 399, 300, 'published', null, 4.1, 57,
  'Compact OTG card reader supporting SD, TF, and USB-A simultaneously.',
  'All-in-one USB-C hub with SD card reader, TF card reader, and USB-A port. Supports simultaneous reading. Plug-and-play with no driver installation required.',
  array['/assets/powerbank-1-B6KU1BY8.jpg'],
  '{"Interface": "USB-C", "Ports": "SD, TF, USB-A", "Transfer Speed": "Up to 5Gbps", "Plug & Play": "Yes", "OS": "Android, MacOS, Windows"}'::jsonb
),

-- Power Banks & Chargers
(
  'pb-1', 'JM-PB-001', 'Jutt Slim 10000mAh Power Bank', 'pb-1', 'cat-3', 'power-banks',
  2999, 2499, 55, 'published', null, 4.8, 124,
  'Ultra-slim 10000mAh power bank with 22.5W fast charging and dual output.',
  'Jutt Slim is the world-class ultra-thin power bank at just 12mm thick. Features 22.5W input/output, LED indicator display, and dual USB-A + USB-C outputs. Charges an iPhone 15 from 0 to 100% in under 90 minutes.',
  array['/assets/powerbank-1-B6KU1BY8.jpg'],
  '{"Capacity": "10,000 mAh", "Output": "22.5W Max", "Input": "USB-C 22.5W", "Ports": "2x USB-A, 1x USB-C", "Thickness": "12mm", "Weight": "186g"}'::jsonb
),
(
  'pb-2', 'JM-PB-002', 'Jutt 65W GaN Fast Wall Charger', 'pb-2', 'cat-3', 'power-banks',
  3999, 3499, 80, 'published', 'New', 4.9, 89,
  'Compact 65W GaN charger with 3 ports for simultaneous laptop, phone, and tablet charging.',
  'Next-gen GaN (Gallium Nitride) technology delivers 65W total power in a package smaller than a credit card. PD 3.0 + QC 4.0 compatible. Charge your MacBook Pro from 0-50% in just 30 minutes.',
  array['/assets/powerbank-2-l4eDv4NK.jpg'],
  '{"Total Power": "65W", "Technology": "GaN (Gallium Nitride)", "Ports": "2x USB-C PD, 1x USB-A QC", "Standards": "PD3.0, QC4.0", "Input": "100-240V", "Safety": "OVP, OCP, OTP"}'::jsonb
),
(
  'pb-3', 'JM-PB-003', 'Jutt 20000mAh Digital Display Power Bank', 'pb-3', 'cat-3', 'power-banks',
  4999, 4499, 30, 'published', null, 4.7, 67,
  'High-capacity 20000mAh power bank with digital display showing exact battery percentage.',
  'Never guess your charge level again. The built-in LCD display shows precise battery percentage. 22.5W bidirectional fast charging with pass-through support. Charge 3 devices simultaneously.',
  array['/assets/powerbank-3-Dzxoht3C.jpg'],
  '{"Capacity": "20,000 mAh", "Display": "LCD Digital Percentage", "Output Power": "22.5W", "Ports": "3 (USB-C, 2x USB-A)", "Weight": "420g", "Pass-Through": "Yes"}'::jsonb
),
(
  'pb-4', 'JM-PB-004', 'Jutt MagSafe Wireless Charging Pad', 'pb-4', 'cat-3', 'power-banks',
  2799, 2499, 70, 'published', 'Hot', 4.6, 42,
  '15W MagSafe-compatible wireless charging pad with LED indicator.',
  'Perfectly aligned MagSafe wireless charging for iPhones. Delivers 15W for MagSafe-compatible devices, 10W for Qi2, and 5W for standard Qi. Anti-slip base with foreign object detection.',
  array['/assets/powerbank-4-17eCjlqr.jpg'],
  '{"Max Output": "15W (MagSafe)", "Standards": "MagSafe, Qi2, Qi", "Cable": "USB-C 1.5m", "FOD": "Yes", "LED Indicator": "Yes"}'::jsonb
),

-- Earphones & Headsets
(
  'ep-1', 'JM-EP-001', 'Jutt TWS Pro Wireless Earbuds', 'ep-1', 'cat-4', 'earphones',
  2699, 2299, 45, 'published', null, 4.7, 156,
  'True wireless earbuds with ANC, 30hr total battery, and IPX5 water resistance.',
  'Jutt TWS Pro delivers a premium sound experience with active noise cancellation and deep bass drivers. Earbuds last 8 hours, case extends to 30 hours. Touch controls with voice assistant support.',
  array['/assets/earphone-1-DYzzoxEI.jpg'],
  '{"Driver": "13mm Dynamic", "ANC": "Active Noise Cancellation", "Battery": "8hr + 22hr case", "IPX Rating": "IPX5", "Bluetooth": "5.3", "Latency": "35ms Gaming Mode"}'::jsonb
),
(
  'ep-2', 'JM-EP-002', 'Jutt Neckband Bluetooth Earphones', 'ep-2', 'cat-4', 'earphones',
  2199, 1899, 60, 'published', 'New', 4.5, 88,
  'Neckband earphones with magnetic eartips, 24hr battery, and cVc 8.0 mic.',
  'Stay connected all day with Jutt Neckband earphones. Magnetic eartips snap together when not in use. cVc 8.0 noise-cancelling microphone for crystal-clear calls.',
  array['/assets/earphone-2-DGaIUvk1.jpg'],
  '{"Type": "Neckband", "Battery": "24 hours", "Bluetooth": "5.0", "Mic": "cVc 8.0", "Charging": "USB-C", "Magnetic": "Yes"}'::jsonb
),
(
  'ep-3', 'JM-EP-003', 'Jutt Studio Over-Ear Headphones', 'ep-3', 'cat-4', 'earphones',
  5999, 5499, 20, 'published', null, 4.9, 43,
  'Professional studio headphones with 40mm drivers, foldable design, and 50hr battery.',
  'Studio-grade sound reproduction with custom-tuned 40mm neodymium drivers. Foldable design with memory foam earcups. Works wired (3.5mm) or wirelessly via Bluetooth 5.2.',
  array['/assets/earphone-3-DrQ_pPtF.jpg'],
  '{"Driver": "40mm Neodymium", "Frequency": "20Hz - 20kHz", "Battery": "50 hours", "Bluetooth": "5.2", "Wired Mode": "3.5mm AUX", "Foldable": "Yes"}'::jsonb
),

-- Smart Watches
(
  'wt-1', 'JM-WT-001', 'Jutt Smart Watch S9 Pro AMOLED', 'wt-1', 'cat-5', 'smart-watches',
  6499, 4999, 35, 'published', null, 4.8, 201,
  'AMOLED smartwatch with 100+ sport modes, Bluetooth calling, and 7-day battery.',
  'The Jutt S9 Pro features a gorgeous 1.96" AMOLED display with always-on capabilities. Bluetooth calling, 100+ sport modes, heart rate/SpO2/stress monitoring. 7-day battery with customizable watch faces.',
  array['/assets/earphone-3-DrQ_pPtF.jpg'],
  '{"Display": "1.96\" AMOLED", "Battery": "7 days", "Sport Modes": "100+", "Bluetooth Calling": "Yes", "Health": "HR, SpO2, Stress, Sleep", "Water Resistance": "5ATM"}'::jsonb
),
(
  'wt-2', 'JM-WT-002', 'Jutt Fitness Band Pulse 2', 'wt-2', 'cat-5', 'smart-watches',
  2199, 1799, 90, 'published', 'New', 4.4, 78,
  'Slim fitness band with continuous heart rate tracking, sleep analysis, and 14-day battery.',
  'Track your health around the clock with Jutt Fitness Band Pulse 2. Automatic workout detection, female health tracking, and smart notifications. 1.47" AMOLED touch screen with always-on option.',
  array['/assets/earphone-2-DGaIUvk1.jpg'],
  '{"Display": "1.47\" AMOLED", "Battery": "14 days", "Water Resistance": "5ATM", "Sensors": "HR, SpO2, Gyroscope", "Auto Detection": "6 workouts", "Charging": "Magnetic"}'::jsonb
),
(
  'wt-3', 'JM-WT-003', 'Jutt Ultra Sport Watch Titanium', 'wt-3', 'cat-5', 'smart-watches',
  11999, 8999, 12, 'published', 'Hot', 4.9, 34,
  'Premium titanium sports watch with GPS, offline maps, and 21-day battery life.',
  'Built for serious athletes. Aircraft-grade titanium case with sapphire crystal glass. Built-in GPS with offline topographic maps, altimeter, barometer, and compass. MIL-STD-810H military-grade durability.',
  array['/assets/earphone-1-DYzzoxEI.jpg'],
  '{"Case": "Titanium + Sapphire Glass", "GPS": "Multi-band GNSS", "Battery": "GPS Mode 21 days", "Durability": "MIL-STD-810H", "Dive Rating": "100m", "Maps": "Offline Topographic"}'::jsonb
),

-- Gaming
(
  'gm-1', 'JM-GM-001', 'Jutt Wireless Game Controller Pro', 'gm-1', 'cat-6', 'gaming',
  3499, 2999, 28, 'published', null, 4.6, 112,
  'Multi-platform wireless game controller with 1000Hz polling and hall effect sticks.',
  'Professional wireless controller with Bluetooth 5.0 + USB-C wired mode. Hall effect joysticks eliminate drift. 10-hour battery, programmable back buttons, and vibration feedback.',
  array['/assets/powerbank-4-17eCjlqr.jpg'],
  '{"Connection": "Bluetooth 5.0 + USB-C", "Sticks": "Hall Effect (Drift-Free)", "Battery": "10 hours", "Polling Rate": "1000Hz", "Platforms": "PC, Android, iOS", "Back Buttons": "4 programmable"}'::jsonb
),
(
  'gm-2', 'JM-GM-002', 'Jutt RGB Mobile Gaming Trigger Set', 'gm-2', 'cat-6', 'gaming',
  999, 799, 150, 'published', 'New', 4.3, 67,
  'Sensitive shoulder trigger buttons with RGB lighting for mobile PUBG/COD gaming.',
  'Clip-on L1/R1 trigger buttons transform your phone into a gaming console. Ultra-sensitive 30-degree angle triggers, RGB underglow lighting, and universal compatibility.',
  array['/assets/earphone-4-D8h7Lxv4.jpg'],
  '{"Sensitivity": "Ultra-sensitive", "Lighting": "RGB", "Compatibility": "Universal 4\" - 6.7\"", "Material": "ABS Plastic", "Trigger Angle": "30°"}'::jsonb
),
(
  'gm-3', 'JM-GM-003', 'Jutt Gaming Headset 7.1 Surround', 'gm-3', 'cat-6', 'gaming',
  4999, 4499, 22, 'published', null, 4.7, 88,
  '7.1 virtual surround sound gaming headset with noise-cancelling mic and RGB.',
  'Immersive 7.1 virtual surround sound with 50mm drivers for competitive gaming. Detachable noise-cancelling microphone, premium memory foam earcups, and RGB lighting effects.',
  array['/assets/earphone-3-DrQ_pPtF.jpg'],
  '{"Driver": "50mm", "Surround": "7.1 Virtual", "Microphone": "Detachable NC Mic", "RGB": "Yes", "Connection": "USB + 3.5mm AUX", "Weight": "320g"}'::jsonb
),

-- Tech Gadgets
(
  'gd-1', 'JM-GD-001', 'Jutt Mini Bluetooth Speaker Boom', 'gd-1', 'cat-7', 'tech-gadgets',
  2499, 1999, 48, 'published', null, 4.5, 94,
  'Compact 10W portable Bluetooth speaker with 360° audio and IPX7 waterproofing.',
  'Big sound in a compact body. Jutt Boom delivers 10W of rich 360° audio with deep bass via passive radiator. IPX7 waterproof — take it to the beach, pool, or shower. 12-hour playtime.',
  array['/assets/feature-product-BP1DexGI.jpg'],
  '{"Power": "10W", "Audio": "360° Omnidirectional", "Waterproof": "IPX7", "Battery": "12 hours", "Bluetooth": "5.2", "TWS Pairing": "Yes"}'::jsonb
),
(
  'gd-2', 'JM-GD-002', 'Jutt LED Ring Light 10" with Tripod', 'gd-2', 'cat-7', 'tech-gadgets',
  2999, 2499, 33, 'published', 'Creator', 4.6, 51,
  '10" LED ring light with adjustable tripod stand and phone holder for content creation.',
  'Professional studio lighting at home. 3 color modes (3200K-5500K-6500K), 10 brightness levels. Includes adjustable 50-160cm tripod, universal phone holder, and remote control.',
  array['/assets/powerbank-4-17eCjlqr.jpg'],
  '{"Size": "10 inches", "Color Temp": "3200K / 5500K / 6500K", "Brightness": "10 Levels", "Tripod Height": "50-160cm", "Power": "USB", "Remote": "Included"}'::jsonb
),
(
  'gd-3', 'JM-GD-003', 'Jutt Smart WiFi Plug Adapter', 'gd-3', 'cat-7', 'tech-gadgets',
  1499, 1299, 100, 'published', 'Smart', 4.2, 39,
  'WiFi smart plug with energy monitoring, voice control (Alexa/Google), and scheduling.',
  'Transform any appliance into a smart one. Monitor energy usage in real-time, set timers and schedules via app, and use voice control with Alexa and Google Assistant.',
  array['/assets/powerbank-1-B6KU1BY8.jpg'],
  '{"WiFi": "2.4GHz 802.11 b/g/n", "Voice Control": "Alexa, Google", "Energy Monitor": "Yes", "App": "iOS & Android", "Max Load": "16A / 3680W", "Timer": "Yes"}'::jsonb
),

-- Special WIWU Product
(
  'wiwu-3in1', 'JM-WIWU-001', 'WIWU 3 in 1 Wireless Charger Speaker Wi-W022', 'wiwu-3in1-wireless-charger', 'cat-3', 'power-banks',
  9999, 8999, 18, 'published', 'Premium', 4.9, 28,
  'Charge phone, earbuds, and smartwatch simultaneously with crystal-clear audio output.',
  'The WIWU Wi-W022 is the ultimate desk companion. A premium 3-in-1 wireless charging station combined with a high-fidelity Bluetooth speaker. Charge your phone (15W MagSafe / 10W Qi), earbuds (5W), and smartwatch all at once while enjoying rich, room-filling sound.',
  array['/assets/feature-product-BP1DexGI.jpg'],
  '{"Phone Charging": "15W MagSafe / 10W Qi2", "Earbuds Charging": "5W", "Watch Charging": "3W", "Speaker Power": "10W Hi-Fi", "Bluetooth": "5.3 (Speaker)", "Material": "Premium Aluminium + Fabric"}'::jsonb
);

-- 4. Seed Reviews
insert into reviews (product_id, author, rating, comment, created_at) values
('pb-1', 'Ahmed Raza', 5, 'Excellent product! Fast charging and very slim. Highly recommended.', now() - interval '45 days'),
('pb-1', 'Sara Khan', 4, 'Great power bank, light and portable. Wish it had more capacity.', now() - interval '37 days'),
('ep-1', 'Bilal Ahmad', 5, 'Sound quality is amazing! ANC is very effective. Worth every penny.', now() - interval '23 days'),
('wt-1', 'Fatima Ali', 5, 'Best smartwatch I''ve owned. The AMOLED display is gorgeous!', now() - interval '14 days');
