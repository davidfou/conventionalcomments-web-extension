import type { ProductType } from "./types";
import type { ConventionConfig } from "./conventionSchema";
import { validateConvention } from "./conventionSchema";
import logger from "./logger";

interface RepositoryInfo {
  owner: string;
  repo: string;
}

/**
 * Cache for storing fetched conventions by repository
 * Key format: "owner/repo"
 */
const conventionCache = new Map<string, ConventionConfig | null>();

/**
 * Extracts repository information from the current URL
 */
function extractRepositoryInfo(productType: ProductType): RepositoryInfo | null {
  const url = window.location.href;
  
  if (productType.startsWith("github")) {
    // GitHub URL format: https://github.com/owner/repo/...
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  } else if (productType === "gitlab-v1") {
    // GitLab URL format: https://gitlab.com/owner/repo/...
    const match = url.match(/gitlab\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }
  
  return null;
}

/**
 * Constructs the raw file URL for the conventional-comments.json file
 */
function getConventionFileUrl(
  repoInfo: RepositoryInfo,
  productType: ProductType,
): string {
  if (productType.startsWith("github")) {
    // GitHub raw content URL
    return `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/HEAD/conventional-comments.json`;
  }
  // GitLab raw content URL
  return `https://gitlab.com/${repoInfo.owner}/${repoInfo.repo}/-/raw/HEAD/conventional-comments.json`;
}

/**
 * Fetches and validates the custom convention configuration from the repository
 * Returns null if the file doesn't exist or is invalid
 */
export async function fetchConventionConfig(
  productType: ProductType,
): Promise<ConventionConfig | null> {
  const repoInfo = extractRepositoryInfo(productType);
  
  if (!repoInfo) {
    logger("Could not extract repository info from URL");
    return null;
  }
  
  const cacheKey = `${repoInfo.owner}/${repoInfo.repo}`;
  
  // Check cache first
  if (conventionCache.has(cacheKey)) {
    logger("Using cached convention config for %s", cacheKey);
    return conventionCache.get(cacheKey) ?? null;
  }
  
  try {
    const fileUrl = getConventionFileUrl(repoInfo, productType);
    logger("Fetching convention config from %s", fileUrl);
    
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        logger("Convention file not found for %s", cacheKey);
        // Cache the negative result to avoid repeated fetches
        conventionCache.set(cacheKey, null);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const data = JSON.parse(text);
    
    if (!validateConvention(data)) {
      logger("Invalid convention config for %s", cacheKey);
      conventionCache.set(cacheKey, null);
      return null;
    }
    
    logger("Successfully loaded convention config for %s", cacheKey);
    conventionCache.set(cacheKey, data);
    return data;
  } catch (error) {
    logger("Error fetching convention config: %o", error);
    conventionCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Clears the convention cache
 * Useful for testing or when navigating to a different repository
 */
export function clearConventionCache(): void {
  conventionCache.clear();
}
