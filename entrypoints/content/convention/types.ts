export interface SelectableItem {
  label: string;
  description: string;
}

export interface ConventionFile {
  version: number;
  labels: SelectableItem[];
  decorations: SelectableItem[];
  defaultLabel: string | null;
}

export interface RepoKey {
  platform: "github" | "gitlab";
  owner: string;
  repo: string;
}

export type ConventionResult =
  | { status: "default" }
  | { status: "custom"; convention: ConventionFile }
  | { status: "invalid"; reason: string };
