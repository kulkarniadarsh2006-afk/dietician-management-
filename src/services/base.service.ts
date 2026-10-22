import "server-only";

import { logger } from "@/lib/logger";

/**
 * Base Service class for business domain logic.
 * Independent of transport (HTTP, Server Actions, CLI) and UI presentation.
 */
export abstract class BaseService {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected logOperation(operation: string, meta?: Record<string, unknown>) {
    logger.info(`[${this.serviceName}] Executing ${operation}`, meta, this.serviceName);
  }
}

/**
 * Service Contracts (Foundation Scaffolding)
 */
export interface PatientServiceContract {
  getPatientSummary(patientId: string): Promise<{ id: string; status: string }>;
}

export interface DietPlanServiceContract {
  generateDraftPlan(patientId: string): Promise<{ planId: string; status: string }>;
}
