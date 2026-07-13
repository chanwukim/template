import path from "path";

const buildOxlintCommand = (filenames) => {
  const lintFiles = filenames.filter((filename) =>
    /\.(?:js|jsx|ts|tsx)$/.test(filename),
  );

  if (lintFiles.length === 0) {
    return [];
  }

  return `pnpm exec oxlint --fix ${lintFiles
    .map((filename) => JSON.stringify(path.relative(process.cwd(), filename)))
    .join(" ")}`;
};

export default {
  "*.{js,jsx,ts,tsx,json,css}": ["pnpm format:fix", buildOxlintCommand],
};
