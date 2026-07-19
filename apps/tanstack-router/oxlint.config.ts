import { defineConfig } from "oxlint";

import rootConfig from "../../oxlint.config.ts";

export default defineConfig({
  extends: [rootConfig],
  plugins: [
    "eslint",
    "typescript",
    "unicorn",
    "oxc",
    "import",
    "node",
    "promise",
    "react",
    "react-perf",
    "jsx-a11y",
  ],
  env: {
    browser: true,
  },
  settings: {
    react: {
      version: "19.2.0",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/react-compiler": "error",
  },
});
