
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fbmxelhrflcemjertsip.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibXhlbGhyZmxjZW1qZXJ0c2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzY3NTksImV4cCI6MjA2MjIxMjc1OX0.nPTxoY1YTIltUgJj1PhXnz1TUFR9PC3m971_tXxJEYQ";

// Configure with proper auth settings to avoid common issues
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Important for handling redirect URLs
    flowType: 'pkce' // More secure flow for authentication
  }
});

// Add a global error handler for auth errors
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any remaining auth state
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  }
});

