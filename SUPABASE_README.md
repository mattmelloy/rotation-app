# Supabase Setup Required

The app is reporting errors accessing the database (`user_data` table). This is likely because the database schema has not been applied yet.

To fix the `Failed to load resource: the server responded with a status of 400` errors:

1.  Open your **Supabase Dashboard** for this project.
2.  Go to the **SQL Editor** in the sidebar.
3.  Click **New Query**.
4.  Copy the entire contents of the file `supabase_schema.sql` from this project.
5.  Paste it into the SQL Editor.
6.  Click **Run**.

This will create the `user_data` table and set up the necessary Row Level Security (RLS) policies. Once done, reload the application.
