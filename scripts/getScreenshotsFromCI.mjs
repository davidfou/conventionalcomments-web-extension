import config from "config";
import { Octokit } from "octokit";
import select from "@inquirer/select";
import yauzl from "yauzl";
import { pipeline } from "node:stream/promises";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import os from "node:os";
import { promisify } from "node:util";

let outDir = null;
const basePayload = {
  owner: "davidfou",
  repo: "conventionalcomments-web-extension",
};
try {
  outDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "conventionalcomments-web-extension-")
  );
  const client = new Octokit({ auth: config.get("e2e.github.token") });
  const workflowRuns = await client.rest.actions
    .listWorkflowRuns({
      ...basePayload,
      workflow_id: "playwright.yml",
      per_page: 5,
    })
    .then((body) => body.data.workflow_runs);

  const workflowRunId = await select({
    message: "Select workflow run",
    choices: workflowRuns.map((workflowRun) => ({
      name: `#${workflowRun.run_number} ${workflowRun.head_branch} (${workflowRun.created_at})`,
      value: workflowRun.id,
      disabled: workflowRun.status !== "completed",
    })),
  });

  const artifacts = await client.rest.actions
    .listWorkflowRunArtifacts({
      ...basePayload,
      run_id: workflowRunId,
    })
    .then((body) => body.data.artifacts);

  await Promise.all(
    artifacts.map(async (artifact) => {
      const filename = path.join(outDir, `${artifact.name}.zip`);
      const { data } = await client.rest.actions.downloadArtifact({
        ...basePayload,
        artifact_id: artifact.id,
        archive_format: "zip",
        request: {
          parseSuccessResponseBody: false,
        },
      });
      await pipeline(data, createWriteStream(filename));
      return new Promise((resolve, reject) => {
        yauzl.open(filename, { lazyEntries: true }, (err, zipfile) => {
          if (err) {
            reject(err);
            return;
          }
          zipfile.on("entry", async (entry) => {
            if (
              entry.fileName.at(-1) === -1 ||
              !entry.fileName.startsWith("test-results/") ||
              !entry.fileName.endsWith("-actual.png")
            ) {
              zipfile.readEntry();
              return;
            }

            const fileNameParts = entry.fileName.split("/");
            const destFilename = path.join(
              ...[
                process.cwd(),
                "tests",
                "visual.spec.ts-snapshots",
                ...fileNameParts.slice(-3, -1),
                `${fileNameParts
                  .at(-1)
                  .replace("-actual.png", "")}-${fileNameParts.at(
                  -3
                )}-linux.png`,
              ]
            );
            const stream = await promisify(
              zipfile.openReadStream.bind(zipfile)
            )(entry);
            await pipeline(stream, createWriteStream(destFilename));
            zipfile.readEntry();
          });
          zipfile.on("error", (error) => {
            reject(error);
          });
          zipfile.on("close", () => {
            resolve();
          });
          zipfile.readEntry();
        });
      });
    })
  );
} catch (error) {
  process.exitCode = 1;
  console.error(error);
} finally {
  if (outDir !== null) {
    await fs.rm(outDir, { recursive: true });
  }
}
