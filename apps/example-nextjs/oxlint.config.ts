import { defineConfig } from "oxlint";

import rootConfig from "../../oxlint.config.ts";

export default defineConfig({
  // `extends`에는 import한 루트 설정 객체를 넣어 공통 정책을 상속한다.
  extends: [rootConfig],
  // Next.js와 React 규칙을 추가하므로 전체 플러그인 목록을 선언한다.
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
    "nextjs",
  ],
  // 브라우저와 Node.js 전역값을 모두 사용할 수 있게 한다.
  env: {
    browser: true,
    node: true,
  },
  settings: {
    // 버전별 React 규칙에 사용할 설치된 React의 semver 버전을 지정한다.
    react: {
      version: "19.2.0",
    },
    // Next.js 규칙이 이 앱을 루트로 판단하도록 한다.
    next: {
      rootDir: ["."],
    },
  },
  rules: {
    // Next.js의 자동 JSX 변환에서는 React 식별자를 scope에 둘 필요가 없다.
    "react/react-in-jsx-scope": "off",
  },
});
