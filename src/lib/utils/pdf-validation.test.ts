import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validatePdfBuffer } from "./pdf-validation";

describe("Server-Side PDF Validation (validatePdfBuffer)", () => {
  // Helper to create synthetic buffers with specified headers
  function createPdfBuffer(extraBytes = 100): Uint8Array {
    const header = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]; // "%PDF-1.7"
    const content = new Array(extraBytes).fill(0x20); // space characters
    return new Uint8Array([...header, ...content]);
  }

  it("should validate a proper PDF buffer with %PDF- header", () => {
    const validPdf = createPdfBuffer(50);
    const result = validatePdfBuffer(validPdf, "application/pdf");
    assert.equal(result.isValid, true);
    assert.equal(result.error, undefined);
    assert.equal(result.fileSizeBytes, validPdf.byteLength);
  });

  it("should validate without declared MIME type if content is genuine PDF", () => {
    const validPdf = createPdfBuffer(50);
    const result = validatePdfBuffer(validPdf);
    assert.equal(result.isValid, true);
  });

  it("should reject files with fraudulent declared MIME type", () => {
    const validPdf = createPdfBuffer(50);
    const result = validatePdfBuffer(validPdf, "image/png");
    assert.equal(result.isValid, false);
    assert.match(result.error || "", /only application\/pdf is supported/i);
  });

  it("should reject non-PDF binary data masquerading as PDF", () => {
    const fakePdf = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]); // PNG header
    const result = validatePdfBuffer(fakePdf, "application/pdf");
    assert.equal(result.isValid, false);
    assert.match(result.error || "", /File signature mismatch/);
  });

  it("should reject empty (0-byte) files", () => {
    const empty = new Uint8Array(0);
    const result = validatePdfBuffer(empty);
    assert.equal(result.isValid, false);
    assert.match(result.error || "", /empty/i);
  });

  it("should reject truncated files smaller than 16 bytes", () => {
    const tiny = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // only 5 bytes
    const result = validatePdfBuffer(tiny);
    assert.equal(result.isValid, false);
    assert.match(result.error || "", /too small/i);
  });

  it("should reject files exceeding the maximum size limit", () => {
    const validPdf = createPdfBuffer(200);
    // Limit to 50 bytes
    const result = validatePdfBuffer(validPdf, "application/pdf", 50);
    assert.equal(result.isValid, false);
    assert.match(result.error || "", /exceeds the maximum allowed limit/i);
  });
});
