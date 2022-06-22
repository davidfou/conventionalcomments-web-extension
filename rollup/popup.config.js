import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import typescript from "@rollup/plugin-typescript";
import injectProcessEnv from "rollup-plugin-inject-process-env";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import { spawn } from "child_process";
import { firefox, chromium } from "playwright";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let started = false;

  return {
    async writeBundle() {
      if (!started) {
        started = true;

        spawn("yarn", ["web-ext", "run", "-f", firefox.executablePath()], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        });

        const pathToExtension = path.join(
          fileURLToPath(new URL(".", import.meta.url)),
          "../public"
        );
        const userDataDir = await fs.mkdtemp(
          path.join(os.tmpdir(), "conventionalcomments-web-ext-chrome-profile")
        );
        await chromium.launchPersistentContext(userDataDir, {
          headless: false,
          args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
          ],
        });
      }
    },
  };
}

export default {
  input: "src/popup/index.tsx",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/popup.js",
  },
  plugins: [
    typescript({
      tsconfig: false,
      include: ["src/**/*"],
      exclude: [
        "**/*.test.ts",
        "node_modules/*",
        "public/*",
        "src/contentScript/**",
        "src/background/**",
      ],
      compilerOptions: {
        strict: true,
        lib: ["ES2020", "DOM"],
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        module: "es2015",
        jsx: "react",
        target: "es6",
      },
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    injectProcessEnv({
      NODE_ENV: production ? "production" : "development",
    }),
    !production && serve(),
    !production && livereload("public"),
    production && terser(),
  ],
};
