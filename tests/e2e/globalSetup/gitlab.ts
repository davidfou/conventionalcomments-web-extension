import { Gitlab } from "@gitbeaker/rest";
import { z } from "zod";
import { Config } from "../config";
import {
  CONVENTION_FILE_PATH,
  INVALID_CONVENTION,
  VALID_CONVENTION,
} from "../conventionFixtures";

async function checkIfRepositoryExists(
  client: InstanceType<typeof Gitlab<false>>,
  projectPath: string,
): Promise<boolean> {
  try {
    await client.Projects.show(projectPath);
    return true;
  } catch (error) {
    const schema = z.object({
      cause: z.object({ response: z.instanceof(Response) }),
    });
    const result = schema.safeParse(error);
    if (!result.success || result.data.cause.response.status !== 404) {
      throw error;
    }
  }
  return false;
}

async function bootstrapRepo(
  client: InstanceType<typeof Gitlab<false>>,
  username: string,
  projectName: string,
  conventionContent: string | null,
): Promise<void> {
  const projectPath = [username, projectName].join("/");
  if (await checkIfRepositoryExists(client, projectPath)) {
    return;
  }

  await client.Projects.create({ name: projectName });
  await client.RepositoryFiles.create(
    projectPath,
    "README.md",
    "master",
    "# Main title\n\nMy first line.\n",
    "Initial commit",
  );

  if (conventionContent !== null) {
    await client.RepositoryFiles.create(
      projectPath,
      CONVENTION_FILE_PATH,
      "master",
      conventionContent,
      "Add conventional-comments config",
    );
  }

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
}

export default async function globalSetup(config: Config): Promise<void> {
  const client = new Gitlab({ token: config.token });

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
