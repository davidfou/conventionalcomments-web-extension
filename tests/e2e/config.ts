import dotenv from "dotenv";
import path from "node:path";
import { Product } from "./types";

function getPath(file: string): string {
  return path.join(import.meta.dirname, file);
}

dotenv.config({
  path: (process.env.CI ? [".env.ci", ".env"] : [".env.local", ".env"]).map(
    (file) => getPath(file),
  ),
});

export interface Config {
  baseUrl: string;
  username: string;
  password: string;
  token: string;
  project: string;
  twoFactorSecret: string;
  mainPageUrl: string;
  overviewPageUrl: string;
  issuePageUrl: string;
  newPullRequestPageUrl: string;
  newIssuePageUrl: string;
}

function getEnvValue(product: Product, version: number, key: string): string {
  const envKey = `E2E_${product.toUpperCase()}_V${version}_${key}`;
  const value = process.env[envKey];
  if (value === undefined || value === "") {
    throw new Error(`Environment variable ${envKey} is not set`);
  }
  return value;
}

function getUrls(
  product: Product,
  version: number,
  username: string,
  project: string,
): {
  baseUrl: string;
  mainPageUrl: string;
  overviewPageUrl: string;
  issuePageUrl: string;
  newPullRequestPageUrl: string;
  newIssuePageUrl: string;
} {
  switch (product) {
    case "github":
      return {
        baseUrl: "https://github.com",
        mainPageUrl: `/${username}/${project}/pull/1/${version === 1 ? "files" : "changes"}`,
        overviewPageUrl: `/${username}/${project}/pull/1`,
        issuePageUrl: `/${username}/${project}/issues/2`,
        newPullRequestPageUrl: `/${username}/${project}/compare/new_branch2?expand=1`,
        newIssuePageUrl: `/${username}/${project}/issues/new`,
      };
    case "gitlab":
      return {
        baseUrl: "https://gitlab.com",
        mainPageUrl: `/${username}/${project}/-/merge_requests/1/diffs`,
        overviewPageUrl: `/${username}/${project}/-/merge_requests/1`,
        issuePageUrl: `/${username}/${project}/-/issues/1`,
        newPullRequestPageUrl: `/${username}/${project}/-/merge_requests/new?merge_request[source_branch]=new_branch2`,
        newIssuePageUrl: `/${username}/${project}/-/issues/new`,
      };
  }
}

export function getConfig(product: Product, version: number): Config {
  const baseConfig = {
    username: getEnvValue(product, version, "USERNAME"),
    password: getEnvValue(product, version, "PASSWORD"),
    token: getEnvValue(product, version, "TOKEN"),
    project: getEnvValue(product, version, "PROJECT"),
    twoFactorSecret: getEnvValue(product, version, "TWO_FACTOR_SECRET"),
  };

  return {
    ...baseConfig,
    ...getUrls(product, version, baseConfig.username, baseConfig.project),
  };
}
