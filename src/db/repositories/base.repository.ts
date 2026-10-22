import "server-only";

import { createServerClientInstance } from "../supabase/server";
import { NotFoundError, AppError } from "@/lib/errors/app-error";

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Abstract Base Repository enforcing structured database access.
 * Components and route handlers consume repository methods instead of writing raw queries.
 */
export abstract class BaseRepository<T extends { id: string }> {
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Retrieves an authenticated server client scoped to the current user's session.
   */
  protected async getClient() {
    return await createServerClientInstance();
  }

  /**
   * Finds a record by its UUID identifier.
   */
  async findById(id: string): Promise<T | null> {
    const client = await this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new AppError(
        `Failed to fetch ${this.tableName} by id: ${error.message}`,
        500,
        true,
        error
      );
    }

    return (data as T) || null;
  }

  /**
   * Finds a record by ID or throws a standardized NotFoundError.
   */
  async findByIdOrThrow(id: string): Promise<T> {
    const record = await this.findById(id);
    if (!record) {
      throw new NotFoundError(this.tableName);
    }
    return record;
  }

  /**
   * Lists records with pagination.
   */
  async list(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const client = await this.getClient();
    const { data, error, count } = await client
      .from(this.tableName)
      .select("*", { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(
        `Failed to list ${this.tableName}: ${error.message}`,
        500,
        true,
        error
      );
    }

    return {
      data: (data as T[]) || [],
      total: count ?? 0,
      page,
      pageSize,
    };
  }
}
