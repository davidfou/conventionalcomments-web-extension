# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser web extension (Chrome & Firefox) that formats [conventional comments](https://conventionalcomments.org) in GitHub and GitLab pull/merge request review UIs. Built with React 19, TypeScript, WXT (web extension framework), Vite, and Tailwind CSS 4.

## Commands

Tasks live in `mise.toml` (and the publish/canary overlays). Run `mise install` once to provision the pinned tools (Node, pnpm, op); `pnpm install` reads `pnpm-lock.yaml` and the `wxt prepare` postinstall runs automatically.

```bash
mise tasks ls                # list every available task with descriptions
mise tasks info <task>       # show the command behind a single task
mise run <task> -- ...args   # run a task, optionally passing extra args
mise exec -- <cmd>           # run an arbitrary command with pinned tools on PATH
```

Anything not exposed as a task (e.g. a single unit test) goes through `mise exec --`, e.g. `mise exec -- pnpm vitest run entrypoints/content/formatComment.test.ts`.

## Architecture

The extension has three entry points following the Manifest V3 model:

- **`entrypoints/background/`** - Service worker that manages content script registration, icon state, storage migrations, and deactivated URLs
- **`entrypoints/content/`** - Content script injected into GitHub/GitLab pages. Contains the React app that provides the comment formatting UI (combobox for label/decoration selection, comment formatting/extraction logic)
- **`entrypoints/popup/`** - Extension popup showing configured domains and intro

Key shared code:

- **`components/custom/`** - Reusable React components (Combobox with platform-specific stylesheets for GitHub vs GitLab)
- **`lib/`** - Shared utilities including WebExt messaging (`lib/messaging.ts`)

### Content Script Design

The content script detects comment editors on GitHub/GitLab pages via extractors (`commentEditorExtractors/`). There are multiple extractor versions (e.g., `githubCommentEditorExtractorV1.ts`, `V2.ts`) to handle different UI versions. The `formatComment.ts` and `extractComment.ts` modules handle bidirectional conversion between plain text and conventional comment format.

### Dynamic Content Script Registration

The background service worker dynamically registers/unregisters content scripts based on user-configured domains and deactivated URLs, rather than using static manifest matches.

## Testing Structure

- **Unit tests** (Vitest): Co-located with source files as `*.test.ts`
- **Component tests** (Playwright CT): `tests/components/` - test React components in isolation
- **E2E tests** (Playwright): `tests/e2e/` - four projects: `github-v1`, `github-v2`, `gitlab-v1`, `gitlab-v2`. Uses page object models in `tests/e2e/MainPage/`. Runs sequentially (1 worker). Requires credentials via a local `mise.local.toml` (see Environment) or 1password in CI
- **Visual regression**: E2E includes screenshot tests (`tests/e2e/__screenshots__/`). Baselines are pinned to CI's rendering (fonts, GPU, OS). Visual tests are **not expected to pass locally** — diffs against CI baselines are normal. To refresh baselines from CI after a UI change, run `mise exec -- pnpm tsx devScripts/getScreenshotsFromCI.ts` (needs `GITHUB_TOKEN`).

## Environment

All env vars are managed by mise — there are no `.env` files.

- **`mise.toml`** `[env]` – local-dev defaults (e.g. `E2E_*_PROJECT`).
- **`mise.ci.toml`** – overlay activated by `MISE_ENV=ci`. Holds CI project overrides and `op://` references for the 16 E2E secrets.
- **`mise.publish.toml`** / **`mise.canary.toml`** – overlays activated by `MISE_ENV=publish` (release) and `MISE_ENV=publish,canary` (canary). Hold publish-flow config (`CI_PUBLISH`, `IS_CANARY`, store target/channel) and `op://` references for Chrome/Firefox store credentials.
- **`mise.local.toml`** – gitignored, per-developer overrides for E2E secrets.

Secret values live in 1password; the overlays only declare references like `"op://Conventional comments/GitHub V1/password"`. Tasks that consume secrets (`test:e2e`, `publish:chrome`, `publish:firefox`, `cws:cancel-pending`) wrap their command with `{{vars.op_run}}` — empty by default, set to `op run --` in CI overlays. At runtime `op run` reads the op:// values from the task env, fetches the secrets, and substitutes them before the inner command runs.

Local dev for E2E — either:

- put literal credentials in `mise.local.toml` (no 1password CLI needed):

  ```toml
  [env]
  E2E_GITHUB_V1_USERNAME = "..."
  E2E_GITHUB_V1_PASSWORD = "..."
  # repeat for V2 / GITLAB
  ```

- or, if you have the 1password CLI authenticated, point at your own vault and set `[vars] op_run = "op run --"` in `mise.local.toml`.

In CI, workflows export `OP_SERVICE_ACCOUNT_TOKEN` so `op run` can authenticate against the shared 1password vault.

## Key Tools & Config

- **Node 22.16.0** + **pnpm 11.8.0** pinned in `mise.toml` (install with `mise install`)
- **WXT** for extension scaffolding (`wxt.config.ts`) - run `wxt prepare` after install (happens via postinstall)
- **Oxlint** for linting (`.oxlintrc.json`) - strict mode with react, typescript, vitest plugins
- **Prettier** for formatting (`.prettierrc.json`) - double quotes, trailing commas
- **Path alias**: `~/` maps to project root (configured in tsconfig)
