import { Button } from "@repo/ui/components/button";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

import { queryClient } from "@/shared/api/query-client";
import { clearSession, hasSession } from "@/shared/auth/session";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (!hasSession()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();

  async function logout() {
    clearSession();
    await queryClient.cancelQueries();
    try {
      await navigate({
        to: "/login",
        search: { redirect: "/dashboard" },
        replace: true,
      });
    } finally {
      queryClient.clear();
    }
  }

  return (
    <div className="bg-muted/20 min-h-screen">
      <header className="bg-background border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" preload="intent" className="font-semibold">
            Focus Todo
          </Link>
          <Button type="button" variant="ghost" onClick={logout}>
            로그아웃
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
