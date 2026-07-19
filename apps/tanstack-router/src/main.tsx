import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { router } from "./router";
import { queryClient } from "./shared/api/query-client";
import { clearSession } from "./shared/auth/session";
import { sessionExpiryCoordinator } from "./shared/auth/session-expiry-coordinator";
import { GlobalRuntimeBoundary } from "./shared/errors/global-runtime-boundary";
import "./app.css";

async function enableMockApi(): Promise<void> {
  if (!import.meta.env.DEV) return;

  const { worker } = await import("./shared/mocks/browser");
  await worker.start({
    onUnhandledRequest: "error",
  });
}

async function startApplication(): Promise<void> {
  await enableMockApi();

  sessionExpiryCoordinator.configure(async () => {
    clearSession();
    await queryClient.cancelQueries();
    queryClient.clear();

    if (router.state.location.pathname !== "/login") {
      await router.navigate({
        to: "/login",
        search: {
          redirect: router.state.location.href,
        },
        replace: true,
      });
    }
  });

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element was not found.");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <GlobalRuntimeBoundary>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </GlobalRuntimeBoundary>
    </StrictMode>,
  );
}

void startApplication();
