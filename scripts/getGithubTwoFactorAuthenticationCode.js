const { authenticator } = require("otplib");
const config = require("config");

// eslint-disable-next-line no-console
console.log(
  authenticator.generate(config.get("codeceptjs.github.twoFactorSecret"))
);
