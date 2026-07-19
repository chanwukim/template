import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { establishSession } from "@/shared/auth/session";
import { server } from "@/shared/mocks/server";
import { renderApp, resetAppTestState } from "@/test/render-app";
import { firstTodo, todoResponse } from "@/test/todo-fixture";

beforeEach(() => {
  resetAppTestState();
  establishSession();
});

afterEach(() => {
  resetAppTestState();
  vi.restoreAllMocks();
});

describe("TodoDetail", () => {
  it("할 일 상세를 표시하고 완료 상태를 변경한다", async () => {
    let todo = { ...firstTodo };
    server.use(
      http.get("/api/todos/:todoId", () => todoResponse(todo)),
      http.patch("/api/todos/:todoId", async ({ request }) => {
        const input = (await request.json()) as { completed: boolean };
        todo = { ...todo, completed: input.completed };
        return todoResponse(todo);
      }),
    );
    await renderApp("/tasks/todo-1");
    const user = userEvent.setup();

    expect(
      await screen.findByRole("heading", { name: firstTodo.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("마감일: 2026-07-18")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "완료 처리" }));
    expect(
      await screen.findByRole("button", { name: "다시 진행" }),
    ).toBeInTheDocument();
  });

  it("존재하지 않는 상세의 loader 오류를 라우트 경계에 표시한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await renderApp("/tasks/not-found");

    await waitFor(() =>
      expect(
        screen.getByText("할 일을 불러오지 못했습니다"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("할 일을 찾을 수 없습니다.")).toBeInTheDocument();
  });
});
