import { Octokit, RequestError } from "octokit";
import { Config } from "../config";

async function checkIfRepositoryExists(
  client: Octokit,
  config: Config,
): Promise<boolean> {
  try {
    await client.rest.repos.get({
      owner: config.username,
      repo: config.project,
    });
    return true;
  } catch (error: unknown) {
    if (!(error instanceof RequestError) || error.status !== 404) {
      throw error;
    }
  }
  return false;
}

export default async function globalSetup(config: Config): Promise<void> {
  const client = new Octokit({
    auth: config.token,
  });

  if (await checkIfRepositoryExists(client, config)) {
    return;
  }

  await client.rest.repos.createForAuthenticatedUser({
    name: config.project,
    private: true,
  });

  const { data } = await client.rest.repos.createOrUpdateFileContents({
    owner: config.username,
    repo: config.project,
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
  await client.rest.git.createRef({
    owner: config.username,
    repo: config.project,
    ref: "refs/heads/new_branch",
    sha: data.commit.sha,
  });
  await client.rest.repos.createOrUpdateFileContents({
    owner: config.username,
    repo: config.project,
    path: "README.md",
    content: Buffer.from("# New title\n\nMy first line updated.\n").toString(
      "base64",
    ),
    branch: "new_branch",
    message: "Update doc",
    sha: data.content.sha,
  });
  await client.rest.pulls.create({
    owner: config.username,
    repo: config.project,
    head: "new_branch",
    base: "main",
    title: "Update doc",
  });
  await client.rest.issues.createComment({
    owner: config.username,
    repo: config.project,
    issue_number: 1,
    body: "My comment",
  });

  await client.rest.git.createRef({
    owner: config.username,
    repo: config.project,
    ref: "refs/heads/new_branch2",
    sha: data.commit.sha,
  });
  await client.rest.repos.createOrUpdateFileContents({
    owner: config.username,
    repo: config.project,
    path: "README.md",
    content: Buffer.from("# New title\n\nMy first line updated 2.\n").toString(
      "base64",
    ),
    branch: "new_branch2",
    message: "Update doc",
    sha: data.content.sha,
  });

  await client.rest.issues.create({
    owner: config.username,
    repo: config.project,
    title: "My first issue",
    body: "My first issue content",
  });
  await client.rest.issues.createComment({
    owner: config.username,
    repo: config.project,
    issue_number: 2,
    body: "My comment",
  });
}
