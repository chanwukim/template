import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import {
  getTodoDetailQueryOptions,
  useUpdateTodo,
} from "@/shared/api/todo/todo.api";

interface TodoDetailProps {
  readonly todoId: string;
}

export function TodoDetail({ todoId }: TodoDetailProps) {
  const todo = useSuspenseQuery(
    getTodoDetailQueryOptions(todoId, { staleTime: 30_000 }),
  ).data;
  const updateTodo = useUpdateTodo();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{todo.title}</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Badge variant={todo.completed ? "secondary" : "outline"}>
          {todo.completed ? "완료" : "진행 중"}
        </Badge>
        <p className="text-muted-foreground text-sm">
          마감일: {todo.dueDate ?? "없음"}
        </p>
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          render={<Link to="/dashboard" />}
          nativeButton={false}
          variant="outline"
        >
          목록으로
        </Button>
        <Button
          type="button"
          disabled={updateTodo.isPending}
          onClick={() =>
            updateTodo.mutate({ todoId: todo.id, completed: !todo.completed })
          }
        >
          {todo.completed ? "다시 진행" : "완료 처리"}
        </Button>
      </CardFooter>
    </Card>
  );
}
