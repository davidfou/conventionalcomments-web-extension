import { it, expect, describe } from "vitest";
import { validateConvention } from "./conventionSchema";

describe("validateConvention", () => {
  it("validates a valid configuration with labels only", () => {
    const config = {
      labels: [
        { label: "bug", description: "A bug report" },
        { label: "feature", description: "A feature request" },
      ],
    };

    expect(validateConvention(config)).toBe(true);
  });

  it("validates a valid configuration with decorations only", () => {
    const config = {
      decorations: [
        { label: "blocking", description: "This is blocking" },
        { label: "non-blocking", description: "This is non-blocking" },
      ],
    };

    expect(validateConvention(config)).toBe(true);
  });

  it("validates a valid configuration with both labels and decorations", () => {
    const config = {
      labels: [{ label: "bug", description: "A bug report" }],
      decorations: [{ label: "blocking", description: "This is blocking" }],
    };

    expect(validateConvention(config)).toBe(true);
  });

  it("validates a configuration with empty arrays", () => {
    const config = {
      labels: [],
      decorations: [],
    };

    expect(validateConvention(config)).toBe(true);
  });

  it("rejects null", () => {
    expect(validateConvention(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(validateConvention(undefined)).toBe(false);
  });

  it("rejects a string", () => {
    expect(validateConvention("string")).toBe(false);
  });

  it("rejects an array", () => {
    expect(validateConvention([])).toBe(false);
  });

  it("rejects an empty object", () => {
    expect(validateConvention({})).toBe(false);
  });

  it("rejects a configuration with additional properties", () => {
    const config = {
      labels: [{ label: "bug", description: "A bug report" }],
      extra: "not allowed",
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects labels that are not an array", () => {
    const config = {
      labels: "not an array",
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects decorations that are not an array", () => {
    const config = {
      decorations: "not an array",
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects label items missing required fields", () => {
    const config = {
      labels: [{ label: "bug" }],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects decoration items missing required fields", () => {
    const config = {
      decorations: [{ description: "A description" }],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects label items with empty label", () => {
    const config = {
      labels: [{ label: "", description: "A description" }],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects label items with empty description", () => {
    const config = {
      labels: [{ label: "bug", description: "" }],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects label items with wrong type for label", () => {
    const config = {
      labels: [{ label: 123, description: "A description" }],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects label items with wrong type for description", () => {
    const config = {
      labels: [{ label: "bug", description: 123 }],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects label items with additional properties", () => {
    const config = {
      labels: [{ label: "bug", description: "A description", extra: "field" }],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects decoration items with additional properties", () => {
    const config = {
      decorations: [
        { label: "blocking", description: "A description", extra: "field" },
      ],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects label items that are not objects", () => {
    const config = {
      labels: ["string"],
    };

    expect(validateConvention(config)).toBe(false);
  });

  it("rejects decoration items that are not objects", () => {
    const config = {
      decorations: [123],
    };

    expect(validateConvention(config)).toBe(false);
  });
});
