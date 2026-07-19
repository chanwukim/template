import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasSession } from "@/shared/auth/session";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: hasSession() ? "/dashboard" : "/login" });
  },
});
