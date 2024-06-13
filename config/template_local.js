module.exports = {
  e2e: {
    gitlab: {
      username: "<% GitLab username %>",
      password: "<% GitLab password %>",
      project: "<% GitLab repo name (not created yet) %>",
      token: "<% GitLab access token with api scope (from the same user) %>",
      twoFactorSecret: "<% GitLab two-factor secret when 2FA is activated %>",
    },
    github: {
      username: "<% GitHub username %>",
      password: "<% GitHub password %>",
      project: "<% GitHub repo name (not created yet) %>",
      token: "<% GitHub access token with repo scope (from the same user) %>",
      twoFactorSecret: "<% GitHub two-factor secret when 2FA is activated %>",
    },
  },
};
