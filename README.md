# conventionalcomments-web-ext

Browser extension which brings [conventionalcomments](https://conventionalcomments.org/) into GitLab and GitHub.

## Installation

Firefox: https://addons.mozilla.org/de/firefox/addon/conventional-comments/  
Chrome: https://chrome.google.com/webstore/detail/conventional-comments/pagggmojbbphjnpcjeeniigdkglamffk

## How to contribute

### Run the development build

1. Install dependencies by running `npm i`
1. Run `npm dev` (it will open Firefox with the extension installed)

### Run the tests

1. Create a new GitLab and GitHub users (it's recommmended using a user without personal information)
1. Copy `config/template_local.js` to `config/local.js` and replace all values
1. Activate the 2FA authentication
   1. Run `npm 2fa-code` an paste the code printed into the field in GitHub
   1. Finalize the 2FA
1. Run `npm test` to run unit tests
1. Run `npx playwright test --ui` to run end-to-end tests

### Update the screenshots for visual regression tests

Unfortunately, the screenshots made locally are not the same as the ones made in the CI. It's possible to retrieve them from GitHub Actions when the visual tests failed. Running the command `npm update-screenshots` allows to download the screenshots from a specific run. Then, push it and the tests should pass.

### Build the extension

1. Run `npm build`
1. Check folder `web-ext-artifacts`
