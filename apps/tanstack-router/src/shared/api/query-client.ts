import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { sessionExpiryCoordinator } from "../auth/session-expiry-coordinator";

import { ApiError, isAuthenticationError } from "./api-error";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: AppQueryMeta;
    mutationMeta: AppQueryMeta;
    defaultError: ApiError;
  }
}

export interface AppQueryMeta extends Record<string, unknown> {
  readonly errorPolicy: "root" | "route" | "section" | "form" | "silent";
  readonly source: "navigation" | "prefetch" | "component" | "mutation";
}

function handleGlobalError(error: unknown): void {
  if (isAuthenticationError(error)) {
    void sessionExpiryCoordinator.expire();
  }
}

function shouldRetry(failureCount: number, error: ApiError): boolean {
  if (
    error.kind === "auth" ||
    error.kind === "validation" ||
    error.kind === "business" ||
    error.kind === "aborted"
  ) {
    return false;
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleGlobalError,
  }),
  mutationCache: new MutationCache({
    onError: handleGlobalError,
  }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
