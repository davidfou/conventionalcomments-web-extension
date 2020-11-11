module.exports = {
  coverageProvider: "v8",
  transform: {
    "^.+\\.svelte$": [
      "svelte-jester",
      {
        preprocess: true,
      },
    ],
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  preset: "ts-jest/presets/js-with-babel",
  moduleFileExtensions: ["js", "ts", "svelte"],
};
