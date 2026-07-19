import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { queryClient } from "@/shared/api/query-client";
import { todoQueryKeys } from "@/shared/api/todo/todo.api";
import { establishSession, hasSession } from "@/shared/auth/session";
import { renderApp, resetAppTestState } from "@/test/render-app";
import { firstTodo } from "@/test/todo-fixture";

beforeEach(resetAppTestState);
afterEach(resetAppTestState);

describe("AuthenticatedLayout", () => {
  it("세션 없이 보호된 페이지에 접근하면 로그인으로 이동한다", async () => {
    const { router } = await renderApp("/dashboard");

    await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
    expect(
      screen.getByRole("heading", { name: "Focus Todo" }),
    ).toBeInTheDocument();
  });

  it("캐시 구독 화면에서 로그아웃해도 세션과 캐시를 지우고 이동한다", async () => {
    establishSession();
    queryClient.setQueryData(todoQueryKeys.detail("private"), {
      ...firstTodo,
      id: "private",
    });
    const { router } = await renderApp("/dashboard", queryClient);
    const user = userEvent.setup();

    await screen.findByRole("heading", { name: "안녕하세요, Demo User님" });
    await user.click(screen.getByRole("button", { name: "로그아웃" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
    expect(hasSession()).toBe(false);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(
      screen.getByRole("heading", { name: "Focus Todo" }),
    ).toBeInTheDocument();
  });
});
