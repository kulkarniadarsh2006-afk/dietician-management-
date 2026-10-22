/**
 * Shared Domain Types for Dietitian Management System UI
 * Strictly typed with zero `any`.
 */

export type DeliveryStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export type DietPlanStatus = "assigned" | "pending" | "none";

export interface Client {
  id: string; // e.g., "MOCK-CL-001"
  name: string;
  phone: string;
  email: string;
  registrationDate: string; // ISO date string: "2026-09-15"
  dietPlanStatus: DietPlanStatus;
  lastMessageStatus: DeliveryStatus;
  lastMessageDate?: string;
  age?: number;
  gender?: "Female" | "Male" | "Other" | "Prefer not to say";
  primaryGoal?: string;
  allergies?: string[];
  dietaryPreferences?: string[];
  medicalConditions?: string[];
  notes?: string;
  intakeCompleted?: boolean;
  intakeDate?: string;
  assignedDietitian?: string;
}

export interface DietPlan {
  id: string; // e.g., "MOCK-DP-001"
  clientId: string;
  clientName: string;
  title: string;
  filename: string;
  fileSizeBytes: number;
  assignedDate: string;
  calorieTarget?: number;
  macroRatio?: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  };
  status: "active" | "archived" | "draft";
  deliveryStatus: DeliveryStatus;
}

export interface WhatsAppMessage {
  id: string; // e.g., "MOCK-MSG-001"
  clientId: string;
  clientName: string;
  recipientPhone: string;
  messageType: "template" | "text" | "document";
  templateName?: string;
  documentName?: string;
  status: DeliveryStatus;
  timestamp: string;
  failureReason?: string;
}

export interface DashboardStats {
  totalClients: number;
  totalClientsDelta: string;
  newClientsThisMonth: number;
  newClientsDelta: string;
  assignedDietPlans: number;
  assignedDietPlansDelta: string;
  successfulWhatsAppDeliveries: number;
  successfulWhatsAppRate: string;
}

export interface IntegrationCardItem {
  id: "google-forms" | "google-sheets" | "supabase" | "whatsapp";
  title: string;
  provider: string;
  description: string;
  status: "Not configured" | "Not connected";
  icon: string;
  category: "Intake & Forms" | "Database & Auth" | "Messaging";
  docsUrl: string;
}

export interface StaffProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  licenseNumber: string;
  clinicName: string;
}

export interface AppPreferences {
  timezone: string;
  dateFormat: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
  emailNotifications: boolean;
  whatsappAlerts: boolean;
  soundAlerts: boolean;
  compactMode: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ClientFilters {
  search?: string;
  dietPlanStatus?: DietPlanStatus | "all";
  messageStatus?: DeliveryStatus | "all";
  dateRange?: "all" | "this-month" | "last-30-days" | "older";
}

export interface WhatsAppFilters {
  search?: string;
  status?: DeliveryStatus | "all";
}
