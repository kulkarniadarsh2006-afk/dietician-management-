import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { verifyWhatsAppWebhookSignature } from "@/integrations/whatsapp/crypto";
import { logger } from "@/lib/logger";

/**
 * WhatsApp Cloud API Webhook Endpoint (Scaffolded Stub)
 *
 * Handles:
 * 1. Meta Webhook Verification Handshake (GET)
 * 2. Inbound event HMAC-SHA256 signature check (POST)
 *
 * Full business message ingestion is scheduled for subsequent prompts.
 */

/**
 * GET: Meta Webhook Setup Verification Challenge
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    logger.info(
      "WhatsApp webhook subscription verified successfully",
      undefined,
      "WhatsAppWebhook"
    );
    return new NextResponse(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  logger.warn(
    "WhatsApp webhook verification failed: token mismatch",
    undefined,
    "WhatsAppWebhook"
  );
  return new NextResponse("Forbidden: verification token mismatch", { status: 403 });
}

/**
 * POST: Inbound Webhook Event Handler (Scaffolded Stub)
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();

  // Validate HMAC signature if app secret is configured
  const isValid = verifyWhatsAppWebhookSignature(rawBody, signature);

  if (!isValid && process.env.NODE_ENV === "production") {
    logger.warn(
      "WhatsApp webhook rejected: invalid HMAC signature",
      undefined,
      "WhatsAppWebhook"
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Acknowledge Meta immediately within 3-second SLA
  // Note: Full payload parsing & message deduplication (wamid) belong to later prompts
  return NextResponse.json(
    {
      status: "acknowledged",
      message:
        "Webhook received. Scaffolding stub active; event ingestion deferred to later phase.",
    },
    { status: 200 }
  );
}
