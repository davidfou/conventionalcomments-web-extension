# conventionalcomments-web-ext

Browser extension which brings [conventionalcomments](https://conventionalcomments.org/) into GitLab.

## How to contribute

### Run the development build

1. Install dependencies by running `yarn`
1. Run `yarn dev` (it will open Firefox with the extension installed)

### Run the tests

1. Create a new GitLab user (it's recommmended using a user without personal information)
1. Copy `config/template_local.js` to `config/local.js` and replace all values
1. Run `yarn test` to run unit tests
1. Run `yarn codeceptjs` to run end-to-end tests

### Build the extension

1. Run `yarn build`
1. Check folder `web-ext-artifacts`
