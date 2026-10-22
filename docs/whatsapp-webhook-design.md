# WhatsApp Webhook Integration & Security Architecture

## 1. Overview

The Dietitian Management System integrates directly with the **official Meta WhatsApp Business Platform Cloud API** (no unofficial libraries). This document outlines the security architecture and verification flow required for receiving inbound webhooks (e.g., patient replies, appointment confirmations, media intake attachments).

---

## 2. Meta Verification Flow (Handshake: HTTP GET)

When registering the webhook endpoint in the Meta App Dashboard (`WhatsApp -> Configuration -> Webhook`), Meta dispatches a `GET` request to verify endpoint ownership.

### Required Query Parameters:

- `hub.mode`: Expected to be the literal string `"subscribe"`.
- `hub.verify_token`: Must match the secret verification string configured in our application environment (`WHATSAPP_WEBHOOK_VERIFY_TOKEN`).
- `hub.challenge`: An arbitrary integer/token string sent by Meta.

### Expected Behavior:

- If `hub.mode === 'subscribe'` and `hub.verify_token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN`, the endpoint must respond with HTTP `200 OK` and the exact value of `hub.challenge` as plain text.
- If tokens do not match, immediately respond with HTTP `403 Forbidden`.

---

## 3. Cryptographic Signature Verification (Inbound Payloads: HTTP POST)

For every inbound event (`messages`, `message_template_status_update`, etc.), Meta includes a cryptographic signature in the request headers:

- Header: `X-Hub-Signature-256`
- Format: `sha256=<hex_encoded_hmac>`

### Verification Algorithm:

1. Extract the raw, unparsed request body string (do NOT use parsed JSON before hashing to avoid whitespace discrepancies).
2. Compute the HMAC using the SHA-256 hash function:
   - **Secret**: The application's `WHATSAPP_APP_SECRET`.
   - **Data**: The raw incoming request payload buffer.
3. Compare the computed signature against the signature in `X-Hub-Signature-256` using constant-time comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
4. If invalid:
   - Log a warning with client IP.
   - Reject the request with HTTP `401 Unauthorized` without processing.
5. If valid:
   - Enqueue the payload for background processing and respond with HTTP `200 OK` immediately (within Meta's 3-second SLA window).

---

## 4. Idempotency & Message Deduplication

Meta's webhook infrastructure guarantees at-least-once delivery; duplicates may occur during network retries.

- Incoming events contain a unique `messages[].id` (WAMID).
- Inbound workers must persist `wamid` in an idempotent cache or database unique constraint table before executing business actions.
- Any message carrying a previously processed `wamid` is acknowledged with HTTP 200 and discarded.
