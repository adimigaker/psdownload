import { createClient, SupabaseClient } from "@supabase/supabase-js";

function createBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
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
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createBrowserClient();