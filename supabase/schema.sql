-- ============================================================================
-- MediTrust Pharmacy & Varieties · Complete Supabase SQL Setup
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1. Site Settings (brand, contact info, socials, hero, story/CEO, FAQ, footer)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.site_settings (id, config)
VALUES (
  'main',
  '{
    "brand": {
      "name": "MediTrust Pharmacy",
      "tagline": "& VARIETIES · OWERRI",
      "logoUrl": ""
    },
    "topBar": {
      "address": "Orji Town, Owerri, Imo State, Nigeria",
      "hours": "Mon–Sat: 8 AM–10 PM · Sun: 12 AM–11 PM",
      "whatsappNumber": "2348100051616",
      "whatsappDisplay": "+234 810 005 1616",
      "phone": "+234 810 005 1616",
      "email": "Hyginustina46@gmail.com"
    },
    "socials": {
      "facebook": "https://www.facebook.com",
      "instagram": "https://www.instagram.com",
      "tiktok": "https://www.tiktok.com"
    },
    "hero": {
      "eyebrow": "YOUR DAILY ESSENTIALS · CARE FIRST",
      "headline": "Care you can count on.",
      "subtitle": "Your neighbourhood destination for pharmacy essentials, personal care, baby products and everyday provisions. Shop conveniently and contact our team to confirm availability and delivery.",
      "primaryCta": "Explore Our Products",
      "secondaryCta": "View Your Cart",
      "trustPoints": ["Friendly service", "Convenient ordering", "Delivery enquiries"],
      "badgeTop": "Care comes first",
      "badgeBottom": "Daily essentials",
      "emblemTitle": "MEDITRUST",
      "emblemSubtitle": "CARE YOU CAN COUNT ON",
      "heroImageUrl": ""
    },
    "storySection": {
      "eyebrow": "OUR STORY",
      "heading": "Built for Orji Town, Owerri — putting care first every day.",
      "body": "MediTrust Pharmacy & Varieties brings together reliable pharmacy essentials and daily household varieties in one accessible neighbourhood store. Whether you are stopping by for first-aid items, baby care, or pantry staples, our counter team focuses on clear communication, honest pricing, and attentive service.",
      "ceoImageUrl": "/src/assets/images/meditrust_ceo_demo_1794918002197.jpg",
      "ceoName": "Chief Executive Officer",
      "ceoTitle": "Founder & Managing Director · MediTrust Pharmacy & Varieties"
    },
    "contactSection": {
      "eyebrow": "VISIT OR MESSAGE US",
      "heading": "Contact MediTrust Pharmacy & Varieties",
      "subtitle": "Visit our store in Orji Town, Owerri or message us on WhatsApp to confirm product availability and delivery options.",
      "hoursText": "Mon–Sat: 8 AM–10 PM · Sunday: 12 AM–11 PM",
      "formTitle": "Send a Quick WhatsApp Enquiry",
      "formSubtitle": "Ask about stock, pack sizes, or Owerri delivery before visiting."
    },
    "footer": {
      "description": "Your neighbourhood destination for pharmacy essentials, personal care, baby care and everyday provisions.",
      "copyright": "© 2026 MediTrust Pharmacy & Varieties. All rights reserved.",
      "taglineRight": "Care first. Convenience always.",
      "legalNote": "Medicines availability is subject to applicable regulations. Product listings are for shopping enquiry and are not medical advice. Use medicines strictly as directed by an appropriately qualified professional."
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Categories Table & Seed (6 Store Categories)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  accent_bg TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  icon_type TEXT NOT NULL CHECK (icon_type IN ('pill', 'lotion', 'baby', 'bread', 'spray', 'shield')),
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO public.categories (id, title, subtitle, accent_bg, accent_color, icon_type, sort_order)
VALUES
  ('Pharmacy', 'Pharmacy', 'Medicines & health essentials', 'bg-rose-50', 'text-rose-600', 'pill', 1),
  ('Personal Care', 'Personal Care', 'Skin, hair & body care', 'bg-sky-50', 'text-sky-600', 'lotion', 2),
  ('Baby Care', 'Baby Care', 'Baby hygiene & comfort', 'bg-amber-50', 'text-amber-600', 'baby', 3),
  ('Provisions', 'Provisions', 'Snacks, honey & groceries', 'bg-orange-50', 'text-orange-600', 'bread', 4),
  ('Household', 'Household', 'Home cleaning essentials', 'bg-emerald-50', 'text-emerald-600', 'spray', 5),
  ('Contraceptives', 'Contraceptives', 'Family planning essentials', 'bg-indigo-50', 'text-indigo-600', 'shield', 6)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Products Table & Seed (All 28 Storefront Items)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  unit TEXT NOT NULL DEFAULT 'Pack',
  badge_color TEXT NOT NULL DEFAULT '#DBEAFE',
  icon_key TEXT NOT NULL DEFAULT 'tablets',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.products (id, name, category, description, price, unit, badge_color, icon_key, sort_order)
VALUES
  ('paracetamol-tablets', 'Paracetamol Tablets', 'Pharmacy', 'Common pain and fever relief. Use as directed.', 500, 'Pack', '#DBEAFE', 'tablets', 1),
  ('vitamin-c', 'Vitamin C', 'Pharmacy', 'Vitamin supplement. Check suitability with a professional.', 1800, 'Pack', '#FFEDD5', 'citrus', 2),
  ('oral-rehydration-salts', 'Oral Rehydration Salts', 'Pharmacy', 'Rehydration salts for preparation as directed.', 350, 'Sachet', '#E0F2FE', 'droplet', 3),
  ('antiseptic-solution', 'Antiseptic Solution', 'Pharmacy', 'For appropriate external use as labelled.', 1500, 'Bottle', '#FEF3C7', 'antiseptic', 4),
  ('first-aid-plasters', 'First Aid Plasters', 'Pharmacy', 'Basic first aid dressing essentials.', 800, 'Pack', '#FFE4E6', 'plaster', 5),
  ('digital-thermometer', 'Digital Thermometer', 'Pharmacy', 'For checking body temperature; follow instructions.', 4500, 'Piece', '#F1F5F9', 'thermometer', 6),
  ('body-lotion', 'Body Lotion', 'Personal Care', 'Daily moisturising body care.', 2500, 'Bottle', '#FEF9C3', 'lotion', 7),
  ('hair-cream', 'Hair Cream', 'Personal Care', 'Hair grooming and conditioning essential.', 1800, 'Jar', '#E0F2FE', 'haircream', 8),
  ('petroleum-jelly', 'Petroleum Jelly', 'Personal Care', 'A versatile skin moisturising product.', 1200, 'Jar', '#ECFCCB', 'jelly', 9),
  ('bathing-soap', 'Bathing Soap', 'Personal Care', 'For everyday bathing and cleansing.', 700, 'Bar', '#CCFBF1', 'soap', 10),
  ('toothpaste', 'Toothpaste', 'Personal Care', 'Daily oral hygiene essential.', 1500, 'Tube', '#F1F5F9', 'toothpaste', 11),
  ('shampoo', 'Shampoo', 'Personal Care', 'Hair cleansing and care.', 2200, 'Bottle', '#EDE9FE', 'shampoo', 12),
  ('baby-diapers', 'Baby Diapers', 'Baby Care', 'Baby diaper pack. Confirm size and quantity.', 6500, 'Pack', '#FEF3C7', 'diapers', 13),
  ('baby-wipes', 'Baby Wipes', 'Baby Care', 'Convenient baby cleaning wipes.', 1800, 'Pack', '#E0F2FE', 'wipes', 14),
  ('baby-lotion', 'Baby Lotion', 'Baby Care', 'Gentle baby skin care; check the label.', 2400, 'Bottle', '#FCE7F3', 'babylotion', 15),
  ('baby-powder', 'Baby Powder', 'Baby Care', 'Baby care product. Keep powder away from the baby''s face.', 1700, 'Bottle', '#F3E8FF', 'powder', 16),
  ('sliced-bread', 'Sliced Bread', 'Provisions', 'Everyday bread. Confirm current availability.', 1800, 'Loaf', '#FEF3C7', 'bread', 17),
  ('pure-honey', 'Pure Honey', 'Provisions', 'Honey for household use.', 3500, 'Bottle', '#FFEDD5', 'honey', 18),
  ('biscuits', 'Biscuits', 'Provisions', 'A convenient snack for home or work.', 500, 'Pack', '#FEF3C7', 'biscuits', 19),
  ('breakfast-cereal', 'Breakfast Cereal', 'Provisions', 'A convenient breakfast cupboard staple.', 3200, 'Pack', '#FFE4E6', 'cereal', 20),
  ('instant-noodles', 'Instant Noodles', 'Provisions', 'Quick-cooking pantry staple.', 600, 'Pack', '#FEF9C3', 'noodles', 21),
  ('sugar', 'Sugar', 'Provisions', 'Everyday kitchen ingredient.', 1500, 'Pack', '#F1F5F9', 'sugar', 22),
  ('dishwashing-liquid', 'Dishwashing Liquid', 'Household', 'For routine dishwashing as directed.', 1800, 'Bottle', '#DCFCE7', 'dishwash', 23),
  ('laundry-detergent', 'Laundry Detergent', 'Household', 'Laundry cleaning essential.', 2800, 'Pack', '#DBEAFE', 'detergent', 24),
  ('toilet-tissue', 'Toilet Tissue', 'Household', 'Everyday bathroom essential.', 1500, 'Pack', '#F1F5F9', 'tissue', 25),
  ('household-bleach', 'Household Bleach', 'Household', 'Use as directed. Never mix bleach with other cleaners.', 1300, 'Bottle', '#E0F2FE', 'bleach', 26),
  ('condoms', 'Condoms', 'Contraceptives', 'Check the expiry date and package integrity.', 1200, 'Pack', '#FFE4E6', 'condoms', 27),
  ('lubricant', 'Lubricant', 'Contraceptives', 'Check compatibility with the condom material.', 2500, 'Pack', '#E0F2FE', 'lubricant', 28)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Media Gallery (Uploaded Images & Videos for Hero or Showcase)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_gallery (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  placement TEXT NOT NULL DEFAULT 'gallery' CHECK (placement IN ('gallery', 'hero')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. Contact Enquiries (Full Name, Email, Phone, Location, Message)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. Admin & Manager Auth Tables (Protected — Backend Service Role Only)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id TEXT PRIMARY KEY DEFAULT 'default',
  admin_password_hash TEXT NOT NULL,
  manager_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  manager_name TEXT NOT NULL DEFAULT 'Store Manager',
  manager_password_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_admin_credentials_updated_at ON public.admin_credentials;
CREATE TRIGGER trg_admin_credentials_updated_at
  BEFORE UPDATE ON public.admin_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.admin_credentials (id, admin_password_hash, manager_enabled, manager_name)
VALUES (
  'default',
  crypt('Admin@1252', gen_salt('bf')),
  false,
  'Store Manager'
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  display_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions (expires_at);

-- ----------------------------------------------------------------------------
-- 7. Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read media_gallery" ON public.media_gallery;
CREATE POLICY "Public read media_gallery"
  ON public.media_gallery FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert contact_enquiries" ON public.contact_enquiries;
CREATE POLICY "Public insert contact_enquiries"
  ON public.contact_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 8. Supabase Storage Bucket for Product Photos, CEO Portrait & Videos
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('meditrust-media', 'meditrust-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public view meditrust-media" ON storage.objects;
CREATE POLICY "Public view meditrust-media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'meditrust-media');

DROP POLICY IF EXISTS "Service role manage meditrust-media" ON storage.objects;
CREATE POLICY "Service role manage meditrust-media"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'meditrust-media')
  WITH CHECK (bucket_id = 'meditrust-media');
