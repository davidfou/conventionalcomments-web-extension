module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: ["airbnb-base", "prettier", "plugin:codeceptjs/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["svelte3", "@typescript-eslint", "prettier"],
  settings: {
    "svelte3/typescript": true,
    "import/resolver": {
      node: {
        extensions: [".js", ".json", ".ts"],
      },
    },
  },
  rules: {
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "prettier/prettier": "warn",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        ts: "never",
      },
    ],
    "no-undef": "off", // check by tsc
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
  },
  overrides: [
    {
      files: ["**/*.test.ts"],
      env: {
        jest: true,
      },
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      rules: {
        "import/extensions": [
          "error",
          "ignorePackages",
          {
            js: "never",
            ts: "never",
          },
        ],
      },
    },
    {
      files: ["**/*.svelte"],
      processor: "svelte3/svelte3",
      rules: {
        "prettier/prettier": "off",
        "import/first": "off",
        "import/prefer-default-export": "off",
        "import/no-mutable-exports": "off",
      },
    },
  ],
};
