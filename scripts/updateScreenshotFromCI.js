const config = require("config");
const inquirer = require("inquirer");
const autocomplete = require("inquirer-autocomplete-prompt");
const { Gitlab } = require("@gitbeaker/node");
const path = require("path");
const fs = require("fs");
const { pipeline } = require("stream/promises");

inquirer.registerPrompt("autocomplete", autocomplete);

const PROJECT = "davidfou/conventionalcomments-web-extension";

(async () => {
  const api = new Gitlab();

  const branches = await api.Branches.all(PROJECT);
  const { branch } = await inquirer.prompt([
    {
      type: "list",
      name: "branch",
      message: "Which branch?",
      choices: branches.map(({ name }) => ({ value: name, name })),
    },
  ]);

  const pipelines = await api.Pipelines.all(PROJECT, {
    ref: branch,
    order_by: "updated_at",
    sort: "desc",
    page: 1,
    perPage: 1,
  });
  if (pipelines.length !== 1) {
    throw new Error(`Expect 1 pipeline, got ${pipelines.length}`);
  }

  const pipelineJobs = await api.Jobs.showPipelineJobs(
    PROJECT,
    pipelines[0].id
  );
  const jobs = {
    gitlab: pipelineJobs.find(
      ({ stage, name }) => stage === "test" && name === "e2e-gitlab"
    ),
    github: pipelineJobs.find(
      ({ stage, name }) => stage === "test" && name === "e2e-github"
    ),
  };

  if (jobs.gitlab === undefined) {
    throw new Error("GitLab job not found");
  }
  if (jobs.github === undefined) {
    throw new Error("GitHub job not found");
  }

  await Promise.all(
    ["gitlab", "github"].map(async (product) => {
      const folder = path.join(__dirname, "../tests/screenshots", product);
      await Promise.all(
        config
          .get(`codeceptjs.${product}.themes`)
          .flatMap((theme) =>
            config.get("codeceptjs.screenshotNames").map((screenshotName) => ({
              theme: theme.replaceAll(/\W+/g, "-"),
              screenshotName,
            }))
          )
          .map(async ({ theme, screenshotName }) => {
            const filename = `${theme}-${screenshotName}.png`;
            const content = await api.Jobs.downloadSingleArtifactFile(
              PROJECT,
              jobs[product].id,
              `output/screenshots/${filename}`,
              { stream: true }
            );
            await pipeline(
              content,
              fs.createWriteStream(path.join(folder, filename))
            );
          })
      );
    })
  );
})().catch((error) => {
  if (error.constructor.name === "HTTPError") {
    const {
      request: {
        options: { method, url },
      },
      response: { statusCode, statusMessage },
    } = error;
    // eslint-disable-next-line no-console
    console.error(`[${method}] ${url} - ${statusCode} (${statusMessage})`);
  } else {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  process.exitCode = 1;
});
