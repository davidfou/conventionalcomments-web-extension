import { describe, expect, test } from "vitest";
import invariant from "tiny-invariant";
import { validateConvention, type ValidationOutcome } from "./schema";

const validV1 = {
  version: 1,
  labels: [
    { label: "praise", description: "..." },
    { label: "issue", description: "..." },
  ],
  decorations: [{ label: "blocking", description: "..." }],
  defaultLabel: "praise",
};

function expectOk(
  result: ValidationOutcome,
): Extract<ValidationOutcome, { ok: true }> {
  invariant(result.ok, `expected ok, got: ${result.ok ? "" : result.reason}`);
  return result;
}

function expectFail(
  result: ValidationOutcome,
): Extract<ValidationOutcome, { ok: false }> {
  invariant(!result.ok, "expected failure");
  return result;
}

describe("validateConvention", () => {
  test("accepts a valid v1 convention", () => {
    const { convention } = expectOk(validateConvention(validV1));
    expect(convention.defaultLabel).toBe("praise");
    expect(convention.labels).toHaveLength(2);
  });

  test("normalizes missing defaultLabel to null", () => {
    const { convention } = expectOk(
      validateConvention({
        version: 1,
        labels: validV1.labels,
        decorations: validV1.decorations,
      }),
    );
    expect(convention.defaultLabel).toBeNull();
  });

  test("normalizes explicit null defaultLabel to null", () => {
    const { convention } = expectOk(
      validateConvention({ ...validV1, defaultLabel: null }),
    );
    expect(convention.defaultLabel).toBeNull();
  });

  test("defaults decorations to empty array", () => {
    const { convention } = expectOk(
      validateConvention({
        version: 1,
        labels: validV1.labels,
        defaultLabel: "praise",
      }),
    );
    expect(convention.decorations).toEqual([]);
  });

  test("allows a $schema field", () => {
    expectOk(
      validateConvention({
        $schema: "https://example.com/schema.json",
        ...validV1,
      }),
    );
  });

  test("rejects non-object input", () => {
    expect(validateConvention(null).ok).toBe(false);
    expect(validateConvention([]).ok).toBe(false);
    expect(validateConvention("string").ok).toBe(false);
  });

  test("rejects missing version", () => {
    const { reason } = expectFail(
      validateConvention({ labels: validV1.labels }),
    );
    expect(reason).toContain("version");
  });

  test("rejects unsupported version", () => {
    const { reason } = expectFail(
      validateConvention({ ...validV1, version: 99 }),
    );
    expect(reason).toContain("Unsupported");
  });

  test("rejects empty labels", () => {
    expectFail(validateConvention({ ...validV1, labels: [] }));
  });

  test("rejects duplicate labels", () => {
    const { reason } = expectFail(
      validateConvention({
        ...validV1,
        labels: [
          { label: "praise", description: "a" },
          { label: "praise", description: "b" },
        ],
        defaultLabel: "praise",
      }),
    );
    expect(reason).toContain("Duplicate");
  });

  test("rejects reserved label name", () => {
    const { reason } = expectFail(
      validateConvention({
        ...validV1,
        labels: [{ label: "none", description: "..." }],
        defaultLabel: null,
      }),
    );
    expect(reason).toContain("reserved");
  });

  test("rejects defaultLabel that does not match a label", () => {
    const { reason } = expectFail(
      validateConvention({ ...validV1, defaultLabel: "missing" }),
    );
    expect(reason).toContain("missing");
  });

  test("rejects duplicate decorations", () => {
    expectFail(
      validateConvention({
        ...validV1,
        decorations: [
          { label: "blocking", description: "a" },
          { label: "blocking", description: "b" },
        ],
      }),
    );
  });

  test("rejects empty label string", () => {
    expectFail(
      validateConvention({
        ...validV1,
        labels: [{ label: "", description: "..." }],
        defaultLabel: null,
      }),
    );
  });
});
