import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorPanel } from "./error-panel";

interface GlobalRuntimeBoundaryProps {
  readonly children: ReactNode;
}

interface GlobalRuntimeBoundaryState {
  readonly error: Error | null;
}

export class GlobalRuntimeBoundary extends Component<
  GlobalRuntimeBoundaryProps,
  GlobalRuntimeBoundaryState
> {
  override state: GlobalRuntimeBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): GlobalRuntimeBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Application rendering failed", error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="mx-auto flex min-h-screen max-w-xl items-center p-6">
          <ErrorPanel
            title="애플리케이션 오류가 발생했습니다"
            description={this.state.error.message}
            onRetry={() => window.location.reload()}
          />
        </main>
      );
    }

    return this.props.children;
  }
}
