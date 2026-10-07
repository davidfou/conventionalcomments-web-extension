import { z, type ZodType } from "zod";
import type { ConventionFile } from "./types";
import { EMPTY_LABEL } from "./emptyLabel";

const selectableItemSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
});

const v1Schema: ZodType<ConventionFile> = z
  .object({
    $schema: z.string().optional(),
    version: z.literal(1),
    labels: z.array(selectableItemSchema).min(1),
    decorations: z.array(selectableItemSchema).default([]),
    defaultLabel: z.string().nullish(),
  })
  .superRefine((value, ctx) => {
    const labelNames = value.labels.map((item) => item.label);
    const seenLabels = new Set<string>();
    for (const name of labelNames) {
      if (name === EMPTY_LABEL) {
        ctx.addIssue({
          code: "custom",
          path: ["labels"],
          message: `"${EMPTY_LABEL}" is reserved and cannot be used as a label name`,
        });
      }
      if (seenLabels.has(name)) {
        ctx.addIssue({
          code: "custom",
          path: ["labels"],
          message: `Duplicate label "${name}"`,
        });
      }
      seenLabels.add(name);
    }

    const seenDecorations = new Set<string>();
    for (const item of value.decorations) {
      if (seenDecorations.has(item.label)) {
        ctx.addIssue({
          code: "custom",
          path: ["decorations"],
          message: `Duplicate decoration "${item.label}"`,
        });
      }
      seenDecorations.add(item.label);
    }

    if (
      value.defaultLabel !== undefined &&
      value.defaultLabel !== null &&
      !labelNames.includes(value.defaultLabel)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["defaultLabel"],
        message: `defaultLabel "${value.defaultLabel}" does not match any declared label`,
      });
    }
  })
  .transform(
    (value): ConventionFile => ({
      version: value.version,
      labels: value.labels,
      decorations: value.decorations,
      defaultLabel: value.defaultLabel ?? null,
    }),
  );

const VALIDATORS: Record<number, ZodType<ConventionFile>> = {
  1: v1Schema,
};

export type ValidationOutcome =
  | { ok: true; convention: ConventionFile }
  | { ok: false; reason: string };

function validateConvention(raw: unknown): ValidationOutcome {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, reason: "Convention must be a JSON object" };
  }

  const version = (raw as { version?: unknown }).version;
  if (typeof version !== "number") {
    return {
      ok: false,
      reason: `Convention is missing a numeric "version" field`,
    };
  }

  const validator = VALIDATORS[version];
  if (validator === undefined) {
    return {
      ok: false,
      reason: `Unsupported convention version: ${String(version)}`,
    };
  }

  const result = validator.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        return `${path}: ${issue.message}`;
      })
      .join("; ");
    return { ok: false, reason: issues };
  }

  return { ok: true, convention: result.data };
}

export { validateConvention, VALIDATORS };
