import "server-only";

import { randomUUID } from "node:crypto";
import { createServerClientInstance } from "@/db/supabase/server";
import { validatePdfBuffer } from "@/lib/utils/pdf-validation";
import type { Database } from "@/types/database";

export type DietPlanRow = Database["public"]["Tables"]["diet_plans"]["Row"];
export type DietPlanInsert = Database["public"]["Tables"]["diet_plans"]["Insert"];

export const DIET_PLANS_BUCKET = "diet-plans";
export const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 900; // 15 minutes

/**
 * Repository providing typed database and private storage operations for Diet Plans.
 */
export class DietPlanRepository {
  /**
   * Retrieves all diet plan revisions for a specific client ordered by version desc.
   */
  async listByClientId(clientId: string): Promise<DietPlanRow[]> {
    const supabase = await createServerClientInstance();
    const { data, error } = await supabase
      .from("diet_plans")
      .select("*")
      .eq("client_id", clientId)
      .order("version", { ascending: false });

    if (error) {
      throw new Error(
        `Failed to list diet plans for client ${clientId}: ${error.message}`
      );
    }

    return data ?? [];
  }

  /**
   * Finds a single diet plan by UUID.
   */
  async findById(id: string): Promise<DietPlanRow | null> {
    const supabase = await createServerClientInstance();
    const { data, error } = await supabase
      .from("diet_plans")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch diet plan ${id}: ${error.message}`);
    }

    return data;
  }

  /**
   * Assigns the next sequential version for a client using advisory locking RPC.
   */
  async getNextVersion(clientId: string): Promise<number> {
    const supabase = await createServerClientInstance();
    const { data, error } = await supabase.rpc("get_next_diet_plan_version", {
      p_client_id: clientId,
    });

    if (error) {
      throw new Error(`Failed to assign next diet plan version: ${error.message}`);
    }

    return data ?? 1;
  }

  /**
   * Validates, stores in private bucket, and records a new Diet Plan revision.
   *
   * @param params PDF payload, client ID, and clinical plan parameters
   */
  async createDietPlan(params: {
    clientId: string;
    originalFilename: string;
    fileBuffer: Buffer | Uint8Array;
    title?: string;
    calorieTarget?: number | null;
    macroRatio?: Record<string, unknown>;
    uploadedBy?: string | null;
  }): Promise<DietPlanRow> {
    // 1. Validate PDF buffer magic bytes (%PDF-), size limit (15MB), and structure
    const validation = validatePdfBuffer(params.fileBuffer, "application/pdf");
    if (!validation.isValid) {
      throw new Error(`Invalid PDF upload: ${validation.error}`);
    }

    const supabase = await createServerClientInstance();

    // 2. Obtain race-free sequential version number for this client
    const nextVersion = await this.getNextVersion(params.clientId);

    // 3. Generate canonical storage path: clients/{client_uuid}/{diet_plan_uuid}.pdf
    const dietPlanId = randomUUID();
    const storagePath = `clients/${params.clientId}/${dietPlanId}.pdf`;

    // 4. Upload binary to private Supabase Storage bucket ('diet-plans')
    const { error: uploadError } = await supabase.storage
      .from(DIET_PLANS_BUCKET)
      .upload(storagePath, params.fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `Failed to store PDF plan in private storage: ${uploadError.message}`
      );
    }

    // 5. Insert diet_plans database record
    const insertPayload: DietPlanInsert = {
      id: dietPlanId,
      client_id: params.clientId,
      storage_path: storagePath,
      original_filename: params.originalFilename.trim(),
      mime_type: "application/pdf",
      file_size_bytes: validation.fileSizeBytes,
      version: nextVersion,
      title: params.title?.trim() || `Clinical Nutrition Plan (v${nextVersion})`,
      calorie_target: params.calorieTarget || null,
      macro_ratio: params.macroRatio || {},
      uploaded_by: params.uploadedBy || null,
    };

    const { data, error: dbError } = await supabase
      .from("diet_plans")
      .insert(insertPayload)
      .select()
      .single();

    if (dbError) {
      // Clean up orphaned storage object if database insert fails
      await supabase.storage.from(DIET_PLANS_BUCKET).remove([storagePath]);
      throw new Error(`Failed to record diet plan in database: ${dbError.message}`);
    }

    return data;
  }

  /**
   * Generates a short-lived authenticated signed URL for private file access.
   *
   * SECURITY RULE:
   * The generated signed URL must NEVER be logged or persisted in database tables.
   */
  async createSignedUrl(
    storagePath: string,
    expiresInSeconds: number = DEFAULT_SIGNED_URL_EXPIRY_SECONDS
  ): Promise<string> {
    const supabase = await createServerClientInstance();

    const { data, error } = await supabase.storage
      .from(DIET_PLANS_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(
        `Failed to generate time-limited signed URL: ${error?.message || "Unknown error"}`
      );
    }

    return data.signedUrl;
  }

  /**
   * Deletes a diet plan record and its underlying private storage object.
   * Admin-only operation enforced by RLS.
   */
  async delete(id: string): Promise<void> {
    const supabase = await createServerClientInstance();

    // Fetch storage path before deletion
    const plan = await this.findById(id);
    if (!plan) return;

    // Remove from database (RLS ensures only admin succeeds)
    const { error: dbError } = await supabase.from("diet_plans").delete().eq("id", id);

    if (dbError) {
      throw new Error(`Failed to delete diet plan ${id}: ${dbError.message}`);
    }

    // Remove file from private storage
    await supabase.storage.from(DIET_PLANS_BUCKET).remove([plan.storage_path]);
  }
}
