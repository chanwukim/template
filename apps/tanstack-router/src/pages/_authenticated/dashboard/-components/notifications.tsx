import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useSuspenseQuery } from "@tanstack/react-query";

import { getNotificationsQueryOptions } from "@/shared/api/dashboard/dashboard.api";

export function Notifications() {
  const notifications = useSuspenseQuery(
    getNotificationsQueryOptions({
      staleTime: 15_000,
      throwOnError: (error, query) =>
        query.state.data === undefined && error.kind !== "aborted",
    }),
  ).data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>알림</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <li key={notification.id} className="text-muted-foreground text-sm">
              {notification.message}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
