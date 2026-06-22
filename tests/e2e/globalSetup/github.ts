import { Octokit, RequestError } from "octokit";
import { Config } from "../config";
import {
  CONVENTION_FILE_PATH,
  INVALID_CONVENTION,
  VALID_CONVENTION,
} from "../conventionFixtures";

async function checkIfRepositoryExists(
  client: Octokit,
  username: string,
  project: string,
): Promise<boolean> {
  try {
    await client.rest.repos.get({
      owner: username,
      repo: project,
    });
    return true;
  } catch (error: unknown) {
    if (!(error instanceof RequestError) || error.status !== 404) {
      throw error;
    }
  }
  return false;
}

async function bootstrapRepo(
  client: Octokit,
  username: string,
  project: string,
  conventionContent: string | null,
): Promise<void> {
  if (await checkIfRepositoryExists(client, username, project)) {
    return;
  }

  // Repos that ship a `.conventional-comments.json` must be public so the
  // extension's same-origin fetch from a content script can read raw files
  // without an auth header.
  await client.rest.repos.createForAuthenticatedUser({
    name: project,
    private: conventionContent === null,
  });

  const { data } = await client.rest.repos.createOrUpdateFileContents({
    owner: username,
    repo: project,
    path: "README.md",
    content: Buffer.from("# Main title\n\nMy first line.\n").toString("base64"),
    message: "Initial commit",
  });
  if (data.commit.sha === undefined) {
    throw new Error("Expect sha to be defined on the commit");
  }
  if (data.content === null) {
    throw new Error("Expect content to be defined");
  }

  if (conventionContent !== null) {
    await client.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: project,
      path: CONVENTION_FILE_PATH,
      content: Buffer.from(conventionContent).toString("base64"),
      message: "Add conventional-comments config",
    });
  }

  await client.rest.git.createRef({
    owner: username,
    repo: project,
    ref: "refs/heads/new_branch",
    sha: data.commit.sha,
  });
  await client.rest.repos.createOrUpdateFileContents({
    owner: username,
    repo: project,
    path: "README.md",
    content: Buffer.from("# New title\n\nMy first line updated.\n").toString(
      "base64",
    ),
    branch: "new_branch",
    message: "Update doc",
    sha: data.content.sha,
  });
  await client.rest.pulls.create({
    owner: username,
    repo: project,
    head: "new_branch",
    base: "main",
    title: "Update doc",
  });
  await client.rest.issues.createComment({
    owner: username,
    repo: project,
    issue_number: 1,
    body: "My comment",
  });

  await client.rest.git.createRef({
    owner: username,
    repo: project,
    ref: "refs/heads/new_branch2",
    sha: data.commit.sha,
  });
  await client.rest.repos.createOrUpdateFileContents({
    owner: username,
    repo: project,
    path: "README.md",
    content: Buffer.from("# New title\n\nMy first line updated 2.\n").toString(
      "base64",
    ),
    branch: "new_branch2",
    message: "Update doc",
    sha: data.content.sha,
  });

  await client.rest.issues.create({
    owner: username,
    repo: project,
    title: "My first issue",
    body: "My first issue content",
  });
  await client.rest.issues.createComment({
    owner: username,
    repo: project,
    issue_number: 2,
    body: "My comment",
  });
}

export default async function globalSetup(config: Config): Promise<void> {
  const client = new Octokit({
    auth: config.token,
  });

  await Promise.all([
    bootstrapRepo(client, config.username, config.project, null),
    bootstrapRepo(
      client,
      config.username,
      config.projectConventionValid,
      JSON.stringify(VALID_CONVENTION, null, 2),
    ),
    bootstrapRepo(
      client,
      config.username,
      config.projectConventionInvalid,
      JSON.stringify(INVALID_CONVENTION, null, 2),
    ),
  ]);
}
