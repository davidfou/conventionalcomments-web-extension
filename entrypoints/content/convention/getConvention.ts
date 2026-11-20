import type { ConventionResult } from "./types";
import parseRepoUrl from "./parseRepoUrl";
import fetchConvention from "./fetchConvention";

const cache: Map<string, Promise<ConventionResult>> = new Map();
const warned: Set<string> = new Set();

function cacheKey(platform: string, owner: string, repo: string): string {
  return `${platform}:${owner}/${repo}`;
}

function getConvention(url: string): Promise<ConventionResult> {
  const key = parseRepoUrl(url);
  if (key === null) {
    return Promise.resolve({ status: "default" });
  }

  const k = cacheKey(key.platform, key.owner, key.repo);
  const existing = cache.get(k);
  if (existing !== undefined) {
    return existing;
  }

  const promise = fetchConvention(key).then((result) => {
    if (result.status === "invalid" && !warned.has(k)) {
      warned.add(k);
      // eslint-disable-next-line no-console
      console.warn(
        `[conventional-comments] invalid .conventional-comments.json in ${k}: ${result.reason}`,
      );
    }
    return result;
  });
  cache.set(k, promise);
  return promise;
}

function resetConventionCache(): void {
  cache.clear();
  warned.clear();
}

export default getConvention;
export { resetConventionCache };
