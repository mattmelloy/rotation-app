// @ts-nocheck
/**
 * Data Migration Script: Supabase → Neon DB
 * 
 * This script exports user_data from Supabase and imports it into Neon.
 * 
 * IMPORTANT: Since Supabase Auth manages passwords internally (using bcrypt),
 * we cannot directly migrate password hashes. Users will need to create new
 * passwords via the signup flow.
 * 
 * What this script DOES migrate:
 *   - meals (JSONB)
 *   - week_slots (JSONB)
 *   - shopping_list (JSONB)
 *   - user email addresses (from Supabase Auth)
 * 
 * What this script DOES NOT migrate:
 *   - Passwords (users must re-register)
 * 
 * Usage:
 *   1. Set SUPABASE_URL, SUPABASE_SERVICE_KEY, DATABASE_URL in .env
 *   2. Run: npx tsx scripts/migrate-data.ts
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('   You need the SERVICE ROLE key (not anon key) to access auth.users');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL in .env');
  process.exit(1);
}

const db = neon(DATABASE_URL);

interface SupabaseUser {
  id: string;
  email: string;
}

interface SupabaseUserData {
  user_id: string;
  meals: any;
  week_slots: any;
  shopping_list: any;
  updated_at: string;
}

async function supabaseFetch(path: string) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY!,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase API error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  console.log('🔄 Starting Supabase → Neon migration...\n');

  // 1. Initialize Neon schema
  console.log('📐 Initializing Neon database schema...');
  await db`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
      meals JSONB DEFAULT '[]'::jsonb,
      week_slots JSONB DEFAULT '[]'::jsonb,
      shopping_list JSONB DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('   ✅ Schema created\n');

  // 2. Fetch users from Supabase Auth
  console.log('📥 Fetching users from Supabase Auth...');
  const authResponse = await supabaseFetch('/auth/v1/admin/users');
  const supabaseUsers: SupabaseUser[] = (authResponse.users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
  }));
  console.log(`   Found ${supabaseUsers.length} user(s)\n`);

  // 3. Fetch user_data from Supabase DB
  console.log('📥 Fetching user_data from Supabase...');
  const userDataResponse = await supabaseFetch('/rest/v1/user_data?select=*');
  const userData: SupabaseUserData[] = userDataResponse;
  console.log(`   Found ${userData.length} user_data row(s)\n`);

  // 4. Create a temporary password for each user
  // Users will need to use "forgot password" or re-register
  const TEMP_PASSWORD = 'ChangeMe123!'; // Temporary — users must reset
  const tempHash = await bcrypt.hash(TEMP_PASSWORD, 12);

  // 5. Insert users into Neon
  console.log('📤 Migrating users to Neon...');
  const userIdMapping: Record<string, string> = {}; // supabaseId -> neonId

  for (const user of supabaseUsers) {
    try {
      // Check if user already exists
      const existing = await db`SELECT id FROM users WHERE email = ${user.email}`;
      if (existing.length > 0) {
        userIdMapping[user.id] = existing[0].id;
        console.log(`   ⏭️  User ${user.email} already exists in Neon`);
        continue;
      }

      const result = await db`
        INSERT INTO users (email, password_hash)
        VALUES (${user.email}, ${tempHash})
        RETURNING id
      `;
      userIdMapping[user.id] = result[0].id;
      console.log(`   ✅ Migrated user: ${user.email}`);
    } catch (err: any) {
      console.error(`   ❌ Failed to migrate user ${user.email}: ${err.message}`);
    }
  }

  // 6. Insert user_data into Neon
  console.log('\n📤 Migrating user data to Neon...');
  for (const data of userData) {
    const neonUserId = userIdMapping[data.user_id];
    if (!neonUserId) {
      console.log(`   ⏭️  Skipping data for unknown user_id: ${data.user_id}`);
      continue;
    }

    try {
      await db`
        INSERT INTO user_data (user_id, meals, week_slots, shopping_list, updated_at)
        VALUES (
          ${neonUserId}, 
          ${JSON.stringify(data.meals || [])}, 
          ${JSON.stringify(data.week_slots || [])}, 
          ${JSON.stringify(data.shopping_list || [])}, 
          ${data.updated_at || new Date().toISOString()}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          meals = ${JSON.stringify(data.meals || [])},
          week_slots = ${JSON.stringify(data.week_slots || [])},
          shopping_list = ${JSON.stringify(data.shopping_list || [])},
          updated_at = ${data.updated_at || new Date().toISOString()}
      `;
      console.log(`   ✅ Migrated data for user_id: ${data.user_id} → ${neonUserId}`);
    } catch (err: any) {
      console.error(`   ❌ Failed to migrate data for user_id ${data.user_id}: ${err.message}`);
    }
  }

  console.log('\n✅ Migration complete!');
  console.log('\n⚠️  IMPORTANT: All users have been assigned a temporary password.');
  console.log(`   Temporary password: ${TEMP_PASSWORD}`);
  console.log('   Users should be notified to change their password after first login.');
  console.log('   Alternatively, they can simply re-register with a new password.\n');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
