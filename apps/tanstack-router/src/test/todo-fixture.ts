import { HttpResponse } from "msw";

import type { Todo } from "../shared/api/todo/todo.api";

export const firstTodo: Todo = {
  id: "todo-1",
  title: "TanStack Router 구조 검토",
  completed: false,
  dueDate: "2026-07-18",
  updatedAt: "2026-07-18T08:00:00.000Z",
};

export function todoResponse(todo: Todo) {
  return HttpResponse.json({
    statusCode: "200",
    errorCode: "",
    message: "할 일 응답입니다.",
    data: todo,
  });
}
