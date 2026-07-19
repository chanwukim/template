import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useForm } from "react-hook-form";

import { ApiError } from "@/shared/api/api-error";
import {
  createTodoInputSchema,
  useCreateTodo,
  type CreateTodoInput,
} from "@/shared/api/todo/todo.api";

export function CreateTodoForm() {
  const createTodo = useCreateTodo();
  const form = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoInputSchema),
    defaultValues: {
      title: "",
      dueDate: null,
    },
  });

  const submit = form.handleSubmit(async (input) => {
    form.clearErrors();
    try {
      await createTodo.mutateAsync(input);
      form.reset();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors?.length) {
        error.fieldErrors.forEach((fieldError) => {
          if (fieldError.field === "title" || fieldError.field === "dueDate") {
            form.setError(fieldError.field, { message: fieldError.message });
          }
        });
        return;
      }

      form.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "할 일을 만들지 못했습니다.",
      });
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.title)}>
          <FieldLabel htmlFor="todo-title">새 할 일</FieldLabel>
          <Input
            id="todo-title"
            placeholder="예: Query 오류 정책 검토"
            aria-invalid={Boolean(form.formState.errors.title)}
            {...form.register("title")}
          />
          <FieldError errors={[form.formState.errors.title]} />
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.dueDate)}>
          <FieldLabel htmlFor="todo-due-date">마감일</FieldLabel>
          <Input
            id="todo-due-date"
            type="date"
            aria-invalid={Boolean(form.formState.errors.dueDate)}
            {...form.register("dueDate", {
              setValueAs: (value: string) => value || null,
            })}
          />
          <FieldError errors={[form.formState.errors.dueDate]} />
        </Field>
        <FieldError errors={[form.formState.errors.root]} />
        <Button type="submit" disabled={createTodo.isPending}>
          {createTodo.isPending ? "추가 중…" : "할 일 추가"}
        </Button>
      </FieldGroup>
    </form>
  );
}
