import "server-only";

import { google } from "googleapis";
import { getGoogleConfig } from "./config";
import { IntegrationError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";
import type { AppendRowOptions, AppendRowResult } from "./types";

/**
 * Official Google APIs Typed Client Wrapper
 * Handles JWT authentication for Google Forms and Google Sheets via service account.
 *
 * Current Status: scaffolded, not configured or tested
 */
export class GoogleClientWrapper {
  private getAuth() {
    const { config, isConfigured } = getGoogleConfig();

    if (!isConfigured || !config) {
      throw new IntegrationError(
        "Google APIs",
        "Integration is scaffolded, but not configured with real service account credentials."
      );
    }

    // Restore escaped newlines in private key
    const privateKey = config.privateKey.replace(/\\n/g, "\n");

    return new google.auth.JWT({
      email: config.clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/forms.body.readonly",
        "https://www.googleapis.com/auth/forms.responses.readonly",
      ],
    });
  }

  /**
   * Appends intake or assessment rows to a designated Google Sheet.
   */
  async appendSheetRows(options: AppendRowOptions): Promise<AppendRowResult> {
    try {
      const auth = this.getAuth();
      const sheets = google.sheets({ version: "v4", auth });

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: options.spreadsheetId,
        range: options.range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: options.values,
        },
      });

      return {
        updatedRange: response.data.updates?.updatedRange ?? options.range,
        updatedRows: response.data.updates?.updatedRows ?? options.values.length,
      };
    } catch (error) {
      logger.error(
        "Failed to append row to Google Sheets",
        error,
        undefined,
        "GoogleClient"
      );
      throw new IntegrationError(
        "Google Sheets",
        error instanceof Error ? error.message : "Failed to append row",
        error
      );
    }
  }

  /**
   * Retrieves Google Form metadata and questions.
   */
  async getFormMetadata(formId: string) {
    try {
      const auth = this.getAuth();
      const forms = google.forms({ version: "v1", auth });

      const response = await forms.forms.get({ formId });
      return response.data;
    } catch (error) {
      logger.error(
        "Failed to fetch Google Form metadata",
        error,
        { formId },
        "GoogleClient"
      );
      throw new IntegrationError(
        "Google Forms",
        error instanceof Error ? error.message : "Failed to fetch form",
        error
      );
    }
  }

  /**
   * Inspection helper reporting configuration status without disclosing private keys.
   */
  getStatus() {
    return getGoogleConfig().status;
  }
}

export const googleClient = new GoogleClientWrapper();
