import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Creates a browser-side Supabase client using public credentials.
 * Requests made from this client are strictly subject to Row Level Security (RLS).
 */
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) as unknown as SupabaseClient<Database>;
}
