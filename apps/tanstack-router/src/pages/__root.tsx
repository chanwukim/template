import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import type { RouterContext } from "@/router";
import { ErrorPanel } from "@/shared/errors/error-panel";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: ({ error, reset }: { error: Error; reset: () => void }) => (
    <main className="mx-auto flex min-h-screen max-w-xl items-center p-6">
      <ErrorPanel
        title="앱을 불러오지 못했습니다"
        description={error.message}
        onRetry={reset}
      />
    </main>
  ),
  notFoundComponent: () => (
    <main className="mx-auto flex min-h-screen max-w-xl items-center p-6">
      <ErrorPanel
        title="페이지를 찾을 수 없습니다"
        description="주소가 변경되었거나 존재하지 않는 페이지입니다."
      />
    </main>
  ),
});

function RootComponent() {
  return <Outlet />;
}
