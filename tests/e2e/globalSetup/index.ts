import { Config } from "../config";
import { Product } from "../types";
import githubGlobalSetup from "./github";
import gitlabGlobalSetup from "./gitlab";

export default function getGlobalSetup(
  product: Product,
): (config: Config) => Promise<void> {
  switch (product) {
    case "github":
      return githubGlobalSetup;
    case "gitlab":
      return gitlabGlobalSetup;
  }
}
