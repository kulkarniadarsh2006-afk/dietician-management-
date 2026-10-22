/**
 * Safe logger for healthcare and clinical systems.
 * Enforces zero-PHI logging rules by redacting sensitive keys and identifiers.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  context?: string;
  meta?: Record<string, unknown>;
  error?: unknown;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "phone",
  "phonenumber",
  "email",
  "diagnosis",
  "clinicalnotes",
  "notes",
  "dietplan",
  "medicalhistory",
  "allergies",
  "ssn",
  "dob",
  "birthdate",
]);

/**
 * Recursively redacts sensitive keys from metadata objects.
 */
function sanitizeMetadata(obj: unknown, depth = 0): unknown {
  if (depth > 5) return "[Max Depth]";
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeMetadata(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED_PHI_OR_SECRET]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeMetadata(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatError(error: unknown): Record<string, unknown> | undefined {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Only include stack in non-production
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    };
  }
  return { raw: String(error) };
}

function output(level: LogLevel, payload: LogPayload): void {
  const isProduction = process.env.NODE_ENV === "production";
  const timestamp = new Date().toISOString();
  const sanitizedMeta = payload.meta ? sanitizeMetadata(payload.meta) : undefined;
  const formattedError = formatError(payload.error);

  const entry = {
    timestamp,
    level,
    context: payload.context ?? "App",
    message: payload.message,
    ...(sanitizedMeta ? { meta: sanitizedMeta } : {}),
    ...(formattedError ? { error: formattedError } : {}),
  };

  if (isProduction) {
    // JSON line for log collectors (Datadog, CloudWatch, etc.)
    const json = JSON.stringify(entry);
    if (level === "error") {
      console.error(json);
    } else if (level === "warn") {
      console.warn(json);
    } else {
      // eslint-disable-next-line no-console
      console.log(json);
    }
  } else {
    // Pretty print for local developer readability
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${entry.context}]`;
    const details = [
      entry.message,
      sanitizedMeta ? JSON.stringify(sanitizedMeta, null, 2) : "",
      formattedError?.stack || formattedError?.message || "",
    ]
      .filter(Boolean)
      .join(" ");

    if (level === "error") {
      console.error(prefix, details);
    } else if (level === "warn") {
      console.warn(prefix, details);
    } else {
      // eslint-disable-next-line no-console
      console.log(prefix, details);
    }
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>, context?: string) =>
    output("debug", { message, meta, context }),
  info: (message: string, meta?: Record<string, unknown>, context?: string) =>
    output("info", { message, meta, context }),
  warn: (message: string, meta?: Record<string, unknown>, context?: string) =>
    output("warn", { message, meta, context }),
  error: (
    message: string,
    error?: unknown,
    meta?: Record<string, unknown>,
    context?: string
  ) => output("error", { message, error, meta, context }),
};
