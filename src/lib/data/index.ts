import {
  MOCK_CLIENTS,
  MOCK_DIET_PLANS,
  MOCK_MESSAGES,
  MOCK_DASHBOARD_STATS,
  MOCK_INTEGRATIONS,
  MOCK_STAFF_PROFILE,
  MOCK_APP_PREFERENCES,
} from "../mock/data";
import type {
  Client,
  DietPlan,
  WhatsAppMessage,
  DashboardStats,
  IntegrationCardItem,
  StaffProfile,
  AppPreferences,
  PaginatedResult,
  ClientFilters,
  WhatsAppFilters,
  PaginationParams,
} from "@/types";

/**
 * Data Access Layer (DAL)
 *
 * All UI components interact EXCLUSIVELY with this layer.
 * When real database endpoints or Supabase tables are wired in later phases,
 * only this file needs to be updated; UI components remain untouched.
 */

// In-memory working copies for client session modifications (e.g. Add Client dialog)
const clientsStore: Client[] = [...MOCK_CLIENTS];
const messagesStore: WhatsAppMessage[] = [...MOCK_MESSAGES];
const dietPlansStore: DietPlan[] = [...MOCK_DIET_PLANS];

/**
 * Retrieves dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Simulates async access
  return Promise.resolve({ ...MOCK_DASHBOARD_STATS });
}

/**
 * Retrieves paginated clients with optional search and filter criteria
 */
export async function getClients(
  filters: ClientFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<PaginatedResult<Client>> {
  let filtered = [...clientsStore];

  // Search by name, phone, or client ID
  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }

  // Filter by diet plan status
  if (filters.dietPlanStatus && filters.dietPlanStatus !== "all") {
    filtered = filtered.filter((c) => c.dietPlanStatus === filters.dietPlanStatus);
  }

  // Filter by last message status
  if (filters.messageStatus && filters.messageStatus !== "all") {
    filtered = filtered.filter((c) => c.lastMessageStatus === filters.messageStatus);
  }

  const total = filtered.length;
  const page = Math.max(1, pagination.page);
  const pageSize = Math.max(1, pagination.pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return Promise.resolve({
    data,
    total,
    page,
    pageSize,
    totalPages,
  });
}

/**
 * Retrieves a single client by ID (returns null if not found)
 */
export async function getClientById(id: string): Promise<Client | null> {
  const client = clientsStore.find((c) => c.id === id);
  return Promise.resolve(client ? { ...client } : null);
}

/**
 * Retrieves recent client registrations for dashboard overview
 */
export async function getRecentClients(limit: number = 5): Promise<Client[]> {
  const sorted = [...clientsStore].sort(
    (a, b) =>
      new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
  );
  return Promise.resolve(sorted.slice(0, limit));
}

/**
 * Retrieves paginated WhatsApp delivery records with optional search and filter
 */
export async function getWhatsAppDeliveries(
  filters: WhatsAppFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<PaginatedResult<WhatsAppMessage>> {
  let filtered = [...messagesStore];

  // Search by client name, phone, or message ID
  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.clientName.toLowerCase().includes(q) ||
        m.recipientPhone.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.documentName && m.documentName.toLowerCase().includes(q))
    );
  }

  // Filter by status
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((m) => m.status === filters.status);
  }

  const total = filtered.length;
  const page = Math.max(1, pagination.page);
  const pageSize = Math.max(1, pagination.pageSize);
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return Promise.resolve({
    data,
    total,
    page,
    pageSize,
    totalPages,
  });
}

/**
 * Retrieves recent message activity for dashboard overview
 */
export async function getRecentMessages(limit: number = 5): Promise<WhatsAppMessage[]> {
  const sorted = [...messagesStore].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return Promise.resolve(sorted.slice(0, limit));
}

/**
 * Retrieves diet plans assigned to a specific client
 */
export async function getDietPlansByClientId(clientId: string): Promise<DietPlan[]> {
  const plans = dietPlansStore.filter((p) => p.clientId === clientId);
  return Promise.resolve([...plans]);
}

/**
 * Retrieves all diet plans
 */
export async function getAllDietPlans(): Promise<DietPlan[]> {
  return Promise.resolve([...dietPlansStore]);
}

/**
 * Retrieves WhatsApp messages sent to a specific client
 */
export async function getMessagesByClientId(
  clientId: string
): Promise<WhatsAppMessage[]> {
  const clientMessages = messagesStore.filter((m) => m.clientId === clientId);
  return Promise.resolve([...clientMessages]);
}

/**
 * Retrieves all integration cards and their status
 */
export async function getIntegrations(): Promise<IntegrationCardItem[]> {
  return Promise.resolve([...MOCK_INTEGRATIONS]);
}

/**
 * Retrieves staff profile and preferences
 */
export async function getStaffProfile(): Promise<StaffProfile> {
  return Promise.resolve({ ...MOCK_STAFF_PROFILE });
}

export async function getAppPreferences(): Promise<AppPreferences> {
  return Promise.resolve({ ...MOCK_APP_PREFERENCES });
}

/**
 * Adds a new client to the in-memory store
 */
export async function createClient(
  clientData: Omit<Client, "id" | "registrationDate" | "lastMessageStatus">
): Promise<Client> {
  const nextId = `MOCK-CL-00${clientsStore.length + 1}`;
  const now = new Date().toISOString().split("T")[0] ?? "2026-10-22";

  const newClient: Client = {
    ...clientData,
    id: nextId,
    registrationDate: now,
    lastMessageStatus: "pending",
  };

  clientsStore.unshift(newClient);
  return Promise.resolve({ ...newClient });
}
