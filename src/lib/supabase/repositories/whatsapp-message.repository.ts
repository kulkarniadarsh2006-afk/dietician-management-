import "server-only";

import { createServerClientInstance } from "@/db/supabase/server";
import { createAdminClient } from "@/db/supabase/admin";
import { normalizePhoneToE164 } from "@/lib/utils/phone";
import type { Database, MessageStatus } from "@/types/database";

export type WhatsAppMessageRow = Database["public"]["Tables"]["whatsapp_messages"]["Row"];
export type WhatsAppMessageInsert =
  Database["public"]["Tables"]["whatsapp_messages"]["Insert"];

export interface ListMessagesFilter {
  page?: number;
  pageSize?: number;
  clientId?: string;
  status?: MessageStatus;
}

export interface PaginatedMessagesResult {
  data: WhatsAppMessageRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Repository providing typed database access for WhatsApp message auditing,
 * dispatch queueing, and webhook status progression.
 */
export class WhatsAppMessageRepository {
  /**
   * Retrieves messages with pagination and filtering for audit views.
   * Runs in authenticated staff context subject to RLS SELECT policy.
   */
  async list(filters: ListMessagesFilter = {}): Promise<PaginatedMessagesResult> {
    const supabase = await createServerClientInstance();
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 10));
    const offset = (page - 1) * pageSize;

    let query = supabase.from("whatsapp_messages").select("*", { count: "exact" });

    if (filters.clientId) {
      query = query.eq("client_id", filters.clientId);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Failed to list WhatsApp messages: ${error.message}`);
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

  /**
   * Finds a message record by primary UUID.
   */
  async findById(id: string): Promise<WhatsAppMessageRow | null> {
    const supabase = await createServerClientInstance();
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch message ${id}: ${error.message}`);
    }

    return data;
  }

  /**
   * Finds a message record by its unique idempotency key.
   */
  async findByIdempotencyKey(key: string): Promise<WhatsAppMessageRow | null> {
    const supabase = await createServerClientInstance();
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("idempotency_key", key.trim())
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch message by key ${key}: ${error.message}`);
    }

    return data;
  }

  /**
   * Queues an outbound WhatsApp notification with a mandatory unique idempotency key.
   *
   * SECURITY & CONSENT RULES:
   * - Client consent is verified at the database trigger level before insert.
   * - Only one in-flight message may exist per client + diet plan.
   * - Insert is performed server-side via service role client (as enforced by RLS).
   */
  async queueMessage(params: {
    clientId: string;
    dietPlanId?: string | null;
    destinationPhone: string;
    idempotencyKey: string;
    createdBy?: string | null;
  }): Promise<WhatsAppMessageRow> {
    // 1. Normalize destination phone to strict E.164
    const destinationE164 = normalizePhoneToE164(params.destinationPhone);

    // 2. Perform insert via server-only elevated admin client (bypasses RLS insert block)
    const adminClient = createAdminClient();

    const insertPayload: WhatsAppMessageInsert = {
      client_id: params.clientId,
      diet_plan_id: params.dietPlanId || null,
      destination_e164: destinationE164,
      idempotency_key: params.idempotencyKey.trim(),
      status: "queued",
      attempt_count: 0,
      created_by: params.createdBy || null,
    };

    const { data, error } = await adminClient
      .from("whatsapp_messages")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique violation (either duplicate idempotency key or in-flight dispatch)
        throw new Error(
          `Idempotency or In-Flight Conflict: A message with key "${params.idempotencyKey}" or an in-flight dispatch for this plan already exists.`
        );
      }
      throw new Error(`Failed to queue WhatsApp message: ${error.message}`);
    }

    return data;
  }

  /**
   * Updates message delivery lifecycle status (e.g. from Webhook callback).
   * Enforces forward-only transitions through database state machine trigger.
   */
  async updateStatus(
    id: string,
    newStatus: MessageStatus,
    metadata?: {
      providerMessageId?: string | null;
      errorCode?: string | null;
      errorMessage?: string | null;
      incrementAttempt?: boolean;
    }
  ): Promise<WhatsAppMessageRow> {
    const adminClient = createAdminClient();

    const updates: Partial<WhatsAppMessageRow> = {
      status: newStatus,
    };

    if (metadata?.providerMessageId) {
      updates.provider_message_id = metadata.providerMessageId;
    }
    if (metadata?.errorCode !== undefined) {
      updates.error_code = metadata.errorCode;
    }
    if (metadata?.errorMessage !== undefined) {
      // Sanitize and limit error message length
      updates.error_message = metadata.errorMessage
        ? metadata.errorMessage.substring(0, 500)
        : null;
    }

    const { data, error } = await adminClient
      .from("whatsapp_messages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to update message status to ${newStatus}: ${error.message}`
      );
    }

    return data;
  }

  /**
   * Creates a retry message for a previously failed message.
   *
   * RETRY DESIGN DECISION:
   * A failed message produces a NEW row with retry_of set to the previous message ID
   * and a new unique idempotency key. This preserves an immutable audit trail of each
   * discrete dispatch attempt.
   */
  async createRetry(
    originalMessageId: string,
    newIdempotencyKey: string,
    createdBy?: string | null
  ): Promise<WhatsAppMessageRow> {
    const adminClient = createAdminClient();

    // 1. Fetch original message
    const original = await this.findById(originalMessageId);
    if (!original) {
      throw new Error(`Original message ${originalMessageId} not found.`);
    }

    if (original.status !== "failed") {
      throw new Error(
        `Cannot retry message ${originalMessageId}: only messages in 'failed' status can be retried (current: ${original.status}).`
      );
    }

    // 2. Insert new attempt linked via retry_of
    const retryPayload: WhatsAppMessageInsert = {
      client_id: original.client_id,
      diet_plan_id: original.diet_plan_id,
      destination_e164: original.destination_e164,
      idempotency_key: newIdempotencyKey.trim(),
      status: "queued",
      attempt_count: original.attempt_count + 1,
      retry_of: original.id,
      created_by: createdBy || original.created_by,
    };

    const { data, error } = await adminClient
      .from("whatsapp_messages")
      .insert(retryPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create retry message: ${error.message}`);
    }

    return data;
  }
}
