import type { BrowserContext } from "@playwright/test";
import invariant from "tiny-invariant";
import { AbstractMainPage } from "./AbstractMainPage";

// TODO: implement all the methods

export default class AzureDevOpsV1 extends AbstractMainPage<"azure-devops"> {
  async login(): Promise<BrowserContext | null> {
    await this.page.goto("https://login.live.com");
    invariant(
      this.page.url().startsWith("https://account.microsoft.com/"),
      "Authenticate user by running the script devScripts/getAzureDevOpsCookies.ts",
    );
    return null;
  }

  removeAllThreads() {
    return Promise.reject(new Error("Not implemented"));
  }

  createThread() {
    return Promise.reject(new Error("Not implemented"));
  }

  retrievePullRequestCommentIds() {
    return Promise.reject(new Error("Not implemented"));
  }

  retrieveIssueCommentIds() {
    return Promise.reject(new Error("Not implemented"));
  }

  getThreadContainerImpl() {
    throw new Error("Not implemented");
    // oxlint-disable-next-line no-unreachable
    return this.page.locator("*");
  }

  getMessageContainerImpl() {
    throw new Error("Not implemented");
    // oxlint-disable-next-line no-unreachable
    return this.page.locator("*");
  }

  getReplyInputLocatorImpl() {
    throw new Error("Not implemented");
    // oxlint-disable-next-line no-unreachable
    return this.page.locator("*");
  }

  getChangesSelector() {
    throw new Error("Not implemented");
    // oxlint-disable-next-line no-unreachable
    return this.page.locator("*");
  }

  getOverviewSelector() {
    throw new Error("Not implemented");
    // oxlint-disable-next-line no-unreachable
    return this.page.locator("*");
  }

  getPreviewButtonSelector() {
    throw new Error("Not implemented");
    // oxlint-disable-next-line no-unreachable
    return this.page.locator("*");
  }

  getWriteButtonSelector() {
    throw new Error("Not implemented");
    // oxlint-disable-next-line no-unreachable
    return this.page.locator("*");
  }

  getNewCommentEditorLocator() {
    throw new Error("Not implemented");
    // oxlint-disable-next-line no-unreachable
    return this.page.locator("*");
  }

  editCommentImpl() {
    return Promise.reject(new Error("Not implemented"));
  }

  editMainCommentFromPullRequestPageImpl() {
    return Promise.reject(new Error("Not implemented"));
  }

  editCommentFromPullRequestPageImpl() {
    return Promise.reject(new Error("Not implemented"));
  }

  editMainCommentFromIssuePage() {
    return Promise.reject(new Error("Not implemented"));
  }

  editCommentFromIssuePageImpl() {
    return Promise.reject(new Error("Not implemented"));
  }

  openNewThread() {
    return Promise.reject(new Error("Not implemented"));
  }

  openNewFileThread() {
    return Promise.reject(new Error("Not implemented"));
  }

  waitPageIsReady() {
    return Promise.reject(new Error("Not implemented"));
  }

  getAvailableThemes() {
    return Promise.reject(new Error("Not implemented"));
  }

  selectTheme() {
    return Promise.reject(new Error("Not implemented"));
  }
}
