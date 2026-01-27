import type { ProductType, SelectableItem } from "./types";
import { LABELS, DECORATIONS, EMPTY_LABEL } from "./constants";
import { fetchConventionConfig } from "./fetchConvention";
import logger from "./logger";

interface ConventionData {
  labels: readonly SelectableItem[];
  decorations: readonly SelectableItem[];
}

/**
 * Gets the convention data for the current repository
 * Fetches custom convention from repository if available, otherwise returns defaults
 */
export async function getConventions(
  productType: ProductType,
): Promise<ConventionData> {
  const customConfig = await fetchConventionConfig(productType);

  if (customConfig === null) {
    logger("Using default conventions");
    return {
      labels: LABELS,
      decorations: DECORATIONS,
    };
  }

  logger("Using custom conventions");

  // Build the labels array - always include "none" as first item if custom labels are provided
  const labels: SelectableItem[] = [];
  
  if (customConfig.labels && customConfig.labels.length > 0) {
    // Add the "none" label as the first item
    labels.push(LABELS[0]); // "none" label is always the first in defaults
    labels.push(...customConfig.labels);
  } else {
    // If no custom labels, use defaults
    labels.push(...LABELS);
  }

  // Use custom decorations or default decorations
  const decorations: SelectableItem[] =
    customConfig.decorations && customConfig.decorations.length > 0
      ? [...customConfig.decorations]
      : [...DECORATIONS];

  return {
    labels,
    decorations,
  };
}

export { EMPTY_LABEL };
