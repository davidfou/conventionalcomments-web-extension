export interface ConventionItem {
  label: string;
  description: string;
}

export interface ConventionConfig {
  labels?: ConventionItem[];
  decorations?: ConventionItem[];
}

/**
 * JSON Schema for validating conventional-comments.json file
 */
export const CONVENTION_SCHEMA = {
  type: "object",
  properties: {
    labels: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: {
            type: "string",
            minLength: 1,
          },
          description: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["label", "description"],
        additionalProperties: false,
      },
    },
    decorations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: {
            type: "string",
            minLength: 1,
          },
          description: {
            type: "string",
            minLength: 1,
          },
        },
        required: ["label", "description"],
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;

/**
 * Validates a convention configuration against the schema
 */
export function validateConvention(data: unknown): data is ConventionConfig {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const config = data as Record<string, unknown>;

  // Check if it has at least labels or decorations
  if (!("labels" in config) && !("decorations" in config)) {
    return false;
  }

  // Validate labels if present
  if ("labels" in config) {
    if (!Array.isArray(config.labels)) {
      return false;
    }
    for (const item of config.labels) {
      if (!isValidItem(item)) {
        return false;
      }
    }
  }

  // Validate decorations if present
  if ("decorations" in config) {
    if (!Array.isArray(config.decorations)) {
      return false;
    }
    for (const item of config.decorations) {
      if (!isValidItem(item)) {
        return false;
      }
    }
  }

  // Check for additional properties
  const allowedKeys = new Set(["labels", "decorations"]);
  for (const key of Object.keys(config)) {
    if (!allowedKeys.has(key)) {
      return false;
    }
  }

  return true;
}

function isValidItem(item: unknown): item is ConventionItem {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const obj = item as Record<string, unknown>;

  // Check required properties
  if (!("label" in obj) || !("description" in obj)) {
    return false;
  }

  // Check types and values
  if (typeof obj.label !== "string" || obj.label.length === 0) {
    return false;
  }

  if (typeof obj.description !== "string" || obj.description.length === 0) {
    return false;
  }

  // Check for additional properties
  const allowedKeys = new Set(["label", "description"]);
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.has(key)) {
      return false;
    }
  }

  return true;
}
