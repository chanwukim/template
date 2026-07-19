import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import {
  synchronizeCreatedTodoCache,
  synchronizeUpdatedTodoCache,
  todoQueryKeys,
  type Todo,
} from "./todo.api";

const todo: Todo = {
  id: "todo-1",
  title: "캐시 정책 확인",
  completed: false,
  dueDate: null,
  updatedAt: "2026-07-18T00:00:00.000Z",
};

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("Todo mutation cache synchronization", () => {
  it("생성 성공 데이터는 detail에 기록하고 모든 list를 무효화한다", async () => {
    const queryClient = createQueryClient();
    const listKey = todoQueryKeys.list({ status: "all" });
    queryClient.setQueryData(listKey, []);

    await synchronizeCreatedTodoCache(queryClient, todo);

    expect(queryClient.getQueryData(todoQueryKeys.detail(todo.id))).toEqual(
      todo,
    );
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
  });

  it("수정 성공 데이터는 detail을 교체하고 필터별 list를 무효화한다", async () => {
    const queryClient = createQueryClient();
    const openListKey = todoQueryKeys.list({ status: "open" });
    const completedListKey = todoQueryKeys.list({ status: "completed" });
    queryClient.setQueryData(openListKey, [todo]);
    queryClient.setQueryData(completedListKey, []);
    const updatedTodo = { ...todo, completed: true };

    await synchronizeUpdatedTodoCache(queryClient, updatedTodo);

    expect(queryClient.getQueryData(todoQueryKeys.detail(todo.id))).toEqual(
      updatedTodo,
    );
    expect(queryClient.getQueryState(openListKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(completedListKey)?.isInvalidated).toBe(
      true,
    );
  });
});
