/**
 * Base Application Error class with standardized HTTP status codes and operational flags.
 * Designed to prevent leakage of internal stack traces or database errors to end users.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Invalid request payload", details?: unknown) {
    super(message, 400, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = "Insufficient permissions to access this clinical resource"
  ) {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, true);
  }
}

export class IntegrationError extends AppError {
  public readonly service: string;

  constructor(service: string, message: string, details?: unknown) {
    super(`Integration failure with ${service}: ${message}`, 502, true, details);
    this.service = service;
  }
}

/**
 * Type guard to check if an error is an AppError instance.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
