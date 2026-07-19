import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorPanel } from "./error-panel";

interface SectionErrorBoundaryProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly onRetry: () => Promise<void> | void;
}

interface SectionErrorBoundaryState {
  readonly error: Error | null;
}

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  override state: SectionErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Section rendering failed", error, errorInfo);
  }

  private readonly reset = (): void => {
    void Promise.resolve(this.props.onRetry()).finally(() => {
      this.setState({ error: null });
    });
  };

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorPanel
          title={this.props.title}
          description={this.state.error.message}
          onRetry={this.reset}
        />
      );
    }

    return this.props.children;
  }
}
