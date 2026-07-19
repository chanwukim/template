import {
  mutationOptions,
  queryOptions,
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import z from "zod";

import { apiClient } from "../api-client";
import { parseApiData } from "../api-envelope";
import type { ApiError } from "../api-error";
import type { AppQueryMeta } from "../query-client";

const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  dueDate: z.string().nullable(),
  updatedAt: z.string(),
});

const todoListSchema = z.array(todoSchema);

export const createTodoInputSchema = z.object({
  title: z.string().trim().min(2, "할 일은 두 글자 이상 입력해 주세요."),
  dueDate: z.string().nullable(),
});

const updateTodoInputSchema = z.object({
  todoId: z.string(),
  completed: z.boolean(),
});

export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly dueDate: string | null;
  readonly updatedAt: string;
}

export interface TodoFilter {
  readonly status: "all" | "open" | "completed";
}

export interface CreateTodoInput {
  readonly title: string;
  readonly dueDate: string | null;
}

export interface UpdateTodoInput {
  readonly todoId: string;
  readonly completed: boolean;
}

const todoMeta = {
  errorPolicy: "section",
  source: "component",
} satisfies AppQueryMeta;

export const todoQueryKeys = {
  all: ["todos"] as const,
  lists: () => [...todoQueryKeys.all, "list"] as const,
  list: (filter: TodoFilter) => [...todoQueryKeys.lists(), filter] as const,
  details: () => [...todoQueryKeys.all, "detail"] as const,
  detail: (todoId: string) => [...todoQueryKeys.details(), todoId] as const,
};

export const todoMutationKeys = {
  all: ["todo-mutations"] as const,
  create: () => [...todoMutationKeys.all, "create"] as const,
  update: () => [...todoMutationKeys.all, "update"] as const,
};

type QueryOptionsOverride<TQueryData, TSelectedData = TQueryData> = Omit<
  UseQueryOptions<TQueryData, ApiError, TSelectedData>,
  "queryKey" | "queryFn" | "meta"
>;

type MutationOptionsOverride<TData, TVariables, TContext = unknown> = Omit<
  UseMutationOptions<TData, ApiError, TVariables, TContext>,
  "mutationKey" | "mutationFn" | "meta"
>;

async function getTodos(
  filter: TodoFilter,
  signal?: AbortSignal,
): Promise<readonly Todo[]> {
  const response = await apiClient.request({
    path: `/api/todos?status=${filter.status}`,
    signal,
  });
  return parseApiData(response, todoListSchema);
}

async function getTodo(todoId: string, signal?: AbortSignal): Promise<Todo> {
  const response = await apiClient.request({
    path: `/api/todos/${todoId}`,
    signal,
  });
  return parseApiData(response, todoSchema);
}

async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const requestBody = createTodoInputSchema.parse(input);
  const response = await apiClient.request({
    path: "/api/todos",
    method: "POST",
    body: requestBody,
  });
  return parseApiData(response, todoSchema);
}

async function updateTodo(input: UpdateTodoInput): Promise<Todo> {
  const requestBody = updateTodoInputSchema.parse(input);
  const response = await apiClient.request({
    path: `/api/todos/${requestBody.todoId}`,
    method: "PATCH",
    body: { completed: requestBody.completed },
  });
  return parseApiData(response, todoSchema);
}

export function getTodoListQueryOptions<TSelectedData = readonly Todo[]>(
  filter: TodoFilter,
  options?: QueryOptionsOverride<readonly Todo[], TSelectedData>,
) {
  return queryOptions({
    queryKey: todoQueryKeys.list(filter),
    queryFn: ({ signal }) => getTodos(filter, signal),
    meta: todoMeta,
    ...options,
  });
}

export function getTodoDetailQueryOptions<TSelectedData = Todo>(
  todoId: string,
  options?: QueryOptionsOverride<Todo, TSelectedData>,
) {
  return queryOptions({
    queryKey: todoQueryKeys.detail(todoId),
    queryFn: ({ signal }) => getTodo(todoId, signal),
    meta: todoMeta,
    ...options,
  });
}

export function getCreateTodoMutationOptions(
  options?: MutationOptionsOverride<Todo, CreateTodoInput>,
) {
  return mutationOptions({
    mutationKey: todoMutationKeys.create(),
    mutationFn: createTodo,
    meta: { ...todoMeta, source: "mutation", errorPolicy: "form" },
    ...options,
  });
}

export function getUpdateTodoMutationOptions(
  options?: MutationOptionsOverride<Todo, UpdateTodoInput, UpdateTodoContext>,
) {
  return mutationOptions({
    mutationKey: todoMutationKeys.update(),
    mutationFn: updateTodo,
    meta: { ...todoMeta, source: "mutation" },
    ...options,
  });
}

interface UpdateTodoContext {
  readonly previousLists: ReadonlyArray<
    readonly [readonly unknown[], readonly Todo[] | undefined]
  >;
  readonly previousDetail: Todo | undefined;
}

export async function synchronizeCreatedTodoCache(
  queryClient: QueryClient,
  createdTodo: Todo,
): Promise<void> {
  queryClient.setQueryData(todoQueryKeys.detail(createdTodo.id), createdTodo);
  await queryClient.invalidateQueries({
    queryKey: todoQueryKeys.lists(),
    refetchType: "active",
  });
}

export async function synchronizeUpdatedTodoCache(
  queryClient: QueryClient,
  updatedTodo: Todo,
): Promise<void> {
  queryClient.setQueryData(todoQueryKeys.detail(updatedTodo.id), updatedTodo);
  await queryClient.invalidateQueries({
    queryKey: todoQueryKeys.lists(),
    refetchType: "active",
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation(
    getCreateTodoMutationOptions({
      onSuccess: async (createdTodo) => {
        await synchronizeCreatedTodoCache(queryClient, createdTodo);
      },
    }),
  );
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation(
    getUpdateTodoMutationOptions({
      onMutate: async (input) => {
        await Promise.all([
          queryClient.cancelQueries({ queryKey: todoQueryKeys.lists() }),
          queryClient.cancelQueries({
            queryKey: todoQueryKeys.detail(input.todoId),
          }),
        ]);

        const previousLists = queryClient.getQueriesData<readonly Todo[]>({
          queryKey: todoQueryKeys.lists(),
        });
        const previousDetail = queryClient.getQueryData<Todo>(
          todoQueryKeys.detail(input.todoId),
        );

        queryClient.setQueriesData<readonly Todo[]>(
          { queryKey: todoQueryKeys.lists() },
          (todos) =>
            todos?.map((todo) =>
              todo.id === input.todoId
                ? { ...todo, completed: input.completed }
                : todo,
            ),
        );
        queryClient.setQueryData<Todo>(
          todoQueryKeys.detail(input.todoId),
          (todo) => (todo ? { ...todo, completed: input.completed } : todo),
        );

        return { previousLists, previousDetail };
      },
      onError: (_error, input, context) => {
        context?.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
        queryClient.setQueryData(
          todoQueryKeys.detail(input.todoId),
          context?.previousDetail,
        );
      },
      onSuccess: async (updatedTodo) => {
        await synchronizeUpdatedTodoCache(queryClient, updatedTodo);
      },
    }),
  );
}
