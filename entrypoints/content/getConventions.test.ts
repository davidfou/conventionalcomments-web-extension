/**
 * @vitest-environment jsdom
 */
import { it, expect, describe, beforeEach, vi } from "vitest";
import { getConventions } from "./getConventions";
import * as fetchConventionModule from "./fetchConvention";

// Mock the fetchConvention module
vi.mock("./fetchConvention", () => ({
  fetchConventionConfig: vi.fn(),
  clearConventionCache: vi.fn(),
}));

describe("getConventions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns default conventions when no custom config is found", async () => {
    vi.mocked(fetchConventionModule.fetchConventionConfig).mockResolvedValue(
      null,
    );

    const result = await getConventions("github-v1");

    expect(result.labels).toHaveLength(12); // 1 "none" + 11 default labels
    expect(result.labels[0].label).toBe("none");
    expect(result.labels[1].label).toBe("praise");
    expect(result.decorations).toHaveLength(3);
    expect(result.decorations[0].label).toBe("non-blocking");
  });

  it("uses custom labels when provided", async () => {
    const customConfig = {
      labels: [
        { label: "bug", description: "A bug report" },
        { label: "feature", description: "A feature request" },
      ],
    };

    vi.mocked(fetchConventionModule.fetchConventionConfig).mockResolvedValue(
      customConfig,
    );

    const result = await getConventions("github-v1");

    // Should have "none" + custom labels
    expect(result.labels).toHaveLength(3);
    expect(result.labels[0].label).toBe("none");
    expect(result.labels[1].label).toBe("bug");
    expect(result.labels[2].label).toBe("feature");
  });

  it("uses default decorations when custom config has no decorations", async () => {
    const customConfig = {
      labels: [{ label: "custom", description: "Custom label" }],
    };

    vi.mocked(fetchConventionModule.fetchConventionConfig).mockResolvedValue(
      customConfig,
    );

    const result = await getConventions("github-v1");

    expect(result.decorations).toHaveLength(3);
    expect(result.decorations[0].label).toBe("non-blocking");
  });

  it("uses custom decorations when provided", async () => {
    const customConfig = {
      decorations: [
        { label: "urgent", description: "Urgent issue" },
        { label: "low-priority", description: "Low priority" },
      ],
    };

    vi.mocked(fetchConventionModule.fetchConventionConfig).mockResolvedValue(
      customConfig,
    );

    const result = await getConventions("github-v1");

    expect(result.labels).toHaveLength(12); // Default labels
    expect(result.decorations).toHaveLength(2);
    expect(result.decorations[0].label).toBe("urgent");
    expect(result.decorations[1].label).toBe("low-priority");
  });

  it("uses custom labels and decorations when both are provided", async () => {
    const customConfig = {
      labels: [{ label: "review", description: "Review comment" }],
      decorations: [{ label: "important", description: "Important" }],
    };

    vi.mocked(fetchConventionModule.fetchConventionConfig).mockResolvedValue(
      customConfig,
    );

    const result = await getConventions("github-v1");

    expect(result.labels).toHaveLength(2); // "none" + "review"
    expect(result.labels[0].label).toBe("none");
    expect(result.labels[1].label).toBe("review");
    expect(result.decorations).toHaveLength(1);
    expect(result.decorations[0].label).toBe("important");
  });

  it("uses default labels when custom config has empty labels array", async () => {
    const customConfig = {
      labels: [],
      decorations: [{ label: "custom-decoration", description: "Custom" }],
    };

    vi.mocked(fetchConventionModule.fetchConventionConfig).mockResolvedValue(
      customConfig,
    );

    const result = await getConventions("github-v1");

    expect(result.labels).toHaveLength(12); // All default labels
    expect(result.labels[0].label).toBe("none");
    expect(result.decorations).toHaveLength(1);
    expect(result.decorations[0].label).toBe("custom-decoration");
  });

  it("uses default decorations when custom config has empty decorations array", async () => {
    const customConfig = {
      labels: [{ label: "custom-label", description: "Custom" }],
      decorations: [],
    };

    vi.mocked(fetchConventionModule.fetchConventionConfig).mockResolvedValue(
      customConfig,
    );

    const result = await getConventions("github-v1");

    expect(result.labels).toHaveLength(2); // "none" + custom label
    expect(result.decorations).toHaveLength(3); // All default decorations
  });
});
