# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser web extension (Chrome & Firefox) that formats [conventional comments](https://conventionalcomments.org) in GitHub and GitLab pull/merge request review UIs. Built with React 19, TypeScript, WXT (web extension framework), Vite, and Tailwind CSS 4.

## Commands

```bash
# Development
npm run dev              # Dev mode with hot reload (Chrome)
npm run dev:firefox      # Dev mode (Firefox)
npm run storybook        # Component preview at localhost:6006

# Build
npm run build            # Production build (Chrome)
npm run build:firefox    # Production build (Firefox)

# Quality checks (all run in CI)
npm run compile          # TypeScript type check (tsc --noEmit)
npm run lint             # Oxlint (--max-warnings=0)
npx prettier . -l        # Formatting check

# Testing
npx vitest               # Unit tests
npx vitest run entrypoints/content/formatComment.test.ts  # Single unit test
npm run playwright:components    # Component tests (Playwright CT)
npm run playwright:e2e           # All E2E tests
npx playwright test -c tests/e2e/playwright.config.ts --project github-v1  # Single E2E project
```

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
- **E2E tests** (Playwright): `tests/e2e/` - four projects: `github-v1`, `github-v2`, `gitlab-v1`, `gitlab-v2`. Uses page object models in `tests/e2e/MainPage/`. Runs sequentially (1 worker). Requires credentials via `.env.local` or 1password in CI
- **Visual regression**: E2E includes screenshot tests (`tests/e2e/__screenshots__/`). Baselines are pinned to CI's rendering (fonts, GPU, OS). Visual tests are **not expected to pass locally** — diffs against CI baselines are normal. To refresh baselines from CI after a UI change, run `npx tsx devScripts/getScreenshotsFromCI.ts` (needs `GITHUB_TOKEN`).

## Key Tools & Config

- **Node 22.16.0** (`.tool-versions`)
- **WXT** for extension scaffolding (`wxt.config.ts`) - run `wxt prepare` after install (happens via postinstall)
- **Oxlint** for linting (`.oxlintrc.json`) - strict mode with react, typescript, vitest plugins
- **Prettier** for formatting (`.prettierrc.json`) - double quotes, trailing commas
- **Path alias**: `~/` maps to project root (configured in tsconfig)
