import svelte from "rollup-plugin-svelte";
import css from "rollup-plugin-css-only";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import autoPreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import { spawn } from "child_process";
import { firefox } from "playwright";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        spawn("yarn", ["web-ext", "run", "-f", firefox.executablePath()], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        });
      }
    },
  };
}

export default {
  input: "src/popup/index.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/popup.js",
  },
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
      preprocess: autoPreprocess(),
    }),
    css({ output: "popup.css" }),
    typescript({ sourceMap: !production }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
