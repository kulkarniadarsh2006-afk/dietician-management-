import "server-only";

import { createServerClientInstance } from "@/db/supabase/server";
import { normalizePhoneToE164 } from "@/lib/utils/phone";
import type { Database, ClientGender, ClientSource } from "@/types/database";

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export interface ListClientsFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  source?: ClientSource;
}

export interface PaginatedClientsResult {
  data: ClientRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Repository providing typed database access for Clients / Patients.
 * Operates in authenticated user context subject to Row Level Security (RLS).
 */
export class ClientRepository {
  /**
   * Retrieves a paginated list of clients with optional search query.
   */
  async list(filters: ListClientsFilter = {}): Promise<PaginatedClientsResult> {
    const supabase = await createServerClientInstance();
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 10));
    const offset = (page - 1) * pageSize;

    let query = supabase.from("clients").select("*", { count: "exact" });

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim();
      // Searches full_name, client_code, and phone
      query = query.or(
        `full_name.ilike.%${q}%,client_code.ilike.%${q}%,phone_e164.ilike.%${q}%`
      );
    }

    if (filters.source) {
      query = query.eq("source", filters.source);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Failed to list clients: ${error.message}`);
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
   * Finds a client by primary UUID.
   */
  async findById(id: string): Promise<ClientRow | null> {
    const supabase = await createServerClientInstance();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch client by id ${id}: ${error.message}`);
    }

    return data;
  }

  /**
   * Finds a client by unique human-readable client_code (e.g., CL-000001).
   */
  async findByCode(clientCode: string): Promise<ClientRow | null> {
    const supabase = await createServerClientInstance();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("client_code", clientCode.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch client by code ${clientCode}: ${error.message}`);
    }

    return data;
  }

  /**
   * Identifies potential duplicate patients by phone or email without merging.
   */
  async findDuplicates(
    phoneE164: string,
    email?: string | null,
    excludeId?: string | null
  ) {
    const supabase = await createServerClientInstance();
    const normalizedPhone = normalizePhoneToE164(phoneE164);

    const { data, error } = await supabase.rpc("find_potential_duplicate_clients", {
      p_phone_e164: normalizedPhone,
      p_email: email ? email.trim() : null,
      p_exclude_id: excludeId ?? null,
    });

    if (error) {
      throw new Error(`Duplicate client detection query failed: ${error.message}`);
    }

    return data ?? [];
  }

  /**
   * Enrolls a new patient/client with normalized E.164 phone and consent verification.
   */
  async create(payload: {
    fullName: string;
    phone: string;
    email?: string | null;
    dateOfBirth?: string | null;
    gender?: ClientGender | null;
    dietaryPreferences?: Record<string, unknown>;
    goals?: Record<string, unknown>;
    intakeResponses?: Record<string, unknown>;
    whatsappConsent: boolean;
    source?: ClientSource;
    externalRef?: string | null;
    createdBy?: string | null;
  }): Promise<ClientRow> {
    const supabase = await createServerClientInstance();

    // 1. Normalize telephone number strictly to E.164
    const phoneE164 = normalizePhoneToE164(payload.phone);

    // 2. Validate WhatsApp consent timestamp consistency
    const consentAt = payload.whatsappConsent ? new Date().toISOString() : null;

    const insertData: ClientInsert = {
      full_name: payload.fullName.trim(),
      phone_e164: phoneE164,
      email: payload.email?.trim() || null,
      date_of_birth: payload.dateOfBirth || null,
      gender: payload.gender || null,
      dietary_preferences: payload.dietaryPreferences || {},
      goals: payload.goals || {},
      intake_responses: payload.intakeResponses || {},
      whatsapp_consent: payload.whatsappConsent,
      whatsapp_consent_at: consentAt,
      source: payload.source || "manual",
      external_ref: payload.externalRef || null,
      created_by: payload.createdBy || null,
    };

    const { data, error } = await supabase
      .from("clients")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client record: ${error.message}`);
    }

    return data;
  }

  /**
   * Updates an existing client record. Immutable client_code is rejected at DB level.
   */
  async update(id: string, updates: Partial<ClientUpdate>): Promise<ClientRow> {
    const supabase = await createServerClientInstance();

    // If phone is being updated, normalize it
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.phone_e164) {
      sanitizedUpdates.phone_e164 = normalizePhoneToE164(sanitizedUpdates.phone_e164);
    }

    // Maintain consent timestamp consistency if consent is explicitly toggled
    if (sanitizedUpdates.whatsapp_consent !== undefined) {
      sanitizedUpdates.whatsapp_consent_at = sanitizedUpdates.whatsapp_consent
        ? new Date().toISOString()
        : null;
    }

    const { data, error } = await supabase
      .from("clients")
      .update(sanitizedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update client ${id}: ${error.message}`);
    }

    return data;
  }

  /**
   * Permanently deletes a client. Requires active administrator role (enforced by RLS).
   */
  async delete(id: string): Promise<void> {
    const supabase = await createServerClientInstance();
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete client ${id}: ${error.message}`);
    }
  }
}
