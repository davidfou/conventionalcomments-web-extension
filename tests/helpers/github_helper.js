const Helper = require("@codeceptjs/helper");
const config = require("config");
const { Octokit } = require("octokit");
const { recorder, output } = require("codeceptjs");

/* eslint-disable no-underscore-dangle */
class GithubHelper extends Helper {
  _beforeSuite() {
    if (this.api !== undefined) {
      return;
    }

    recorder.add("Setup test environment", async () => {
      this.api = new Octokit({ auth: config.get("codeceptjs.github.token") });

      try {
        await this.api.rest.repos.get({
          owner: config.get("codeceptjs.github.username"),
          repo: config.get("codeceptjs.github.project"),
        });
        output.print("Test environment already created");
        return;
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }

      output.print("Setting up environment");
      await this.api.rest.repos.createForAuthenticatedUser({
        name: config.get("codeceptjs.github.project"),
        private: true,
      });
      const { data } = await this.api.rest.repos.createOrUpdateFileContents({
        owner: config.get("codeceptjs.github.username"),
        repo: config.get("codeceptjs.github.project"),
        path: "README.md",
        content: Buffer.from("# Main title\n\nMy first line.\n").toString(
          "base64"
        ),
        message: "Initial commit",
      });
      await this.api.rest.git.createRef({
        owner: config.get("codeceptjs.github.username"),
        repo: config.get("codeceptjs.github.project"),
        ref: "refs/heads/new_branch",
        sha: data.commit.sha,
      });
      await this.api.rest.repos.createOrUpdateFileContents({
        owner: config.get("codeceptjs.github.username"),
        repo: config.get("codeceptjs.github.project"),
        path: "README.md",
        content: Buffer.from(
          "# New title\n\nMy first line updated.\n"
        ).toString("base64"),
        branch: "new_branch",
        message: "Update doc",
        sha: data.content.sha,
      });
      await this.api.rest.pulls.create({
        owner: config.get("codeceptjs.github.username"),
        repo: config.get("codeceptjs.github.project"),
        head: "new_branch",
        base: "main",
        title: "Update doc",
      });
    });
  }

  async removeAllThreads() {
    const { data: comments } = await this.api.rest.pulls.listReviewComments({
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      pull_number: 1,
    });
    await Promise.all(
      comments.map(({ id }) =>
        this.api.rest.pulls.deleteReviewComment({
          owner: config.get("codeceptjs.github.username"),
          repo: config.get("codeceptjs.github.project"),
          comment_id: id,
        })
      )
    );
  }

  async createThread(comments, oldLine, newLine) {
    const [baseComment, ...replies] = comments;

    const {
      data: [commit],
    } = await this.api.rest.pulls.listCommits({
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      pull_number: 1,
    });
    const { data: comment } = await this.api.rest.pulls.createReviewComment({
      owner: config.get("codeceptjs.github.username"),
      repo: config.get("codeceptjs.github.project"),
      pull_number: 1,
      path: "README.md",
      commit_id: commit.sha,
      body: baseComment,
      line: oldLine ?? newLine,
      side: oldLine !== null ? "LEFT" : "RIGHT",
    });

    const noteIds = [comment.id];
    await replies.reduce(async (currentRequest, body) => {
      await currentRequest;
      return this.api.rest.pulls
        .createReviewComment({
          owner: config.get("codeceptjs.github.username"),
          repo: config.get("codeceptjs.github.project"),
          pull_number: 1,
          body,
          in_reply_to: comment.id,
        })
        .then(({ data: { id } }) => noteIds.push(id));
    }, Promise.resolve());

    return { id: noteIds[0], noteIds };
  }
}

module.exports = GithubHelper;
