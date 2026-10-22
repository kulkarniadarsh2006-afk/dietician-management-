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
 * Provides a clean boundary for future database and service layer queries.
 * No hardcoded, mock, or fabricated business data.
 * All queries return neutral empty sets or placeholders until Supabase is connected.
 */

// In-memory array for user-created clients during local evaluation
const liveClients: Client[] = [];
const liveMessages: WhatsAppMessage[] = [];
const liveDietPlans: DietPlan[] = [];

/**
 * Retrieves dashboard statistics with neutral placeholders
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return Promise.resolve({
    totalClients: "—",
    totalClientsDelta: "—",
    newClientsThisMonth: "—",
    newClientsDelta: "—",
    assignedDietPlans: "—",
    assignedDietPlansDelta: "—",
    successfulWhatsAppDeliveries: "—",
    successfulWhatsAppRate: "—",
  });
}

/**
 * Retrieves paginated clients
 */
export async function getClients(
  filters: ClientFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<PaginatedResult<Client>> {
  let filtered = [...liveClients];

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

  if (filters.dietPlanStatus && filters.dietPlanStatus !== "all") {
    filtered = filtered.filter((c) => c.dietPlanStatus === filters.dietPlanStatus);
  }

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
  const client = liveClients.find((c) => c.id === id);
  return Promise.resolve(client ? { ...client } : null);
}

/**
 * Retrieves recent client registrations (empty until real data is present)
 */
export async function getRecentClients(limit: number = 5): Promise<Client[]> {
  const sorted = [...liveClients].sort(
    (a, b) =>
      new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
  );
  return Promise.resolve(sorted.slice(0, limit));
}

/**
 * Retrieves paginated WhatsApp delivery records
 */
export async function getWhatsAppDeliveries(
  filters: WhatsAppFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<PaginatedResult<WhatsAppMessage>> {
  let filtered = [...liveMessages];

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.clientName.toLowerCase().includes(q) ||
        m.recipientPhone.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
    );
  }

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
 * Retrieves recent message activity (empty until real deliveries are recorded)
 */
export async function getRecentMessages(limit: number = 5): Promise<WhatsAppMessage[]> {
  const sorted = [...liveMessages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return Promise.resolve(sorted.slice(0, limit));
}

/**
 * Retrieves diet plans assigned to a specific client
 */
export async function getDietPlansByClientId(clientId: string): Promise<DietPlan[]> {
  const plans = liveDietPlans.filter((p) => p.clientId === clientId);
  return Promise.resolve([...plans]);
}

/**
 * Retrieves all diet plans
 */
export async function getAllDietPlans(): Promise<DietPlan[]> {
  return Promise.resolve([...liveDietPlans]);
}

/**
 * Retrieves WhatsApp messages sent to a specific client
 */
export async function getMessagesByClientId(
  clientId: string
): Promise<WhatsAppMessage[]> {
  const clientMessages = liveMessages.filter((m) => m.clientId === clientId);
  return Promise.resolve([...clientMessages]);
}

/**
 * Integration definitions - all marked strictly as "Not configured"
 */
export const INTEGRATION_ITEMS: IntegrationCardItem[] = [
  {
    id: "google-forms",
    title: "Google Forms Intake",
    provider: "Google Workspace API",
    description:
      "Automated clinical intake questionnaires. Syncs patient responses and medical history directly into client records.",
    status: "Not configured",
    icon: "FileSpreadsheet",
    category: "Intake & Forms",
    docsUrl: "https://developers.google.com/forms/api",
  },
  {
    id: "google-sheets",
    title: "Google Sheets Export",
    provider: "Google Sheets v4 API",
    description:
      "Bi-directional sync of client logs, nutritional metrics, and appointment rosters to clinical spreadsheets.",
    status: "Not configured",
    icon: "Table",
    category: "Intake & Forms",
    docsUrl: "https://developers.google.com/sheets/api",
  },
  {
    id: "supabase",
    title: "Supabase Healthcare Cloud",
    provider: "PostgreSQL & Auth",
    description:
      "Protected Health Information (PHI) storage with Row Level Security (RLS) and private signed storage buckets.",
    status: "Not configured",
    icon: "Database",
    category: "Database & Auth",
    docsUrl: "https://supabase.com/docs",
  },
  {
    id: "whatsapp",
    title: "Meta WhatsApp Cloud API",
    provider: "Official Cloud API v20.0",
    description:
      "Automated PDF diet plan dispatch, consultation reminders, and secure patient communication via official Cloud API.",
    status: "Not configured",
    icon: "MessageSquare",
    category: "Messaging",
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
  },
];

export async function getIntegrations(): Promise<IntegrationCardItem[]> {
  return Promise.resolve([...INTEGRATION_ITEMS]);
}

/**
 * Default staff profile placeholder
 */
export async function getStaffProfile(): Promise<StaffProfile> {
  return Promise.resolve({
    name: "",
    title: "",
    email: "",
    phone: "",
    licenseNumber: "",
    clinicName: "",
  });
}

/**
 * Default application preferences
 */
export async function getAppPreferences(): Promise<AppPreferences> {
  return Promise.resolve({
    timezone: "America/New_York (UTC-4)",
    dateFormat: "YYYY-MM-DD",
    emailNotifications: true,
    whatsappAlerts: true,
    soundAlerts: false,
    compactMode: false,
  });
}

/**
 * Adds a new client (in-memory during session)
 */
export async function createClient(
  clientData: Omit<Client, "id" | "registrationDate" | "lastMessageStatus">
): Promise<Client> {
  const nextId = `CL-${String(liveClients.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString().split("T")[0] ?? "";

  const newClient: Client = {
    ...clientData,
    id: nextId,
    registrationDate: now,
    lastMessageStatus: "pending",
  };

  liveClients.unshift(newClient);
  return Promise.resolve({ ...newClient });
}
