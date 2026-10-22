import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Creates an elevated administrative Supabase client using the Service Role Key.
 *
 * CRITICAL SECURITY WARNING:
 * This client BYPASSES all Row Level Security (RLS) policies.
 * It must NEVER be called inside user-facing components or client-facing operations.
 * Use exclusively for scheduled background jobs, webhooks, and administrative maintenance.
 */
export function createAdminClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
