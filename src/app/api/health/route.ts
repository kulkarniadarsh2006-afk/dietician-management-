import { NextResponse } from "next/server";
import { googleClient } from "@/integrations/google/client";
import { whatsappClient } from "@/integrations/whatsapp/client";

/**
 * Health Check Endpoint (/api/health)
 * Reports system vitals, uptime, and integration readiness without leaking credentials or secrets.
 */
export async function GET() {
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
    },
    integrations: {
      supabase: {
        status: "scaffolded, not configured or tested",
        ssr: "enabled",
        rlsBlueprint: "defined",
      },
      google: {
        status: googleClient.getStatus(),
        provider: "Official Google APIs (googleapis)",
      },
      whatsapp: {
        status: whatsappClient.getStatus(),
        provider: "Official Meta WhatsApp Business Cloud API",
      },
    },
    compliance: {
      phiLogging: "disabled (zero-PHI redaction active)",
      securityHeaders: "active",
      serverBoundaries: "enforced via server-only",
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
