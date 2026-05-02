import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Neon serverless driver - creates a SQL tagged template function
// Connection string comes from environment variable
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required. Get it from your Neon dashboard.');
  }
  return url;
};

// Lazy initialization to avoid errors at import time if env not set
let _sql: NeonQueryFunction<false, false> | null = null;

export const sql = () => {
  if (!_sql) {
    _sql = neon(getDatabaseUrl());
  }
  return _sql;
};

// Initialize database schema
export async function initializeDatabase() {
  const db = sql();

  // Create users table (replaces Supabase Auth)
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Create user_data table (same schema as Supabase version)
  await db`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
      meals JSONB DEFAULT '[]'::jsonb,
      week_slots JSONB DEFAULT '[]'::jsonb,
      shopping_list JSONB DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('✅ Database schema initialized');
}
