import githubGlobalSetup from "./github";

const getGlobalSetup = (product: string) => {
  switch (product) {
    case "github":
      return githubGlobalSetup;
    default:
      throw new Error(`Global setup not implemented for ${product}`);
  }
};

export default getGlobalSetup;
