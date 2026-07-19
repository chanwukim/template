import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";

import { routeTree } from "../routeTree.gen";
import { queryClient as applicationQueryClient } from "../shared/api/query-client";
import { clearSession } from "../shared/auth/session";
import { sessionExpiryCoordinator } from "../shared/auth/session-expiry-coordinator";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function resetAppTestState(): void {
  clearSession();
  applicationQueryClient.clear();
  sessionExpiryCoordinator.reset();
}

export async function renderApp(
  initialEntry: string,
  queryClient = createTestQueryClient(),
) {
  const history = createMemoryHistory({ initialEntries: [initialEntry] });
  const router = createRouter({
    routeTree,
    history,
    context: { queryClient },
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { ...view, queryClient, router };
}
