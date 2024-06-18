import config from "config";
import { Octokit } from "octokit";  
import { RequestError } from "@octokit/request-error";

const globalSetup = async () => {
  const client = new Octokit({
    auth: config.get<string>("e2e.github.token"),
  });

  try {
    await client.rest.repos.get({
      owner: config.get<string>("e2e.github.username"),
      repo: config.get<string>("e2e.github.project"),
    });
    return;
  } catch (error: unknown) {
    if (!(error instanceof RequestError) || error.status !== 404) {
      throw error;
    }
  }

  await client.rest.repos.createForAuthenticatedUser({
    name: config.get<string>("e2e.github.project"),
    private: true,
  });

  const { data } = await client.rest.repos.createOrUpdateFileContents({
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
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
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
    ref: "refs/heads/new_branch",
    sha: data.commit.sha,
  });
  await client.rest.repos.createOrUpdateFileContents({
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
    path: "README.md",
    content: Buffer.from("# New title\n\nMy first line updated.\n").toString(
      "base64",
    ),
    branch: "new_branch",
    message: "Update doc",
    sha: data.content.sha,
  });
  await client.rest.pulls.create({
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
    head: "new_branch",
    base: "main",
    title: "Update doc",
  });
  await client.rest.issues.createComment({
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
    issue_number: 1,
    body: "My comment",
  });

  await client.rest.git.createRef({
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
    ref: "refs/heads/new_branch2",
    sha: data.commit.sha,
  });
  await client.rest.repos.createOrUpdateFileContents({
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
    path: "README.md",
    content: Buffer.from("# New title\n\nMy first line updated 2.\n").toString(
      "base64",
    ),
    branch: "new_branch2",
    message: "Update doc",
    sha: data.content.sha,
  });

  await client.rest.issues.create({
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
    title: "My first issue",
    body: "My first issue content",
  });
  await client.rest.issues.createComment({
    owner: config.get<string>("e2e.github.username"),
    repo: config.get<string>("e2e.github.project"),
    issue_number: 2,
    body: "My comment",
  });
};

export default globalSetup;
