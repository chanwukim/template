import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ErrorPanel } from "./error-panel";
import { GlobalRuntimeBoundary } from "./global-runtime-boundary";
import { SectionErrorBoundary } from "./section-error-boundary";

interface ThrowOnceProps {
  readonly message: string;
  readonly children: ReactNode;
}

function ThrowWhenRequested({ message, children }: ThrowOnceProps) {
  if (shouldThrow) {
    throw new Error(message);
  }
  return children;
}

let shouldThrow = false;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorPanel", () => {
  it("재시도 동작이 있을 때만 버튼을 제공한다", async () => {
    const retry = vi.fn();
    const { rerender } = render(
      <ErrorPanel title="오류" description="설명" onRetry={retry} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(retry).toHaveBeenCalledOnce();

    rerender(<ErrorPanel title="오류" description="설명" />);
    expect(
      screen.queryByRole("button", { name: "다시 시도" }),
    ).not.toBeInTheDocument();
  });
});

describe("Error boundaries", () => {
  it("section 렌더 오류를 격리하고 재시도한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    shouldThrow = true;
    const retry = vi.fn(async () => {
      shouldThrow = false;
    });

    render(
      <SectionErrorBoundary title="섹션 오류" onRetry={retry}>
        <ThrowWhenRequested message="section failed">
          <p>복구됨</p>
        </ThrowWhenRequested>
      </SectionErrorBoundary>,
    );

    expect(screen.getByText("섹션 오류")).toBeInTheDocument();
    expect(screen.getByText("section failed")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("복구됨")).toBeInTheDocument();
    expect(retry).toHaveBeenCalledOnce();
  });

  it("최상위 렌더 오류를 전역 fallback으로 표시한다", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    shouldThrow = true;

    render(
      <GlobalRuntimeBoundary>
        <ThrowWhenRequested message="root failed">
          <p>도달하지 않음</p>
        </ThrowWhenRequested>
      </GlobalRuntimeBoundary>,
    );

    expect(
      screen.getByText("애플리케이션 오류가 발생했습니다"),
    ).toBeInTheDocument();
    expect(screen.getByText("root failed")).toBeInTheDocument();
  });
});
