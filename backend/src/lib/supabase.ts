import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Supabase client for server-side use. Uses service role key to bypass RLS. */
export function getSupabase(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createClient(url, serviceRoleKey);
}

export function hasSupabase(): boolean {
  return Boolean(url && serviceRoleKey);
}
