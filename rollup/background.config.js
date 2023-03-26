import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/background/index.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/background.js",
  },
  plugins: [
    typescript({
      exclude: [
        "**/*.test.ts",
        "node_modules/*",
        "public/*",
        "src/popup/**",
        "src/contentScript/**",
        "e2e/**",
      ],
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
    }),
    commonjs(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
