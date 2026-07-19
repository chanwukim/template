import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";
import z from "zod";

import { apiClient } from "../api-client";
import { parseApiData } from "../api-envelope";
import type { ApiError } from "../api-error";
import type { AppQueryMeta } from "../query-client";

const currentUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  todayCompletedCount: z.number(),
});

const notificationSchema = z.object({
  id: z.string(),
  message: z.string(),
});

const notificationListSchema = z.array(notificationSchema);

export interface CurrentUser {
  readonly id: string;
  readonly name: string;
  readonly todayCompletedCount: number;
}

export interface Notification {
  readonly id: string;
  readonly message: string;
}

type QueryOptionsOverride<TQueryData, TSelectedData = TQueryData> = Omit<
  UseQueryOptions<TQueryData, ApiError, TSelectedData>,
  "queryKey" | "queryFn" | "meta"
>;

const routeMeta = {
  errorPolicy: "route",
  source: "navigation",
} satisfies AppQueryMeta;

const sectionMeta = {
  errorPolicy: "section",
  source: "component",
} satisfies AppQueryMeta;

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  currentUser: () => [...dashboardQueryKeys.all, "current-user"] as const,
  notifications: () => [...dashboardQueryKeys.all, "notifications"] as const,
};

async function getCurrentUser(signal?: AbortSignal): Promise<CurrentUser> {
  const response = await apiClient.request({ path: "/api/me", signal });
  return parseApiData(response, currentUserSchema);
}

async function getNotifications(
  signal?: AbortSignal,
): Promise<readonly Notification[]> {
  const response = await apiClient.request({
    path: "/api/notifications",
    signal,
  });
  return parseApiData(response, notificationListSchema);
}

export function getCurrentUserQueryOptions<TSelectedData = CurrentUser>(
  options?: QueryOptionsOverride<CurrentUser, TSelectedData>,
) {
  return queryOptions({
    queryKey: dashboardQueryKeys.currentUser(),
    queryFn: ({ signal }) => getCurrentUser(signal),
    meta: routeMeta,
    ...options,
  });
}

export function getNotificationsQueryOptions<
  TSelectedData = readonly Notification[],
>(options?: QueryOptionsOverride<readonly Notification[], TSelectedData>) {
  return queryOptions({
    queryKey: dashboardQueryKeys.notifications(),
    queryFn: ({ signal }) => getNotifications(signal),
    meta: sectionMeta,
    ...options,
  });
}
