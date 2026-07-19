import { authApiHandlers } from "../api/auth/auth.msw";
import { dashboardApiHandlers } from "../api/dashboard/dashboard.msw";
import { todoApiHandlers } from "../api/todo/todo.msw";

export const handlers = [
  ...authApiHandlers,
  ...dashboardApiHandlers,
  ...todoApiHandlers,
];
