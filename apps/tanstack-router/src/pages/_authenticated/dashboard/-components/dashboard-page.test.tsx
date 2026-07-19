import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { establishSession } from "@/shared/auth/session";
import { server } from "@/shared/mocks/server";
import {
  createTestQueryClient,
  renderApp,
  resetAppTestState,
} from "@/test/render-app";
import { firstTodo } from "@/test/todo-fixture";

beforeEach(() => {
  resetAppTestState();
  establishSession();
});

afterEach(() => {
  resetAppTestState();
  vi.restoreAllMocks();
});

describe("DashboardPage", () => {
  it("사용자, 할 일 목록, 생성 폼과 알림을 함께 렌더링한다", async () => {
    await renderApp("/dashboard");

    expect(
      await screen.findByRole("heading", { name: "안녕하세요, Demo User님" }),
    ).toBeInTheDocument();
    expect(screen.getByText("오늘 완료한 일 1개")).toBeInTheDocument();
    expect(await screen.findByText(firstTodo.title)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "할 일 추가" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "알림" })).toBeInTheDocument();
    expect(
      screen.getByText("오늘 마감인 할 일이 1개 있습니다."),
    ).toBeInTheDocument();
  });

  it("할 일 생성 입력과 서버 필드 오류를 폼에 표시한다", async () => {
    await renderApp("/dashboard");
    const user = userEvent.setup();
    const titleInput = await screen.findByLabelText("새 할 일");

    await user.type(titleInput, "a");
    await user.click(screen.getByRole("button", { name: "할 일 추가" }));
    expect(
      await screen.findByText("할 일은 두 글자 이상 입력해 주세요."),
    ).toBeInTheDocument();

    await user.clear(titleInput);
    await user.type(titleInput, firstTodo.title);
    await user.click(screen.getByRole("button", { name: "할 일 추가" }));
    expect(
      await screen.findByText("다른 제목을 입력해 주세요."),
    ).toBeInTheDocument();
  });

  it("할 일을 생성하고 목록을 다시 불러온다", async () => {
    await renderApp("/dashboard");
    const user = userEvent.setup();
    const title = "컴포넌트 통합 테스트 작성";

    await user.type(await screen.findByLabelText("새 할 일"), title);
    await user.click(screen.getByRole("button", { name: "할 일 추가" }));

    expect(
      await screen.findByRole("link", { name: title }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("새 할 일")).toHaveValue("");
  });

  it("목록 체크박스 mutation을 낙관적으로 반영한다", async () => {
    await renderApp("/dashboard");
    const user = userEvent.setup();
    const checkbox = await screen.findByRole("checkbox", {
      name: `${firstTodo.title} 완료 상태`,
    });

    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it("알림 요청 실패를 해당 section 안에서 격리한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    server.use(
      http.get("/api/notifications", () =>
        HttpResponse.json(
          {
            statusCode: "500",
            errorCode: "NOTIFICATION_FAILURE",
            message: "알림 서버 오류",
            data: "",
          },
          { status: 500 },
        ),
      ),
    );
    await renderApp("/dashboard", createTestQueryClient());

    expect(
      await screen.findByText("알림을 불러오지 못했습니다"),
    ).toBeInTheDocument();
    expect(screen.getByText("알림 서버 오류")).toBeInTheDocument();
    expect(screen.getByText(firstTodo.title)).toBeInTheDocument();
    expect(screen.getByLabelText("새 할 일")).toBeInTheDocument();
  });
});
