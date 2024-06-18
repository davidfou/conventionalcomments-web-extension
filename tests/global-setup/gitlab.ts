import config from "config";
import { Gitlab } from "@gitbeaker/rest";
import { z } from "zod";

const globalSetup = async () => {
  const client = new Gitlab({
    token: config.get<string>("e2e.gitlab.token"),
  });
  const projectName = config.get<string>("e2e.gitlab.project");
  const projectPath = [
    config.get<string>("e2e.gitlab.username"),
    projectName,
  ].join("/");

  try {
    await client.Projects.show(projectPath);
    return;
  } catch (error) {
    const schema = z.object({
      cause: z.object({ response: z.instanceof(Response) }),
    });
    const result = schema.safeParse(error);
    if (!result.success || result.data.cause.response.status !== 404) {
      throw error;
    }
  }

  await client.Projects.create({ name: projectName });
  await client.RepositoryFiles.create(
    projectPath,
    "README.md",
    "master",
    "# Main title\n\nMy first line.\n",
    "Initial commit",
  );

  await client.RepositoryFiles.edit(
    projectPath,
    "README.md",
    "new_branch",
    "# New title\n\nMy first line updated.\n",
    "Update doc",
    {
      startBranch: "master",
    },
  );
  await client.MergeRequests.create(
    projectPath,
    "new_branch",
    "master",
    "Update doc",
  );
  await client.MergeRequestNotes.create(projectPath, 1, "My comment");

  await client.RepositoryFiles.edit(
    projectPath,
    "README.md",
    "new_branch2",
    "# New title\n\nMy first line updated 2.\n",
    "Update doc",
    {
      startBranch: "master",
    },
  );

  await client.Issues.create(projectPath, "My first issue", {
    description: "My first issue content",
  });
  await client.IssueNotes.create(projectPath, 1, "My comment");
};

export default globalSetup;
