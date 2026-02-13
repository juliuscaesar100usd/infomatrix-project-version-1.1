-- ============================================
-- NutriMind AI – Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== Users Table =====
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Meals Table =====
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  description TEXT,
  dish_name VARCHAR(255),
  sugar_grams REAL DEFAULT 0,
  risk_level VARCHAR(10) DEFAULT 'low',
  ingredients JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast meal lookups by user and date
CREATE INDEX IF NOT EXISTS idx_meals_user_date
  ON meals (user_id, created_at DESC);

-- ===== Sugar Timer Table =====
CREATE TABLE IF NOT EXISTS sugar_timer (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Row Level Security (RLS) =====

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugar_timer ENABLE ROW LEVEL SECURITY;

-- Policy: Allow the service role full access
-- (Our backend uses the service role key, so these ensure it works)
CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on meals"
  ON meals FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on sugar_timer"
  ON sugar_timer FOR ALL
  USING (true)
  WITH CHECK (true);
