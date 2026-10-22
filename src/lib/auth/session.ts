import "server-only";

import { createServerClientInstance } from "@/db/supabase/server";
import { AuthenticationError } from "@/lib/errors/app-error";

export interface UserSession {
  id: string;
  email?: string;
  role: "dietitian" | "assistant" | "patient" | "unassigned";
}

/**
 * Retrieves the current authenticated user session on the server.
 */
export async function getSession(): Promise<UserSession | null> {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const role = (user.user_metadata?.role as UserSession["role"]) || "dietitian";

  return {
    id: user.id,
    email: user.email,
    role,
  };
}

/**
 * Asserts that the current request has an authenticated session.
 * Throws AuthenticationError if not logged in.
 */
export async function requireSession(): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    throw new AuthenticationError("User is not authenticated");
  }
  return session;
}
