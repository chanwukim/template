import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import {
  dashboardQueryKeys,
  getCurrentUserQueryOptions,
} from "@/shared/api/dashboard/dashboard.api";
import { todoQueryKeys } from "@/shared/api/todo/todo.api";
import { SectionErrorBoundary } from "@/shared/errors/section-error-boundary";

import { CreateTodoForm } from "./create-todo-form";
import { Notifications } from "./notifications";
import { TodoList } from "./todo-list";

function SectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-4/5" />
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const user = useSuspenseQuery(
    getCurrentUserQueryOptions({ staleTime: 60_000 }),
  ).data;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">안녕하세요, {user.name}님</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          오늘 완료한 일 {user.todayCompletedCount}개
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <SectionErrorBoundary
            title="할 일 목록을 불러오지 못했습니다"
            onRetry={() =>
              queryClient.resetQueries({ queryKey: todoQueryKeys.lists() })
            }
          >
            <Suspense fallback={<SectionSkeleton />}>
              <TodoList />
            </Suspense>
          </SectionErrorBoundary>
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>할 일 추가</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreateTodoForm />
            </CardContent>
          </Card>
        </div>

        <SectionErrorBoundary
          title="알림을 불러오지 못했습니다"
          onRetry={() =>
            queryClient.resetQueries({
              queryKey: dashboardQueryKeys.notifications(),
            })
          }
        >
          <Suspense fallback={<SectionSkeleton />}>
            <Notifications />
          </Suspense>
        </SectionErrorBoundary>
      </div>
    </main>
  );
}
