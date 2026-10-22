import "server-only";

import { createServerClientInstance } from "@/db/supabase/server";
import { createAdminClient } from "@/db/supabase/admin";
import type { Database } from "@/types/database";

export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

/**
 * List of sensitive keys prohibited in audit log metadata to protect PHI and credentials.
 */
const PROHIBITED_METADATA_KEYS = new Set([
  "name",
  "full_name",
  "phone",
  "phone_e164",
  "email",
  "intake",
  "intake_responses",
  "signed_url",
  "url",
  "token",
  "access_token",
  "secret",
  "password",
  "file_contents",
  "content",
  "medical_conditions",
]);

/**
 * Sanitizes an object by stripping any sensitive health information or credential keys.
 */
export function sanitizeAuditMetadata(
  rawMetadata: Record<string, unknown> = {}
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawMetadata)) {
    const normalizedKey = key.toLowerCase().trim();
    if (PROHIBITED_METADATA_KEYS.has(normalizedKey)) {
      continue; // Omit prohibited sensitive key
    }

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Repository providing typed database access for system and clinical audit trails.
 */
export class AuditLogRepository {
  /**
   * Appends an immutable audit event.
   * Uses service-role client (as authenticated user INSERT is disabled by default deny).
   * Also verified by DB trigger to block any sensitive keys.
   */
  async log(event: {
    actorId?: string | null;
    action: string;
    targetTable: string;
    targetId: string;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLogRow> {
    const adminClient = createAdminClient();

    // Sanitize metadata application-side before sending to DB
    const sanitizedMetadata = sanitizeAuditMetadata(event.metadata ?? {});

    const insertPayload: AuditLogInsert = {
      actor_id: event.actorId ?? null,
      action: event.action.trim(),
      target_table: event.targetTable.trim(),
      target_id: event.targetId,
      metadata: sanitizedMetadata,
    };

    const { data, error } = await adminClient
      .from("audit_logs")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to append audit log: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves audit logs with optional target entity filtering.
   * Runs in authenticated administrator context (subject to RLS policy).
   */
  async list(
    filters: {
      page?: number;
      pageSize?: number;
      targetTable?: string;
      targetId?: string;
    } = {}
  ): Promise<{
    data: AuditLogRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const supabase = await createServerClientInstance();
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const offset = (page - 1) * pageSize;

    let query = supabase.from("audit_logs").select("*", { count: "exact" });

    if (filters.targetTable) {
      query = query.eq("target_table", filters.targetTable);
    }
    if (filters.targetId) {
      query = query.eq("target_id", filters.targetId);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Failed to list audit logs: ${error.message}`);
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: data ?? [],
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
