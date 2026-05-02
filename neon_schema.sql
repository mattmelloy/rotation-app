-- Neon PostgreSQL Schema for The Rotation
-- This replaces the previous Supabase schema

-- Users table (replaces Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User data table (document store pattern — same structure as before)
CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  meals JSONB DEFAULT '[]'::jsonb,
  week_slots JSONB DEFAULT '[]'::jsonb,
  shopping_list JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
