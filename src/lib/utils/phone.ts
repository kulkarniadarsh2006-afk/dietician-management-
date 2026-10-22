/**
 * ==============================================================================
 * E.164 TELEPHONE NORMALIZATION & VALIDATION UTILITY
 * ==============================================================================
 * Formats telephone inputs to standard E.164 format:
 *   +<country_code><subscriber_number>
 * Requirements:
 *   - Must begin with a plus symbol '+'
 *   - Followed by 1 to 9 (country code cannot start with 0)
 *   - Total length of 8 to 15 digits (ITU-T E.164 specification)
 * ==============================================================================
 */

export const E164_REGEX = /^\+[1-9][0-9]{7,14}$/;

export interface PhoneNormalizationResult {
  success: boolean;
  phone?: string;
  error?: string;
}

/**
 * Normalizes an arbitrary phone string to strict E.164 format.
 *
 * @param input Raw phone number string from user input or external form
 * @param defaultCountryCode Numeric country code without plus (defaults to '1' for NANP)
 * @returns Normalized E.164 string
 * @throws Error if the phone number cannot be reliably normalized to valid E.164
 */
export function normalizePhoneToE164(
  input: string,
  defaultCountryCode: string = "1"
): string {
  if (!input || typeof input !== "string") {
    throw new Error("Phone number must be a non-empty string.");
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error("Phone number cannot be empty or whitespace.");
  }

  // Reject alphanumeric mnemonic numbers (e.g. 1-800-FLOWERS)
  if (/[a-zA-Z]/.test(trimmed)) {
    throw new Error("Phone number contains invalid alphabetic characters.");
  }

  // Clean country code (remove any leading + or non-digits)
  const cleanDefaultCC = defaultCountryCode.replace(/\D/g, "") || "1";

  // Check if caller supplied an explicit leading +
  const hasLeadingPlus = trimmed.startsWith("+");

  // Strip all non-digit characters
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (digitsOnly.length === 0) {
    throw new Error("Phone number contains no numeric digits.");
  }

  let candidate: string;

  if (hasLeadingPlus) {
    // Explicit international number provided: prepend + to cleaned digits
    candidate = `+${digitsOnly}`;
  } else if (cleanDefaultCC === "1") {
    // North American Numbering Plan (NANP) rules:
    // If 10 digits provided (e.g., 2025550123), prepend +1
    if (digitsOnly.length === 10) {
      candidate = `+1${digitsOnly}`;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
      // 11 digits starting with 1: prepend +
      candidate = `+${digitsOnly}`;
    } else {
      // Assume local with country code prepended
      candidate = `+${cleanDefaultCC}${digitsOnly}`;
    }
  } else {
    // Other country codes: if starts with trunk prefix '0', strip it before prefixing country code
    const subscriberDigits = digitsOnly.startsWith("0")
      ? digitsOnly.substring(1)
      : digitsOnly;
    candidate = `+${cleanDefaultCC}${subscriberDigits}`;
  }

  // Final validation against strict ITU-T E.164 specification
  if (!E164_REGEX.test(candidate)) {
    if (candidate.length < 8) {
      throw new Error(
        `Normalized phone number "${candidate}" is too short (minimum 8 characters including '+').`
      );
    }
    if (candidate.length > 16) {
      throw new Error(
        `Normalized phone number "${candidate}" exceeds maximum E.164 length (15 digits + '+').`
      );
    }
    throw new Error(
      `Normalized phone number "${candidate}" does not satisfy strict E.164 format (+[1-9][0-9]{7,14}).`
    );
  }

  return candidate;
}

/**
 * Safe, non-throwing variant of normalizePhoneToE164.
 */
export function tryNormalizePhoneToE164(
  input: string,
  defaultCountryCode: string = "1"
): PhoneNormalizationResult {
  try {
    const phone = normalizePhoneToE164(input, defaultCountryCode);
    return { success: true, phone };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Invalid telephone number.",
    };
  }
}

/**
 * Validates whether an input string is already formatted as a valid E.164 phone number.
 */
export function isValidE164(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  return E164_REGEX.test(phone.trim());
}
