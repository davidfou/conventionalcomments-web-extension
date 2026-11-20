import type { RepoKey } from "./types";

const GITHUB_RESERVED_OWNERS = new Set([
  "settings",
  "notifications",
  "marketplace",
  "explore",
  "trending",
  "topics",
  "collections",
  "events",
  "new",
  "issues",
  "pulls",
  "discussions",
  "watching",
  "orgs",
  "organizations",
  "account",
  "search",
  "codespaces",
  "sponsors",
  "features",
  "pricing",
  "about",
  "security",
  "login",
  "logout",
  "join",
  "signup",
  "session",
]);

const GITLAB_RESERVED_TOP_LEVEL = new Set([
  "dashboard",
  "explore",
  "help",
  "profile",
  "admin",
  "users",
  "groups",
  "projects",
  "search",
  "snippets",
  "public",
  "-",
]);

function stripGitSuffix(name: string): string {
  return name.endsWith(".git") ? name.slice(0, -4) : name;
}

function parseRepoUrl(rawUrl: string): RepoKey | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const segments = url.pathname.split("/").filter((s) => s.length > 0);

  if (url.hostname === "github.com") {
    if (segments.length < 2) return null;
    const [owner, repo] = segments;
    if (GITHUB_RESERVED_OWNERS.has(owner)) return null;
    if (repo.length === 0) return null;
    return { platform: "github", owner, repo: stripGitSuffix(repo) };
  }

  if (url.hostname === "gitlab.com") {
    const dashIndex = segments.indexOf("-");
    const projectPath =
      dashIndex === -1 ? segments : segments.slice(0, dashIndex);
    if (projectPath.length < 2) return null;
    const [first] = projectPath;
    if (GITLAB_RESERVED_TOP_LEVEL.has(first)) return null;
    const repo = projectPath.at(-1);
    const owner = projectPath.slice(0, -1).join("/");
    if (repo === undefined || owner.length === 0 || repo.length === 0)
      return null;
    return { platform: "gitlab", owner, repo: stripGitSuffix(repo) };
  }

  return null;
}

export default parseRepoUrl;
