import { Page } from "@playwright/test";
import { Config } from "../config";
import GitHubPageV1 from "./GitHubPageV1";
import GitLabPageV1 from "./GitLabPageV1";
import GitHubPageV2 from "./GitHubPageV2";
import { Product } from "../types";
import { CommentsMap, ThreadMap } from "./types";

function getMainPage<P extends Product>(
  page: Page,
  product: P,
  version: number,
  config: Config,
) {
  switch (`${product}-v${version}`) {
    case "github-v1":
      return new GitHubPageV1(page, config);
    case "github-v2":
      return new GitHubPageV2(page, config);
    case "gitlab-v1":
      return new GitLabPageV1(page, config);
    default:
      throw new Error(
        `Unsupported product/version combination: ${product} v${version}`,
      );
  }
}

export type Thread = ThreadMap[Product];
export type Comments = CommentsMap[Product];
export type MainPage = ReturnType<typeof getMainPage>;

export default getMainPage;
