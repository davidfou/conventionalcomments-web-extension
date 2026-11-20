import type { ConventionResult, RepoKey } from "./types";
import { validateConvention } from "./schema";

const CONFIG_FILE = ".conventional-comments.json";

function buildFetchUrl(key: RepoKey): string {
  if (key.platform === "github") {
    return `https://api.github.com/repos/${key.owner}/${key.repo}/contents/${CONFIG_FILE}`;
  }
  const projectPath = encodeURIComponent(`${key.owner}/${key.repo}`);
  const filePath = encodeURIComponent(CONFIG_FILE);
  return `https://gitlab.com/api/v4/projects/${projectPath}/repository/files/${filePath}/raw?ref=HEAD`;
}

function buildFetchInit(key: RepoKey): RequestInit {
  if (key.platform === "github") {
    return {
      headers: { Accept: "application/vnd.github.raw" },
      credentials: "omit",
    };
  }
  return { credentials: "include" };
}

async function fetchConvention(key: RepoKey): Promise<ConventionResult> {
  const url = buildFetchUrl(key);
  let response: Response;
  try {
    response = await fetch(url, buildFetchInit(key));
  } catch {
    return { status: "default" };
  }

  if (response.status === 404) {
    return { status: "default" };
  }

  if (!response.ok) {
    return { status: "default" };
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch (error) {
    return {
      status: "invalid",
      reason: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const outcome = validateConvention(raw);
  if (!outcome.ok) {
    return { status: "invalid", reason: outcome.reason };
  }
  return { status: "custom", convention: outcome.convention };
}

export default fetchConvention;
export { buildFetchUrl };
