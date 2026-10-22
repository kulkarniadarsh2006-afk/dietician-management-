import "server-only";

import crypto from "crypto";
import { getWhatsAppConfig } from "./config";
import { logger } from "@/lib/logger";

/**
 * Verifies that an incoming webhook payload originated from Meta
 * by verifying the HMAC-SHA256 signature against the configured app secret.
 *
 * Uses constant-time buffer comparison to guard against timing analysis attacks.
 */
export function verifyWhatsAppWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    logger.warn(
      "WhatsApp webhook signature header missing or malformed",
      undefined,
      "WhatsAppCrypto"
    );
    return false;
  }

  const { config, isConfigured } = getWhatsAppConfig();
  if (!isConfigured || !config?.appSecret) {
    logger.warn(
      "WhatsApp webhook signature verification skipped: app secret not configured",
      undefined,
      "WhatsAppCrypto"
    );
    return false;
  }

  const signatureToVerify = signatureHeader.substring(7); // Remove 'sha256='
  const expectedSignature = crypto
    .createHmac("sha256", config.appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    const signatureBuffer = Buffer.from(signatureToVerify, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    logger.error(
      "Failed during timingSafeEqual comparison",
      error,
      undefined,
      "WhatsAppCrypto"
    );
    return false;
  }
}
