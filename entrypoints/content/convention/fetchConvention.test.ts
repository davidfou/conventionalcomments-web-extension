import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import invariant from "tiny-invariant";
import fetchConvention, { buildFetchUrl } from "./fetchConvention";

const githubKey = {
  platform: "github" as const,
  owner: "acme",
  repo: "widget",
};
const gitlabKey = {
  platform: "gitlab" as const,
  owner: "group/sub",
  repo: "widget",
};

const validBody = {
  version: 1,
  labels: [{ label: "praise", description: "..." }],
  decorations: [],
  defaultLabel: "praise",
};

function mockFetch(impl: () => Promise<Response>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(impl);
}

describe("buildFetchUrl", () => {
  test("github content API URL", () => {
    expect(buildFetchUrl(githubKey)).toBe(
      "https://api.github.com/repos/acme/widget/contents/.conventional-comments.json",
    );
  });
  test("gitlab same-origin API URL with URL-encoded project path", () => {
    expect(buildFetchUrl(gitlabKey)).toBe(
      "https://gitlab.com/api/v4/projects/group%2Fsub%2Fwidget/repository/files/.conventional-comments.json/raw?ref=HEAD",
    );
  });
});

describe("fetchConvention", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("github request asks for raw content via the Accept header", async () => {
    const spy = mockFetch(() =>
      Promise.resolve(new Response(JSON.stringify(validBody), { status: 200 })),
    );
    await fetchConvention(githubKey);
    expect(spy).toHaveBeenCalledWith(
      "https://api.github.com/repos/acme/widget/contents/.conventional-comments.json",
      {
        headers: { Accept: "application/vnd.github.raw" },
        credentials: "omit",
      },
    );
  });

  test("gitlab request sends same-origin credentials so private repos work", async () => {
    const spy = mockFetch(() =>
      Promise.resolve(new Response(JSON.stringify(validBody), { status: 200 })),
    );
    await fetchConvention(gitlabKey);
    expect(spy).toHaveBeenCalledWith(
      "https://gitlab.com/api/v4/projects/group%2Fsub%2Fwidget/repository/files/.conventional-comments.json/raw?ref=HEAD",
      { credentials: "include" },
    );
  });

  test("returns custom on 200 + valid JSON", async () => {
    mockFetch(() =>
      Promise.resolve(new Response(JSON.stringify(validBody), { status: 200 })),
    );
    const result = await fetchConvention(githubKey);
    invariant(
      result.status === "custom",
      `expected custom, got ${result.status}`,
    );
    expect(result.convention.labels[0].label).toBe("praise");
  });

  test("returns default on 404", async () => {
    mockFetch(() =>
      Promise.resolve(new Response("Not Found", { status: 404 })),
    );
    expect((await fetchConvention(githubKey)).status).toBe("default");
  });

  test("returns default on other non-2xx", async () => {
    mockFetch(() =>
      Promise.resolve(new Response("server error", { status: 500 })),
    );
    expect((await fetchConvention(githubKey)).status).toBe("default");
  });

  test("returns default on network error", async () => {
    mockFetch(() => Promise.reject(new Error("offline")));
    expect((await fetchConvention(githubKey)).status).toBe("default");
  });

  test("returns invalid on malformed JSON", async () => {
    mockFetch(() => Promise.resolve(new Response("not json", { status: 200 })));
    const result = await fetchConvention(githubKey);
    expect(result.status).toBe("invalid");
  });

  test("returns invalid on schema violation", async () => {
    mockFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ version: 1, labels: [] }), {
          status: 200,
        }),
      ),
    );
    const result = await fetchConvention(githubKey);
    expect(result.status).toBe("invalid");
  });
});
