import type { Page } from "@playwright/test";

import GithubPage from "./GitHubPage";
import type AbstractPage from "./AbstractPage";

const getMainPage = (page: Page, product: string): AbstractPage => {
  switch (product) {
    case "github":
      return new GithubPage(page);
    default:
      throw new Error(`Page for ${product} not implemented`);
  }
};

export default getMainPage;
export { AbstractPage };
