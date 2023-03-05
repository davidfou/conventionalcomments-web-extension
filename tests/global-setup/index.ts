import githubGlobalSetup from "./github";
import gitlabGlobalSetup from "./gitlab";

const getGlobalSetup = (product: string) => {
  switch (product) {
    case "github":
      return githubGlobalSetup;
    case "gitlab":
      return gitlabGlobalSetup;
    default:
      throw new Error(`Global setup not implemented for ${product}`);
  }
};

export default getGlobalSetup;
