import "server-only";

import { BaseRepository } from "./base.repository";

// Typed entities for repositories (scaffolded)
export interface PatientRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  created_at: string;
}

export interface DietPlanRecord {
  id: string;
  patient_id: string;
  title: string;
  status: "draft" | "published" | "archived";
  calorie_target?: number;
  created_at: string;
}

export interface AppointmentRecord {
  id: string;
  patient_id: string;
  practitioner_id: string;
  scheduled_at: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  created_at: string;
}

export class PatientRepository extends BaseRepository<PatientRecord> {
  constructor() {
    super("patients");
  }
}

export class DietPlanRepository extends BaseRepository<DietPlanRecord> {
  constructor() {
    super("diet_plans");
  }
}

export class AppointmentRepository extends BaseRepository<AppointmentRecord> {
  constructor() {
    super("appointments");
  }
}

export const repositories = {
  patients: new PatientRepository(),
  dietPlans: new DietPlanRepository(),
  appointments: new AppointmentRepository(),
};
