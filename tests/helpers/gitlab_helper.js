const Helper = require("@codeceptjs/helper");
const config = require("config");
const { Gitlab } = require("@gitbeaker/node");
const { recorder, output } = require("codeceptjs");

/* eslint-disable no-underscore-dangle */
class GitlabHelper extends Helper {
  async _beforeSuite() {
    if (this.api !== undefined) {
      return;
    }

    recorder.add("Setup test environment", async () => {
      this.api = new Gitlab({ token: config.get("codeceptjs.gitlab.token") });
      const projectName = config.get("codeceptjs.gitlab.project");
      this.projectPath = [
        config.get("codeceptjs.gitlab.username"),
        projectName,
      ].join("/");

      try {
        await this.api.Projects.show(this.projectPath);
        output.print("Test environment already created");
        return;
      } catch (error) {
        if (error.description !== "404 Project Not Found") {
          throw error;
        }
      }

      output.print("Setting up environment");
      await this.api.Projects.create({ name: projectName });
      await this.api.RepositoryFiles.create(
        this.projectPath,
        "README.md",
        "master",
        "# Main title\n\nMy first line.\n",
        "Initial commit"
      );

      await this.api.RepositoryFiles.edit(
        this.projectPath,
        "README.md",
        "new_branch",
        "# New title\n\nMy first line updated.\n",
        "Update doc",
        {
          start_branch: "master",
        }
      );
      await this.api.MergeRequests.create(
        this.projectPath,
        "new_branch",
        "master",
        "Update doc"
      );
    });
  }

  async removeAllThreads() {
    const notes = await this.api.MergeRequestNotes.all(this.projectPath, 1);
    await Promise.all(
      notes.map(({ id }) =>
        this.api.MergeRequestNotes.remove(this.projectPath, 1, id)
      )
    );
  }

  async createThread(comments, oldLine, newLine) {
    const [baseComment, ...noteComments] = comments;
    const mergeRequest = await this.api.MergeRequests.show(this.projectPath, 1);

    const discussion = await this.api.MergeRequestDiscussions.create(
      this.projectPath,
      1,
      baseComment,
      {
        position: {
          ...mergeRequest.diff_refs,
          old_path: "README.md",
          new_path: "README.md",
          position_type: "text",
          old_line: oldLine,
          new_line: newLine,
        },
      }
    );

    const noteIds = [discussion.notes[0].id];
    await noteComments.reduce(async (currentRequest, content) => {
      const previousNoteId = await currentRequest;
      return this.api.MergeRequestDiscussions.addNote(
        this.projectPath,
        1,
        discussion.id,
        previousNoteId,
        content
      ).then(({ id }) => {
        noteIds.push(id);
        return id;
      });
    }, Promise.resolve(discussion.notes[0].id));

    return { id: discussion.id, noteIds };
  }
}

module.exports = GitlabHelper;
