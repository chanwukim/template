import { defineConfig } from "oxlint";

export default defineConfig({
  // `plugins`를 지정하면 Oxlint의 기본 플러그인 집합을 덮어쓴다.
  plugins: [
    // ESLint 코어 규칙을 활성화한다.
    "eslint",
    // TypeScript 규칙을 활성화한다.
    "typescript",
    // Unicorn의 안전성·일관성 규칙을 활성화한다.
    "unicorn",
    // Oxc 고유 규칙과 일부 DeepScan 규칙을 활성화한다.
    "oxc",
    // ESM import/export 경계를 검사하는 규칙을 활성화한다.
    "import",
    // Node.js API와 모듈 사용 규칙을 활성화한다.
    "node",
    // Promise 사용 규칙을 활성화한다.
    "promise",
  ],
  // `categories`는 성격이 같은 규칙 그룹의 기본 심각도를 지정한다.
  categories: {
    // 실제 오류·잘못된 동작 가능성이 큰 규칙은 오류로 처리한다.
    correctness: "error",
    // 잠재적인 실수는 경고로 표시해 점진적으로 정리한다.
    suspicious: "warn",
    // 성능에 영향을 줄 수 있는 코드는 경고로 표시한다.
    perf: "warn",
    // 논쟁 여지가 큰 엄격 규칙은 팀 합의 전까지 비활성화한다.
    pedantic: "off",
    // 서식은 Oxfmt가 담당하므로 스타일 규칙은 비활성화한다.
    style: "off",
    // 프로젝트별 정책이 필요한 제한 규칙은 기본에서 비활성화한다.
    restriction: "off",
    // 변경될 수 있는 실험 규칙은 기본에서 비활성화한다.
    nursery: "off",
  },
  // `ignorePatterns`의 glob은 이 설정 파일이 있는 디렉터리를 기준으로 해석된다.
  ignorePatterns: [
    // 패키지 매니저가 설치한 외부 의존성은 검사하지 않는다.
    "**/node_modules/**",
    // 애플리케이션·라이브러리의 컴파일 결과물은 검사하지 않는다.
    "**/dist/**",
    // Next.js가 생성한 결과물은 검사하지 않는다.
    "**/.next/**",
    // 테스트 도구가 생성한 커버리지 결과물은 검사하지 않는다.
    "**/coverage/**",
    // 기타 번들러의 일반적인 빌드 결과물은 검사하지 않는다.
    "**/build/**",
    // Turborepo의 캐시 파일은 검사하지 않는다.
    "**/.turbo/**",
  ],
  // `overrides`는 파일 glob에 맞는 파일에만 별도 설정을 적용한다.
  overrides: [
    {
      // NestJS 앱은 CommonJS Node.js 런타임에서 실행된다.
      files: ["**/*"],
      env: {
        node: true,
      },
      rules: {
        // NestJS의 decorator와 reflect-metadata는 프레임워크가 요구하는 예외다.
        "typescript/no-extraneous-class": [
          "warn",
          { allowWithDecorator: true },
        ],
        "import/no-unassigned-import": "off",
      },
    },
    {
      // 각 앱·패키지의 도구 설정 및 실행 준비 파일에만 이 예외를 적용한다.
      files: ["**/*.{config,setup}.{js,mjs,cjs,ts,mts,cts}"],
      // `rules`는 개별 규칙의 심각도나 옵션을 카테고리 설정보다 우선해 지정한다.
      rules: {
        // 설정·CLI 파일에서는 의도적인 종료가 가능하므로 이 규칙을 끈다.
        "unicorn/no-process-exit": "off",
      },
    },
  ],
});
