import { z } from "zod";

/**
 * Validated Environment Schema
 * Distinguishes strictly between public (browser) and server-only variables.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL")
    .default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required")
    .default("placeholder-publishable-key"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .default("placeholder-anon-key"),
});

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("3000"),

  // Supabase Service Role (Server-Only)
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required for server operations")
    .default("placeholder-service-role-key"),

  // Google APIs
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z
    .string()
    .email()
    .optional()
    .or(z.literal(""))
    .default("service-account@placeholder.iam.gserviceaccount.com"),
  GOOGLE_PRIVATE_KEY: z.string().optional().or(z.literal("")).default(""),
  GOOGLE_FORMS_FOLDER_ID: z.string().optional().or(z.literal("")).default(""),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().optional().or(z.literal("")).default(""),

  // Meta WhatsApp Cloud API
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().or(z.literal("")).default(""),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional().or(z.literal("")).default(""),
  WHATSAPP_ACCESS_TOKEN: z.string().optional().or(z.literal("")).default(""),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z
    .string()
    .min(8, "WHATSAPP_WEBHOOK_VERIFY_TOKEN must be at least 8 characters")
    .default("placeholder-verify-token"),
  WHATSAPP_APP_SECRET: z.string().optional().or(z.literal("")).default(""),
});

const mergedEnvSchema = clientEnvSchema.merge(serverEnvSchema);

export type Env = z.infer<typeof mergedEnvSchema>;

function validateEnv(): Env {
  const isServer = typeof window === "undefined";
  const pubKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const rawEnv = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: pubKey,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: pubKey,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_FORMS_FOLDER_ID: process.env.GOOGLE_FORMS_FOLDER_ID,
    GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
  };

  const parsed = isServer
    ? mergedEnvSchema.safeParse(rawEnv)
    : clientEnvSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `  - [${issue.path.join(".")}]: ${issue.message}`)
      .join("\n");

    const message = `[FATAL] Invalid environment variables detected:\n${errorDetails}`;

    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    } else {
      console.warn(
        `[WARN] Environment validation issues in non-production mode:\n${errorDetails}`
      );
      // Return safe defaults for build/dev
      return mergedEnvSchema.parse({}) as Env;
    }
  }

  return parsed.data as Env;
}

export const env: Env = validateEnv();
