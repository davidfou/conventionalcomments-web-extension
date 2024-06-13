import { authenticator } from "otplib";
import select from "@inquirer/select";
import config from "config";

const platform = await select({
  message: "Select platform",
  choices: [
    {
      name: "GitHub",
      value: "github",
    },
    {
      name: "GitLab",
      value: "gitlab",
    },
  ],
});

// eslint-disable-next-line no-console
console.log(
  authenticator.generate(config.get(`e2e.${platform}.twoFactorSecret`))
);
