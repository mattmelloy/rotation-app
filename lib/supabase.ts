// Database client configuration
// This module provides auth and data helper functions
// that wrap the API client for backward compatibility.

import { getToken, isAuthenticated } from './api';

// --- CONFIGURATION ---
// The app now uses Neon DB via API routes instead of direct Supabase client.
// Auth is handled via JWT tokens stored in localStorage.
// Database access goes through /api/data routes.

export const isSupabaseConfigured = () => {
    // Always true — configuration is handled server-side via DATABASE_URL
    return true;
};

export const isHardcoded = () => {
    // Always true — the connection is configured via environment variables on the server
    return true;
};

// Placeholder for backward compatibility — the supabase object is no longer used directly
// All code should migrate to using lib/api.ts functions instead
export const supabase = null;
