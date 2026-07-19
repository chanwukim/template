import { Skeleton } from "@repo/ui/components/skeleton";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { getCurrentUserQueryOptions } from "../../../shared/api/dashboard/dashboard.api";
import { ErrorPanel } from "../../../shared/errors/error-panel";

import { DashboardPage } from "./-components/dashboard-page";

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      getCurrentUserQueryOptions({ staleTime: 60_000 }),
    ),
  pendingComponent: () => (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </main>
  ),
  errorComponent: ({ error }) => <DashboardRouteError error={error} />,
  component: DashboardPage,
});

function DashboardRouteError({ error }: { readonly error: Error }) {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-xl p-6">
      <ErrorPanel
        title="대시보드를 불러오지 못했습니다"
        description={error.message}
        onRetry={() => void router.invalidate()}
      />
    </main>
  );
}
