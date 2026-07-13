import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  endOfLine: "lf",
  trailingComma: "all",
  sortImports: {
    ignoreCase: true,
    newlinesBetween: true,
    groups: [
      "builtin",
      "external",
      ["internal", "subpath"],
      "parent",
      "sibling",
      "index",
      "unknown",
    ],
  },
  sortTailwindcss: {
    functions: ["cn", "clsx", "cva", "cx"],
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    ".next",
    "out",
    "build",
    "coverage",
    "logs",
    "tmp",
    "temp",
    "next-env.d.ts",
  ],
});
