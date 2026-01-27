/**
 * @vitest-environment jsdom
 */
import { it, expect, describe, beforeEach, vi } from "vitest";
import {
  fetchConventionConfig,
  clearConventionCache,
} from "./fetchConvention";

// Helper to mock window.location
function setWindowLocation(href: string): void {
  Object.defineProperty(window, "location", {
    value: { href },
    writable: true,
    configurable: true,
  });
}

describe("fetchConventionConfig", () => {
  beforeEach(() => {
    clearConventionCache();
    vi.restoreAllMocks();
  });

  it("fetches and validates a valid GitHub convention config", async () => {
    const mockConfig = {
      labels: [{ label: "custom", description: "Custom label" }],
    };

    setWindowLocation("https://github.com/owner/repo/pull/123");

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockConfig),
    });

    const result = await fetchConventionConfig("github-v1");

    expect(result).toEqual(mockConfig);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/owner/repo/HEAD/conventional-comments.json",
    );
  });

  it("fetches and validates a valid GitLab convention config", async () => {
    const mockConfig = {
      decorations: [{ label: "urgent", description: "Urgent decoration" }],
    };

    setWindowLocation("https://gitlab.com/owner/repo/-/merge_requests/456");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockConfig),
    });

    const result = await fetchConventionConfig("gitlab-v1");

    expect(result).toEqual(mockConfig);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://gitlab.com/owner/repo/-/raw/HEAD/conventional-comments.json",
    );
  });

  it("returns null when convention file is not found", async () => {
    setWindowLocation("https://github.com/owner/repo/pull/123");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await fetchConventionConfig("github-v1");

    expect(result).toBeNull();
  });

  it("returns null when convention config is invalid", async () => {
    const invalidConfig = {
      labels: "not an array",
    };

    setWindowLocation("https://github.com/owner/repo/pull/123");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(invalidConfig),
    });

    const result = await fetchConventionConfig("github-v1");

    expect(result).toBeNull();
  });

  it("returns null when JSON parsing fails", async () => {
    setWindowLocation("https://github.com/owner/repo/pull/123");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "invalid json",
    });

    const result = await fetchConventionConfig("github-v1");

    expect(result).toBeNull();
  });

  it("returns null when fetch throws an error", async () => {
    setWindowLocation("https://github.com/owner/repo/pull/123");

    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await fetchConventionConfig("github-v1");

    expect(result).toBeNull();
  });

  it("returns null when repository info cannot be extracted", async () => {
    setWindowLocation("https://unknown.com/something");

    const result = await fetchConventionConfig("github-v1");

    expect(result).toBeNull();
  });

  it("caches the result for subsequent calls", async () => {
    const mockConfig = {
      labels: [{ label: "cached", description: "Cached label" }],
    };

    setWindowLocation("https://github.com/owner/repo/pull/123");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockConfig),
    });

    // First call
    const result1 = await fetchConventionConfig("github-v1");
    expect(result1).toEqual(mockConfig);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call - should use cache
    const result2 = await fetchConventionConfig("github-v1");
    expect(result2).toEqual(mockConfig);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only called once
  });

  it("caches negative results (404) to avoid repeated fetches", async () => {
    setWindowLocation("https://github.com/owner/repo/pull/123");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    // First call
    const result1 = await fetchConventionConfig("github-v1");
    expect(result1).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call - should use cache
    const result2 = await fetchConventionConfig("github-v1");
    expect(result2).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only called once
  });

  it("handles GitHub v2 product type", async () => {
    const mockConfig = {
      labels: [{ label: "v2", description: "Version 2 label" }],
    };

    setWindowLocation("https://github.com/owner/repo/pull/789");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockConfig),
    });

    const result = await fetchConventionConfig("github-v2");

    expect(result).toEqual(mockConfig);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/owner/repo/HEAD/conventional-comments.json",
    );
  });
});
