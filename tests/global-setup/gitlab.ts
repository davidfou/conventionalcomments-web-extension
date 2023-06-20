import config from "config";
import { Gitlab } from "@gitbeaker/node";
import { HTTPError } from "got";

const globalSetup = async () => {
  const client = new Gitlab({
    token: config.get<string>("codeceptjs.gitlab.token"),
  });
  const projectName = config.get<string>("codeceptjs.gitlab.project");
  const projectPath = [
    config.get<string>("codeceptjs.gitlab.username"),
    projectName,
  ].join("/");

  try {
    await client.Projects.show(projectPath);
    return;
  } catch (error) {
    if (!(error instanceof HTTPError) || error.code !== "404") {
      throw error;
    }
  }

  await client.Projects.create({ name: projectName });
  await client.RepositoryFiles.create(
    projectPath,
    "README.md",
    "master",
    "# Main title\n\nMy first line.\n",
    "Initial commit"
  );

  await client.RepositoryFiles.edit(
    projectPath,
    "README.md",
    "new_branch",
    "# New title\n\nMy first line updated.\n",
    "Update doc",
    {
      start_branch: "master",
    }
  );
  await client.MergeRequests.create(
    projectPath,
    "new_branch",
    "master",
    "Update doc"
  );
  await client.MergeRequestNotes.create(projectPath, 1, "My comment");

  await client.RepositoryFiles.edit(
    projectPath,
    "README.md",
    "new_branch2",
    "# New title\n\nMy first line updated 2.\n",
    "Update doc",
    {
      start_branch: "master",
    }
  );

  await client.Issues.create(projectPath, {
    title: "My first issue",
    description: "My first issue content",
  });
  await client.IssueNotes.create(projectPath, 1, "My comment");
};

export default globalSetup;
