import { http, HttpResponse } from "msw";

interface MockTodo {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  updatedAt: string;
}

let todos: MockTodo[] = [
  {
    id: "todo-1",
    title: "TanStack Router 구조 검토",
    completed: false,
    dueDate: "2026-07-18",
    updatedAt: "2026-07-18T08:00:00.000Z",
  },
  {
    id: "todo-2",
    title: "Mutation 캐시 정책 작성",
    completed: true,
    dueDate: null,
    updatedAt: "2026-07-18T07:00:00.000Z",
  },
];

function unauthorized() {
  return HttpResponse.json(
    {
      statusCode: "401",
      errorCode: "SESSION_EXPIRED",
      message: "로그인이 만료되었습니다.",
      data: "",
    },
    { status: 401 },
  );
}

function isUnauthorized(request: Request): boolean {
  return request.headers.get("x-msw-scenario") === "parallel-401";
}

export const todoApiHandlers = [
  http.get("/api/todos", ({ request }) => {
    if (isUnauthorized(request)) return unauthorized();

    const status = new URL(request.url).searchParams.get("status");
    const filtered = todos.filter((todo) => {
      if (status === "open") return !todo.completed;
      if (status === "completed") return todo.completed;
      return true;
    });

    return HttpResponse.json({
      statusCode: "200",
      errorCode: "",
      message: "할 일 목록입니다.",
      data: filtered,
    });
  }),
  http.get("/api/todos/:todoId", ({ params, request }) => {
    if (isUnauthorized(request)) return unauthorized();

    const todo = todos.find((item) => item.id === params.todoId);
    if (!todo) {
      return HttpResponse.json(
        {
          statusCode: "404",
          errorCode: "TODO_NOT_FOUND",
          message: "할 일을 찾을 수 없습니다.",
          data: "",
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      statusCode: "200",
      errorCode: "",
      message: "할 일 상세입니다.",
      data: todo,
    });
  }),
  http.post("/api/todos", async ({ request }) => {
    if (isUnauthorized(request)) return unauthorized();

    const input = (await request.json()) as {
      title?: string;
      dueDate?: string | null;
    };
    if (todos.some((todo) => todo.title === input.title)) {
      return HttpResponse.json(
        {
          statusCode: "422",
          errorCode: "DUPLICATE_TODO",
          message: "같은 제목의 할 일이 있습니다.",
          data: [{ field: "title", message: "다른 제목을 입력해 주세요." }],
        },
        { status: 422 },
      );
    }

    const todo: MockTodo = {
      id: `todo-${todos.length + 1}`,
      title: input.title ?? "",
      completed: false,
      dueDate: input.dueDate ?? null,
      updatedAt: new Date().toISOString(),
    };
    todos = [todo, ...todos];

    return HttpResponse.json(
      {
        statusCode: "201",
        errorCode: "",
        message: "할 일을 만들었습니다.",
        data: todo,
      },
      { status: 201 },
    );
  }),
  http.patch("/api/todos/:todoId", async ({ params, request }) => {
    if (isUnauthorized(request)) return unauthorized();

    const input = (await request.json()) as { completed?: boolean };
    const index = todos.findIndex((todo) => todo.id === params.todoId);
    if (index < 0) {
      return HttpResponse.json(
        {
          statusCode: "404",
          errorCode: "TODO_NOT_FOUND",
          message: "할 일을 찾을 수 없습니다.",
          data: "",
        },
        { status: 404 },
      );
    }

    const current = todos[index];
    if (!current) {
      throw new Error("Mock todo index became inconsistent.");
    }
    const updated: MockTodo = {
      ...current,
      completed: input.completed ?? current.completed,
      updatedAt: new Date().toISOString(),
    };
    todos = todos.map((todo) => (todo.id === updated.id ? updated : todo));

    return HttpResponse.json({
      statusCode: "200",
      errorCode: "",
      message: "할 일을 수정했습니다.",
      data: updated,
    });
  }),
];
