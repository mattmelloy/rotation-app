import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// Only environment variables are supported in production for security
// Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

// Read from Environment Variables (Vite uses VITE_ prefix)
const ENV_URL = (import.meta as any).env?.VITE_SUPABASE_URL;
const ENV_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables at startup
const isConfigured = !!(ENV_URL && ENV_KEY);

// Initialize Client only if configured, otherwise use null placeholder
// The isSupabaseConfigured() function will return false if not set up
export const supabase = isConfigured 
  ? createClient(ENV_URL, ENV_KEY)
  : null;

export const isSupabaseConfigured = () => {
    return isConfigured;
};

export const isHardcoded = () => {
    // Always false - we only support environment variables now
    return false;
};

// REMOVED: saveSupabaseConfig and clearSupabaseConfig
// Storing credentials in localStorage is a security risk (XSS vulnerability)
// Configure Supabase via environment variables only
    // Returns true if configured via Env Var or Code (not LocalStorage)
