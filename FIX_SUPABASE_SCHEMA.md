# Fix Supabase Schema Issue

## Problem
Error: `Could not find the 'shopping_list' column of 'user_data' in the schema cache`

## Solution

Your Supabase database is missing the `shopping_list` column. Follow these steps to fix it:

### Option 1: Add Missing Column (Quick Fix)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run this SQL**
   ```sql
   -- Add the shopping_list column if it doesn't exist
   ALTER TABLE user_data 
   ADD COLUMN IF NOT EXISTS shopping_list jsonb DEFAULT '[]'::jsonb;
   ```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Refresh your app** - the error should be gone!

---

### Option 2: Rebuild Entire Table (Clean Slate)

⚠️ **WARNING: This will delete all existing data!**

If you want to start fresh with the correct schema:

1. **Go to SQL Editor** in Supabase Dashboard

2. **Run this SQL**
   ```sql
   -- Drop the old table
   DROP TABLE IF EXISTS user_data CASCADE;

   -- Create the table with all columns
   CREATE TABLE user_data (
     user_id uuid references auth.users not null primary key,
     meals jsonb default '[]'::jsonb,
     week_slots jsonb default '[]'::jsonb,
     shopping_list jsonb default '[]'::jsonb,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable Row Level Security
   ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

   -- Policies
   CREATE POLICY "Users can view their own data" 
     ON user_data FOR SELECT 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own data" 
     ON user_data FOR INSERT 
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own data" 
     ON user_data FOR UPDATE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own data" 
     ON user_data FOR DELETE 
     USING (auth.uid() = user_id);
   ```

3. **Click "Run"**

4. **Refresh your app**

---

## Verify It Worked

After running the SQL:

1. In Supabase Dashboard, go to **Table Editor**
2. Select the `user_data` table
3. You should see all columns:
   - `user_id`
   - `meals`
   - `week_slots`
   - `shopping_list` ← This should now be visible!
   - `updated_at`

Your app should now sync properly without errors!
