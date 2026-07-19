import { http, HttpResponse } from "msw";

function unauthorized() {
  return HttpResponse.json(
    {
      statusCode: "401",
      errorCode: "SESSION_EXPIRED",
      message: "로그인이 만료되었습니다.",
      data: "",
    },
    { status: 401 },
  );
}

function isUnauthorized(request: Request): boolean {
  return request.headers.get("x-msw-scenario") === "parallel-401";
}

export const dashboardApiHandlers = [
  http.get("/api/me", () => {
    return HttpResponse.json({
      statusCode: "200",
      errorCode: "",
      message: "현재 사용자입니다.",
      data: { id: "user-1", name: "Demo User", todayCompletedCount: 1 },
    });
  }),
  http.get("/api/notifications", ({ request }) => {
    if (isUnauthorized(request)) return unauthorized();

    return HttpResponse.json({
      statusCode: "200",
      errorCode: "",
      message: "알림 목록입니다.",
      data: [
        { id: "notification-1", message: "오늘 마감인 할 일이 1개 있습니다." },
        { id: "notification-2", message: "완료한 일은 자동으로 보관됩니다." },
      ],
    });
  }),
];
