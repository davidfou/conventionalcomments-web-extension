import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import os from "node:os";
import { promisify } from "node:util";
import { Octokit } from "octokit";
import select, { Separator } from "@inquirer/select";
import yauzl from "yauzl";
import fs from "node:fs/promises";
import invariant from "tiny-invariant";
import maxBy from "lodash.maxby";
import { Product, projects } from "~/tests/e2e/types";
import pDefer from "p-defer";
import type Stream from "node:stream";

const basePayload = {
  owner: "davidfou",
  repo: "conventionalcomments-web-extension",
};

async function getArchiveFile(
  client: Octokit,
  outDir: string,
  artifactId: number,
): Promise<yauzl.ZipFile> {
  const filename = path.join(outDir, `${crypto.randomUUID()}.zip`);
  const { data } = await client.rest.actions.downloadArtifact({
    ...basePayload,
    artifact_id: artifactId,
    archive_format: "zip",
    request: {
      parseSuccessResponseBody: false,
    },
  });
  invariant(data instanceof ReadableStream);
  await pipeline(data, createWriteStream(filename));
  return new Promise<yauzl.ZipFile>((resolve, reject) => {
    yauzl.open(filename, { lazyEntries: true }, (err, zipfile) => {
      if (err !== null) {
        reject(err);
        return;
      }
      resolve(zipfile);
    });
  });
}

async function* getArchiveFiles(zipfile: yauzl.ZipFile): AsyncGenerator<{
  entry: yauzl.Entry;
  getFileStream: () => Promise<Stream.Readable>;
}> {
  let defferedPromise = pDefer<yauzl.Entry | null>();

  zipfile.on("entry", (entry) => {
    defferedPromise.resolve(entry);
    defferedPromise = pDefer<yauzl.Entry | null>();
  });

  zipfile.on("end", () => {
    defferedPromise.resolve(null);
  });

  zipfile.on("error", (error) => {
    defferedPromise.reject(error);
  });

  while (true) {
    zipfile.readEntry();
    const entry = await defferedPromise.promise;
    if (entry === null) {
      return;
    }
    yield {
      entry,
      getFileStream: (): Promise<Stream.Readable> =>
        promisify(zipfile.openReadStream.bind(zipfile))(entry),
    };
  }
}

async function extractScreenshotsFromArtifact(
  client: Octokit,
  outDir: string,
  project: { product: Product; version: number },
  artifactId: number,
): Promise<void> {
  const zipfile = await getArchiveFile(client, outDir, artifactId);
  for await (const { entry, getFileStream } of getArchiveFiles(zipfile)) {
    const endFile = "-actual.png";
    if (
      !entry.fileName.startsWith("test-results/") ||
      !entry.fileName.endsWith(endFile)
    ) {
      continue;
    }
    const fileNameParts = entry.fileName.split("/").slice(-2);
    const theme = fileNameParts.at(0);
    const filename = fileNameParts.at(1);
    invariant(theme !== undefined && filename !== undefined);
    const destFilename = path.join(
      process.cwd(),
      "tests",
      "e2e",
      "__screenshots__",
      `${project.product}-v${project.version}`,
      theme,
      filename.slice(0, -endFile.length) + `.png`,
    );
    const stream = await getFileStream();
    await pipeline(stream, createWriteStream(destFilename));
  }
}

let outDir: string | null = null;

const GIHUB_TOKEN = process.env.GITHUB_TOKEN;
invariant(
  GIHUB_TOKEN !== undefined,
  "GITHUB_TOKEN env variable is not defined",
);

const WORKFLOWS = ["schedule.yml", "ci.yml"];

try {
  outDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "conventionalcomments-web-extension-"),
  );
  const client = new Octokit({ auth: GIHUB_TOKEN });
  const workflows = (
    await Promise.all(
      WORKFLOWS.map((workflowFile) =>
        client.rest.actions.listWorkflowRuns({
          ...basePayload,
          workflow_id: workflowFile,
          per_page: 5,
        }),
      ),
    )
  )
    .map((body) => body.data.workflow_runs)
    .map((workflows) =>
      workflows.toSorted(
        (workflowA, workflowB) =>
          Date.parse(workflowB.created_at) - Date.parse(workflowA.created_at),
      ),
    );

  const workflowRunId = await select({
    message: "Select workflow run",
    loop: false,
    choices: workflows.flatMap((workflowRuns) => {
      const firstWorkflowRun = workflowRuns.at(0);
      if (firstWorkflowRun === undefined) {
        return [];
      }
      return [
        new Separator(firstWorkflowRun.name ?? undefined),
        ...workflowRuns.map((workflowRun) => ({
          name: `#${workflowRun.run_number} ${workflowRun.head_branch} (${workflowRun.created_at})`,
          value: workflowRun.id,
          disabled: workflowRun.status !== "completed",
        })),
      ];
    }),
  });

  const artifacts = await client.rest.actions
    .listWorkflowRunArtifacts({
      ...basePayload,
      run_id: workflowRunId,
    })
    .then((body) => body.data.artifacts);

  const latestArtifacts = projects
    .map((project) => {
      const artifact = maxBy(
        artifacts.filter(
          (artifact) =>
            artifact.name ===
            `playwright-report-e2e-${project.product}-v${project.version}`,
        ),
        (artifact) => artifact.created_at,
      );
      return artifact === undefined
        ? null
        : { project, artifactId: artifact.id };
    })
    .filter((latestArtifact) => latestArtifact !== null);

  await Promise.all(
    latestArtifacts.map(async ({ project, artifactId }) => {
      invariant(outDir !== null);
      await extractScreenshotsFromArtifact(client, outDir, project, artifactId);
    }),
  );
} catch (error) {
  process.exitCode = 1;
  console.error(error);
} finally {
  if (outDir !== null) {
    await fs.rm(outDir, { recursive: true });
  }
}
