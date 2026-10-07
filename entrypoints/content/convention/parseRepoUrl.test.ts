import { describe, expect, test } from "vitest";
import parseRepoUrl from "./parseRepoUrl";

describe("parseRepoUrl", () => {
  describe("github.com", () => {
    test("parses repo from a PR URL", () => {
      expect(
        parseRepoUrl("https://github.com/davidfou/conventionalcomments/pull/1"),
      ).toEqual({
        platform: "github",
        owner: "davidfou",
        repo: "conventionalcomments",
      });
    });

    test("parses repo from an issue URL", () => {
      expect(parseRepoUrl("https://github.com/acme/widget/issues/42")).toEqual({
        platform: "github",
        owner: "acme",
        repo: "widget",
      });
    });

    test("strips a .git suffix", () => {
      expect(parseRepoUrl("https://github.com/acme/widget.git")).toEqual({
        platform: "github",
        owner: "acme",
        repo: "widget",
      });
    });

    test("rejects reserved top-level paths", () => {
      expect(parseRepoUrl("https://github.com/settings/profile")).toBeNull();
      expect(parseRepoUrl("https://github.com/notifications")).toBeNull();
      expect(parseRepoUrl("https://github.com/marketplace/foo")).toBeNull();
      expect(parseRepoUrl("https://github.com/issues")).toBeNull();
      expect(parseRepoUrl("https://github.com/pulls")).toBeNull();
      expect(parseRepoUrl("https://github.com/orgs/x/teams")).toBeNull();
    });

    test("rejects URLs without owner+repo", () => {
      expect(parseRepoUrl("https://github.com/")).toBeNull();
      expect(parseRepoUrl("https://github.com/foo")).toBeNull();
    });

    test("ignores trailing slashes", () => {
      expect(parseRepoUrl("https://github.com/acme/widget/")).toEqual({
        platform: "github",
        owner: "acme",
        repo: "widget",
      });
    });
  });

  describe("gitlab.com", () => {
    test("parses repo from an MR URL", () => {
      expect(
        parseRepoUrl("https://gitlab.com/acme/widget/-/merge_requests/1/diffs"),
      ).toEqual({ platform: "gitlab", owner: "acme", repo: "widget" });
    });

    test("supports nested subgroups", () => {
      expect(
        parseRepoUrl(
          "https://gitlab.com/group/sub/leaf/widget/-/merge_requests/1",
        ),
      ).toEqual({
        platform: "gitlab",
        owner: "group/sub/leaf",
        repo: "widget",
      });
    });

    test("parses repo URL without the /-/ segment", () => {
      expect(parseRepoUrl("https://gitlab.com/acme/widget")).toEqual({
        platform: "gitlab",
        owner: "acme",
        repo: "widget",
      });
    });

    test("strips a .git suffix", () => {
      expect(parseRepoUrl("https://gitlab.com/acme/widget.git")).toEqual({
        platform: "gitlab",
        owner: "acme",
        repo: "widget",
      });
    });

    test("rejects reserved top-level paths", () => {
      expect(parseRepoUrl("https://gitlab.com/dashboard")).toBeNull();
      expect(parseRepoUrl("https://gitlab.com/explore")).toBeNull();
      expect(parseRepoUrl("https://gitlab.com/-/profile")).toBeNull();
    });

    test("rejects single-segment paths", () => {
      expect(parseRepoUrl("https://gitlab.com/acme")).toBeNull();
    });
  });

  test("returns null for non-supported hosts", () => {
    expect(parseRepoUrl("https://example.com/acme/widget")).toBeNull();
    expect(
      parseRepoUrl("https://raw.githubusercontent.com/acme/widget/HEAD"),
    ).toBeNull();
  });

  test("returns null for invalid URL", () => {
    expect(parseRepoUrl("not a url")).toBeNull();
  });
});
