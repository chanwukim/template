import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { renderApp, resetAppTestState } from "@/test/render-app";

beforeEach(resetAppTestState);
afterEach(resetAppTestState);

describe("Root route", () => {
  it("등록되지 않은 주소에는 not-found 화면을 표시한다", async () => {
    await renderApp("/unknown");

    expect(
      await screen.findByText("페이지를 찾을 수 없습니다"),
    ).toBeInTheDocument();
  });
});
