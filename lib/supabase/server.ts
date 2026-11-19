import { createClient, SupabaseClient } from "@supabase/supabase-js";

function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    // Return a mock client that throws helpful errors
    const mockFrom = () => ({
      select: () => Promise.resolve({ data: null, error: { message: "Supabase not configured - missing env vars" } }),
      insert: () => Promise.resolve({ data: null, error: { message: "Supabase not configured - missing env vars" } }),
      update: () => Promise.resolve({ data: null, error: { message: "Supabase not configured - missing env vars" } }),
      delete: () => Promise.resolve({ data: null, error: { message: "Supabase not configured - missing env vars" } }),
      eq: () => ({ select: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }),
      order: () => ({ range: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }) }),
      range: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
    });
    
    return {
      from: mockFrom,
    } as unknown as SupabaseClient;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const supabaseAdmin = createAdminClient();