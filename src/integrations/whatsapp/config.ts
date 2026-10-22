import { z } from "zod";
import { env } from "@/config/env";

export const whatsappConfigSchema = z.object({
  phoneNumberId: z.string().min(5, "WhatsApp Phone Number ID is required"),
  businessAccountId: z.string().min(5, "WhatsApp Business Account ID is required"),
  accessToken: z.string().min(20, "WhatsApp Access Token is required"),
  webhookVerifyToken: z.string().min(8, "WhatsApp Webhook Verify Token is required"),
  appSecret: z.string().min(10, "WhatsApp App Secret is required"),
});

export type WhatsAppConfig = z.infer<typeof whatsappConfigSchema>;

export function getWhatsAppConfig(): {
  config: WhatsAppConfig | null;
  isConfigured: boolean;
  status: "scaffolded, not configured or tested" | "configured";
} {
  const raw = {
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    accessToken: env.WHATSAPP_ACCESS_TOKEN,
    webhookVerifyToken: env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    appSecret: env.WHATSAPP_APP_SECRET,
  };

  const parsed = whatsappConfigSchema.safeParse(raw);
  if (!parsed.success || !raw.accessToken || raw.accessToken.includes("placeholder")) {
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
