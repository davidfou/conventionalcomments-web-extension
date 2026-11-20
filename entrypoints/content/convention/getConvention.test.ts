import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import getConvention, { resetConventionCache } from "./getConvention";

const validBody = {
  version: 1,
  labels: [{ label: "praise", description: "..." }],
  decorations: [],
  defaultLabel: "praise",
};

describe("getConvention", () => {
  beforeEach(() => {
    resetConventionCache();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    resetConventionCache();
    vi.restoreAllMocks();
  });

  test("returns default for non-repo URLs without fetching", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const result = await getConvention("https://github.com/settings/profile");
    expect(result.status).toBe("default");
    expect(spy).not.toHaveBeenCalled();
  });

  test("dedupes concurrent calls to the same repo", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(validBody), { status: 200 }),
        ),
      );
    const [a, b] = await Promise.all([
      getConvention("https://github.com/acme/widget/pull/1"),
      getConvention("https://github.com/acme/widget/issues/2"),
    ]);
    expect(a.status).toBe("custom");
    expect(b.status).toBe("custom");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("caches subsequent calls", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() =>
        Promise.resolve(new Response("Not Found", { status: 404 })),
      );
    const first = await getConvention("https://github.com/acme/widget/pull/1");
    const second = await getConvention(
      "https://github.com/acme/widget/issues/2",
    );
    expect(first.status).toBe("default");
    expect(second.status).toBe("default");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("warns once on invalid", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(new Response("not json", { status: 200 })),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());
    await getConvention("https://github.com/acme/widget/pull/1");
    await getConvention("https://github.com/acme/widget/issues/3");
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
