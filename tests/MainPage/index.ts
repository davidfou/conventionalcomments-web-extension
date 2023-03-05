import type { Page } from "@playwright/test";

import GithubPage from "./GitHubPage";
import GitLabPage from "./GitLabPage";

type MainPage = GithubPage | GitLabPage;

const getMainPage = (page: Page, product: string): MainPage => {
  switch (product) {
    case "github":
      return new GithubPage(page);
    case "gitlab":
      return new GitLabPage(page);
    default:
      throw new Error(`Page for ${product} not implemented`);
  }
};

export default getMainPage;
export type { MainPage };
