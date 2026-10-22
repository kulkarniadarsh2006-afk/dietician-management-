import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizePhoneToE164, tryNormalizePhoneToE164, isValidE164 } from "./phone";

describe("Phone Normalization to E.164 (normalizePhoneToE164)", () => {
  it("should preserve already valid E.164 North American numbers", () => {
    assert.equal(normalizePhoneToE164("+12025550123"), "+12025550123");
    assert.equal(normalizePhoneToE164("+15550101"), "+15550101");
  });

  it("should preserve already valid E.164 international numbers", () => {
    assert.equal(normalizePhoneToE164("+447911123456"), "+447911123456");
    assert.equal(normalizePhoneToE164("+919876543210"), "+919876543210");
    assert.equal(normalizePhoneToE164("+61412345678"), "+61412345678");
  });

  it("should normalize US formatted phone numbers with spaces, dashes, and parentheses", () => {
    assert.equal(normalizePhoneToE164("(202) 555-0123"), "+12025550123");
    assert.equal(normalizePhoneToE164("202-555-0123"), "+12025550123");
    assert.equal(normalizePhoneToE164("202 555 0123"), "+12025550123");
    assert.equal(normalizePhoneToE164("202.555.0123"), "+12025550123");
  });

  it("should normalize 11-digit US numbers with leading 1", () => {
    assert.equal(normalizePhoneToE164("1-202-555-0123"), "+12025550123");
    assert.equal(normalizePhoneToE164("12025550123"), "+12025550123");
  });

  it("should normalize UK national number with leading 0 when defaultCountryCode is 44", () => {
    assert.equal(normalizePhoneToE164("07911 123456", "44"), "+447911123456");
  });

  it("should strip extraneous whitespaces", () => {
    assert.equal(normalizePhoneToE164("   +1 202-555-0199  "), "+12025550199");
  });

  it("should reject empty, whitespace, or nullish input", () => {
    assert.throws(() => normalizePhoneToE164(""), /non-empty/);
    assert.throws(() => normalizePhoneToE164("   "), /empty or whitespace/);
  });

  it("should reject alphanumeric mnemonic numbers", () => {
    assert.throws(() => normalizePhoneToE164("1-800-FLOWERS"), /invalid alphabetic/);
  });

  it("should reject numbers that are too short", () => {
    assert.throws(() => normalizePhoneToE164("12345"), /too short/);
  });

  it("should reject numbers that are too long", () => {
    assert.throws(() => normalizePhoneToE164("+1234567890123456789"), /exceeds maximum/);
  });

  it("should reject country code starting with 0", () => {
    assert.throws(
      () => normalizePhoneToE164("+0123456789"),
      /does not satisfy strict E.164/
    );
  });
});

describe("tryNormalizePhoneToE164 safe wrapper", () => {
  it("should return success object for valid input", () => {
    const res = tryNormalizePhoneToE164("(202) 555-0123");
    assert.equal(res.success, true);
    assert.equal(res.phone, "+12025550123");
    assert.equal(res.error, undefined);
  });

  it("should return failure object with error message for invalid input", () => {
    const res = tryNormalizePhoneToE164("invalid");
    assert.equal(res.success, false);
    assert.equal(res.phone, undefined);
    assert.match(res.error || "", /alphabetic/);
  });
});

describe("isValidE164 predicate", () => {
  it("should correctly identify valid E.164 strings", () => {
    assert.equal(isValidE164("+12025550123"), true);
    assert.equal(isValidE164("+447911123456"), true);
    assert.equal(isValidE164("+15550101"), true);
  });

  it("should return false for unnormalized or invalid formats", () => {
    assert.equal(isValidE164("2025550123"), false);
    assert.equal(isValidE164("(202) 555-0123"), false);
    assert.equal(isValidE164("+0123456789"), false);
    assert.equal(isValidE164(""), false);
  });
});
