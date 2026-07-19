import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useForm } from "react-hook-form";

import { ApiError } from "../../../shared/api/api-error";
import {
  login,
  loginInputSchema,
  type LoginInput,
} from "../../../shared/api/auth/auth.api";
import { establishSession } from "../../../shared/auth/session";
import { sessionExpiryCoordinator } from "../../../shared/auth/session-expiry-coordinator";

interface LoginFormProps {
  readonly redirectTo: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: "demo@example.com",
      password: "password",
    },
  });

  const submit = form.handleSubmit(async (input) => {
    form.clearErrors("root");
    try {
      await login(input);
      establishSession();
      sessionExpiryCoordinator.reset();
      const target =
        redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/dashboard";
      window.location.replace(target);
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof ApiError ? error.message : "로그인에 실패했습니다.",
      });
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <h1>Focus Todo</h1>
        </CardTitle>
        <CardDescription>오늘 처리할 일에 집중하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.email)}>
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel htmlFor="password">비밀번호</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
            <FieldError errors={[form.formState.errors.root]} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "로그인 중…" : "로그인"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
