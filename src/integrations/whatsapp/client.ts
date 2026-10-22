import "server-only";

import { getWhatsAppConfig } from "./config";
import { IntegrationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";
import type {
  WhatsAppTextMessagePayload,
  WhatsAppTemplateMessagePayload,
  WhatsAppSendMessageResponse,
} from "./types";

const META_GRAPH_API_VERSION = "v20.0";
const META_GRAPH_API_BASE = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;

/**
 * Official Meta WhatsApp Business Platform Cloud API Client Wrapper
 * Implements typed message dispatch via direct official Meta Cloud endpoints.
 *
 * Current Status: scaffolded, not configured or tested
 */
export class WhatsAppCloudApiClient {
  private getEndpointAndHeaders() {
    const { config, isConfigured } = getWhatsAppConfig();

    if (!isConfigured || !config) {
      throw new IntegrationError(
        "WhatsApp Cloud API",
        "Integration is scaffolded, but not configured with real Meta credentials."
      );
    }

    const endpoint = `${META_GRAPH_API_BASE}/${config.phoneNumberId}/messages`;
    const headers = {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    };

    return { endpoint, headers };
  }

  /**
   * Sends a plain text message to a patient.
   */
  async sendTextMessage(
    recipientPhoneNumber: string,
    text: string
  ): Promise<WhatsAppSendMessageResponse> {
    const { endpoint, headers } = this.getEndpointAndHeaders();

    const payload: WhatsAppTextMessagePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhoneNumber,
      type: "text",
      text: {
        body: text,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Meta API error (${response.status}): ${errorBody}`);
      }

      const data: WhatsAppSendMessageResponse = await response.json();
      return data;
    } catch (error) {
      logger.error(
        "Failed to send WhatsApp text message",
        error,
        undefined,
        "WhatsAppClient"
      );
      throw new IntegrationError(
        "WhatsApp Cloud API",
        error instanceof Error ? error.message : "Message dispatch failed",
        error
      );
    }
  }

  /**
   * Sends an approved Meta message template (e.g., appointment reminder).
   */
  async sendTemplateMessage(
    payload: WhatsAppTemplateMessagePayload
  ): Promise<WhatsAppSendMessageResponse> {
    const { endpoint, headers } = this.getEndpointAndHeaders();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Meta API template error (${response.status}): ${errorBody}`);
      }

      const data: WhatsAppSendMessageResponse = await response.json();
      return data;
    } catch (error) {
      logger.error(
        "Failed to send WhatsApp template message",
        error,
        undefined,
        "WhatsAppClient"
      );
      throw new IntegrationError(
        "WhatsApp Cloud API",
        error instanceof Error ? error.message : "Template dispatch failed",
        error
      );
    }
  }

  /**
   * Inspection helper reporting configuration status.
   */
  getStatus() {
    return getWhatsAppConfig().status;
  }
}

export const whatsappClient = new WhatsAppCloudApiClient();
