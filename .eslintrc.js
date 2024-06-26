module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    "airbnb",
    "airbnb/hooks",
    "prettier",
    "plugin:storybook/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["svelte3", "@typescript-eslint", "prettier"],
  settings: {
    "svelte3/typescript": true,
    "svelte3/ignore-styles": ({ lang }) => lang === "scss",
    "import/resolver": {
      node: {
        extensions: [".js", ".json", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
      },
    ],
    "import/no-unresolved": ["error", { ignore: ["^@gitbeaker/rest$"] }],
    "prettier/prettier": "warn",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    "no-undef": "off",
    // check by tsc
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
    "react/jsx-props-no-spreading": "off",
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
    {
      files: ["tests/**/*"],
      rules: {
        "no-restricted-syntax": "off",
        "no-await-in-loop": "off",
      },
    },
  ],
};
