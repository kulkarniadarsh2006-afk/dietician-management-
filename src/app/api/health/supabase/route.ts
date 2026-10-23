import { NextResponse } from "next/server";
import { createServerClientInstance } from "@/db/supabase/server";
import { env } from "@/config/env";

export const dynamic = "force-dynamic";

/**
 * Server-Side Supabase Health Check (/api/health/supabase)
 * Performs a real PostgREST query against the database and returns the actual live result or error.
 * Strictly no mock responses, synthetic delays, or fabricated statuses.
 */
export async function GET() {
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();

  // 1. Verify URL configuration
  const isUnconfigured =
    !env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  if (isUnconfigured) {
    return NextResponse.json(
      {
        status: "unconfigured",
        connected: false,
        latencyMs: 0,
        message:
          "Supabase credentials are not yet configured. Provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local or Vercel.",
        checkedAt,
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  try {
    const supabase = await createServerClientInstance();

    // 2. Perform a real lightweight database query (HEAD count query against clients table)
    const { count, error } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true });

    const latencyMs = Date.now() - startedAt;

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          connected: false,
          latencyMs,
          error: {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details,
          },
          checkedAt,
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    return NextResponse.json(
      {
        status: "healthy",
        connected: true,
        latencyMs,
        database: {
          table: "clients",
          recordCount: count ?? 0,
          accessible: true,
        },
        checkedAt,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err: unknown) {
    const latencyMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : "Unknown connection failure";

    return NextResponse.json(
      {
        status: "fatal",
        connected: false,
        latencyMs,
        error: {
          message,
        },
        checkedAt,
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
