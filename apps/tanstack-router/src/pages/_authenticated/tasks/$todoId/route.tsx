import { createFileRoute, useRouter } from "@tanstack/react-router";

import { getTodoDetailQueryOptions } from "@/shared/api/todo/todo.api";
import { ErrorPanel } from "@/shared/errors/error-panel";

import { TodoDetail } from "./-components/todo-detail";

export const Route = createFileRoute("/_authenticated/tasks/$todoId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      getTodoDetailQueryOptions(params.todoId, { staleTime: 30_000 }),
    ),
  errorComponent: ({ error }: { error: Error }) => (
    <TodoDetailError error={error} />
  ),
  component: TodoDetailPage,
});

function TodoDetailPage() {
  const { todoId } = Route.useParams();
  return (
    <main className="mx-auto max-w-2xl p-6">
      <TodoDetail todoId={todoId} />
    </main>
  );
}

function TodoDetailError({ error }: { readonly error: Error }) {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-xl p-6">
      <ErrorPanel
        title="할 일을 불러오지 못했습니다"
        description={error.message}
        onRetry={() => void router.invalidate()}
      />
    </main>
  );
}
