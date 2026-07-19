import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";

import { hasSession } from "@/shared/auth/session";

import { LoginForm } from "./-components/login-form";

const searchSchema = z.object({
  redirect: z.string().catch("/dashboard"),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  beforeLoad: () => {
    if (hasSession()) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();

  return (
    <main className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
      <LoginForm redirectTo={search.redirect} />
    </main>
  );
}
