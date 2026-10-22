/**
 * ==============================================================================
 * SERVER-SIDE PDF VALIDATION UTILITY
 * ==============================================================================
 * Security requirements:
 *   - Client-supplied MIME type must NEVER be trusted alone.
 *   - Validate file size within allowed limits (default 15 MB).
 *   - Verify file header magic bytes match `%PDF-` (0x25, 0x50, 0x44, 0x46, 0x2D).
 * ==============================================================================
 */

export const DEFAULT_MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

export interface PdfValidationResult {
  isValid: boolean;
  error?: string;
  fileSizeBytes: number;
}

/**
 * Validates a binary buffer as a genuine PDF document.
 *
 * @param buffer Raw file bytes (Buffer, Uint8Array, or ArrayBuffer)
 * @param declaredMimeType Optional MIME type supplied by client header
 * @param maxSizeBytes Maximum allowable size (defaults to 15 MB)
 */
export function validatePdfBuffer(
  buffer: Buffer | Uint8Array | ArrayBuffer,
  declaredMimeType?: string,
  maxSizeBytes: number = DEFAULT_MAX_PDF_SIZE_BYTES
): PdfValidationResult {
  const bytes =
    buffer instanceof ArrayBuffer
      ? new Uint8Array(buffer)
      : buffer instanceof Uint8Array
        ? buffer
        : new Uint8Array(buffer);

  const fileSizeBytes = bytes.byteLength;

  if (fileSizeBytes === 0) {
    return {
      isValid: false,
      error: "Uploaded file is empty (0 bytes).",
      fileSizeBytes: 0,
    };
  }

  if (fileSizeBytes > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size (${(fileSizeBytes / 1024 / 1024).toFixed(2)} MB) exceeds the maximum allowed limit of ${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB.`,
      fileSizeBytes,
    };
  }

  // If MIME type was declared, it must match application/pdf
  if (declaredMimeType && declaredMimeType.toLowerCase() !== "application/pdf") {
    return {
      isValid: false,
      error: `Declared MIME type "${declaredMimeType}" is not allowed. Only application/pdf is supported.`,
      fileSizeBytes,
    };
  }

  // Minimum size for a valid PDF structure (header + basic trailer) is at least 16 bytes
  if (fileSizeBytes < 16) {
    return {
      isValid: false,
      error: "File is too small to constitute a valid PDF document.",
      fileSizeBytes,
    };
  }

  // Verify magic bytes: first 5 bytes must match %PDF-
  for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
    if (bytes[i] !== PDF_MAGIC_BYTES[i]) {
      return {
        isValid: false,
        error:
          "File signature mismatch. The file content does not begin with standard PDF header (%PDF-).",
        fileSizeBytes,
      };
    }
  }

  return {
    isValid: true,
    fileSizeBytes,
  };
}
