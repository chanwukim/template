import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { hasSession } from "@/shared/auth/session";
import { renderApp, resetAppTestState } from "@/test/render-app";

beforeEach(resetAppTestState);
afterEach(resetAppTestState);

describe("LoginForm", () => {
  it("입력을 클라이언트 스키마로 검증한다", async () => {
    await renderApp("/login");
    const user = userEvent.setup();
    const emailInput = await screen.findByLabelText("이메일");
    const passwordInput = screen.getByLabelText("비밀번호");

    await user.clear(emailInput);
    await user.type(emailInput, "invalid");
    await user.clear(passwordInput);
    await user.type(passwordInput, "short");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(
      await screen.findByText("이메일 형식이 올바르지 않습니다."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("비밀번호는 8자 이상 입력해 주세요."),
    ).toBeInTheDocument();
  });

  it("로그인 API 오류를 폼 오류로 표시한다", async () => {
    await renderApp("/login");
    const user = userEvent.setup();
    const passwordInput = await screen.findByLabelText("비밀번호");

    await user.clear(passwordInput);
    await user.type(passwordInput, "wrong-password");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(
      await screen.findByText("이메일 또는 비밀번호를 확인해 주세요."),
    ).toBeInTheDocument();
    expect(hasSession()).toBe(false);
  });
});
