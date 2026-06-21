import type { ConventionResult, RepoKey } from "./types";
import { validateConvention } from "./schema";

const CONFIG_FILE = ".conventional-comments.json";

function buildRawUrl(key: RepoKey): string {
  if (key.platform === "github") {
    return `https://github.com/${key.owner}/${key.repo}/raw/HEAD/${CONFIG_FILE}`;
  }
  return `https://gitlab.com/${key.owner}/${key.repo}/-/raw/HEAD/${CONFIG_FILE}`;
}

async function fetchConvention(key: RepoKey): Promise<ConventionResult> {
  const url = buildRawUrl(key);
  let response: Response;
  try {
    response = await fetch(url, { credentials: "omit" });
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
export { buildRawUrl };
