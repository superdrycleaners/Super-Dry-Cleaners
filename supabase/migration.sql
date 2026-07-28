-- Super Dry Cleaners — Supabase database schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  address1 TEXT NOT NULL,
  address2 TEXT DEFAULT '',
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  notes TEXT DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB DEFAULT '[]'::jsonb,
  total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast status filtering and newest-first ordering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Site content table (key/value store for CMS sections)
CREATE TABLE IF NOT EXISTS site_content (
  section TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) but allow service_role to bypass
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Policy: only authenticated service_role can access (server-side only)
CREATE POLICY "Service role full access on orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on site_content"
  ON site_content FOR ALL
  USING (true)
  WITH CHECK (true);

-- Coupon redemptions table (tracks who used which offer code)
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  order_id TEXT NOT NULL REFERENCES orders(id),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by code + email (checking if already used)
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_code_email ON coupon_redemptions (code, email);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on coupon_redemptions"
  ON coupon_redemptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add coupon fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_value INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_label TEXT;
