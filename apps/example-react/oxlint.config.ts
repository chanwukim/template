import { defineConfig } from "oxlint";

import rootConfig from "../../oxlint.config.ts";

export default defineConfig({
  // `extends`에는 import한 루트 설정 객체를 넣어 공통 정책을 상속한다.
  extends: [rootConfig],
  // React 관련 규칙을 추가하므로 루트 플러그인도 함께 다시 선언한다.
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
  // 브라우저 전역값을 React 앱에서 사용할 수 있게 한다.
  env: {
    browser: true,
  },
  settings: {
    // 버전별 React 규칙에 사용할 설치된 React의 semver 버전을 지정한다.
    react: {
      version: "19.2.0",
    },
  },
  rules: {
    // React 17+ 자동 JSX 변환에서는 React 식별자를 scope에 둘 필요가 없다.
    "react/react-in-jsx-scope": "off",
    // React Compiler가 최적화할 수 없는 React 규칙 위반을 오류로 보고한다.
    "react/react-compiler": "error",
  },
});
