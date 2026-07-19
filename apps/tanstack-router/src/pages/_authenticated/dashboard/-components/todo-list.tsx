import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import {
  getTodoListQueryOptions,
  useUpdateTodo,
} from "@/shared/api/todo/todo.api";

export function TodoList() {
  const todos = useSuspenseQuery(
    getTodoListQueryOptions(
      { status: "all" },
      {
        staleTime: 30_000,
        throwOnError: (error, query) =>
          query.state.data === undefined && error.kind !== "aborted",
      },
    ),
  ).data;
  const updateTodo = useUpdateTodo();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>할 일</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3">
              <Checkbox
                aria-label={`${todo.title} 완료 상태`}
                checked={todo.completed}
                disabled={updateTodo.isPending}
                onCheckedChange={(completed) => {
                  updateTodo.mutate({ todoId: todo.id, completed });
                }}
              />
              <Link
                to="/tasks/$todoId"
                params={{ todoId: todo.id }}
                preload="intent"
                className="min-w-0 flex-1 truncate"
              >
                {todo.title}
              </Link>
              <Badge variant={todo.completed ? "secondary" : "outline"}>
                {todo.completed ? "완료" : "진행 중"}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
