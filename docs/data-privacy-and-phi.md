# Data Privacy & Health Information Management Protocol

## 1. Compliance Standard & Scope

The Dietitian Management System manages sensitive health data, including nutritional history, biometric metrics (weight, body fat %, blood glucose, lipid panels), clinical diagnoses, medication regimens, and patient communication history. This data is classified as Protected Health Information (PHI).

All contributors, engineers, and maintainers must adhere to the following principles.

---

## 2. Core Privacy Principles

### A. Minimum Necessary Standard

Every query, data access method, and user interface must only request and expose the minimum data fields necessary to perform the clinical or operational task.

### B. Zero-PHI Logging Enforcement

Logs are frequently sent to monitoring systems (Datadog, CloudWatch, Sentry, Axiom) where PHI must **NEVER** persist.

1. **Never Log Identifiable Health Data**:
   - Diagnoses, allergies, food intolerances, weights, lab metrics, meal plans.
2. **Never Log Direct Identifiers**:
   - Full names, phone numbers, email addresses, national IDs, physical addresses.
   - Use opaque UUIDs or hashed tokens (e.g., `patientId: "usr_94b1c2..."`) instead.
3. **Never Log Raw Request/Response Bodies**:
   - Form submission payloads, WhatsApp incoming message texts, Google Sheets rows.
4. **Structured Redaction**:
   - The centralized logger (`src/lib/logger/index.ts`) enforces automated key masking for fields such as `password`, `token`, `secret`, `authorization`, `email`, `phone`, `medical`, and `notes`.

---

## 3. Data Protection in Transit & at Rest

1. **In Transit**:
   - TLS 1.3 enforced on all endpoints.
   - Strict Transport Security (HSTS) configured with long max-age and preload.
   - Meta WhatsApp Cloud API webhooks verified with HMAC SHA-256 signatures before processing.
2. **At Rest**:
   - PostgreSQL table-space encryption via Supabase (AES-256).
   - Encrypted private storage buckets for clinical lab reports and patient intake attachments.
   - Environment variables and API keys secured in memory; never written to temporary disk files.

---

## 4. Breach Notification & Incident Handling

In the event of suspected unauthorized disclosure or abnormal data retrieval volumes:

1. Revoke active JWT tokens and invalidate session keys immediately.
2. Rotate API keys (`SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, `GOOGLE_PRIVATE_KEY`).
3. Audit the database access log for the affected tenant / patient IDs.
