import { z } from "zod";
import { env } from "@/config/env";

export const googleConfigSchema = z.object({
  clientEmail: z.string().email("Invalid Google Service Account Email"),
  privateKey: z.string().min(20, "Google Service Account Private Key is required"),
  formsFolderId: z.string().optional(),
  spreadsheetId: z.string().optional(),
});

export type GoogleConfig = z.infer<typeof googleConfigSchema>;

export function getGoogleConfig(): {
  config: GoogleConfig | null;
  isConfigured: boolean;
  status: "scaffolded, not configured or tested" | "configured";
} {
  const raw = {
    clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: env.GOOGLE_PRIVATE_KEY,
    formsFolderId: env.GOOGLE_FORMS_FOLDER_ID,
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
  };

  const parsed = googleConfigSchema.safeParse(raw);
  if (!parsed.success || !raw.privateKey || raw.privateKey.includes("placeholder")) {
    return {
      config: null,
      isConfigured: false,
      status: "scaffolded, not configured or tested",
    };
  }

  return {
    config: parsed.data,
    isConfigured: true,
    status: "configured",
  };
}
