-- Create a table to store user data (document store pattern)
create table if not exists user_data (
  user_id uuid references auth.users not null primary key,
  meals jsonb default '[]'::jsonb,
  week_slots jsonb default '[]'::jsonb,
  shopping_list jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table user_data enable row level security;

-- Policy: Users can only see their own data
create policy "Users can view their own data" 
  on user_data for select 
  using (auth.uid() = user_id);

-- Policy: Users can insert their own data
create policy "Users can insert their own data" 
  on user_data for insert 
  with check (auth.uid() = user_id);

-- Policy: Users can update their own data
create policy "Users can update their own data" 
  on user_data for update 
  using (auth.uid() = user_id);

-- Policy: Users can delete their own data (optional, but good practice)
create policy "Users can delete their own data" 
  on user_data for delete 
  using (auth.uid() = user_id);
