import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Creates a server-side Supabase client for Server Components, Server Actions, and Route Handlers.
 * In Server Components, cookie setting is caught safely since cookies are read-only during render.
 */
export async function createServerClientInstance(): Promise<SupabaseClient<Database>> {
  const cookieStore = cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if middleware is refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // The `remove` method was called from a Server Component.
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database>;
}
