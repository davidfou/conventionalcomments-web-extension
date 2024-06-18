import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

const tsFiles = ["**/*.{ts,tsx}"];
export default [
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
  },
  {
    ignores: ["dist/**", "**/*.d.ts", "src/**", "tests/**"],
  },
  ...tseslint.config(
    {
      ...pluginJs.configs.recommended,
      files: tsFiles,
    },
    ...tseslint.configs.recommended.map((config) => ({
      ...config,
      files: tsFiles,
    })),
  ),
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginJs.configs.recommended,
  {
    files: ["{src_new,scripts,pages}/**"],
    languageOptions: { globals: { ...globals.browser, chrome: true } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "no-unused-vars": "off", // deactivated in favor of typescript
    },
  },
  pluginReact.configs.flat.recommended,
  {
    files: ["playwright-ct.config.ts"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: [
      "{config,devScripts}/**",
      "tests/**",
      "tailwind.config.js",
      "postcss.config.js",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];
