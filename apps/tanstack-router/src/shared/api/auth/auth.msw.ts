import { http, HttpResponse } from "msw";

export const authApiHandlers = [
  http.post("/api/login", async ({ request }) => {
    const input = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (input.email !== "demo@example.com" || input.password !== "password") {
      return HttpResponse.json(
        {
          statusCode: "401",
          errorCode: "INVALID_CREDENTIALS",
          message: "이메일 또는 비밀번호를 확인해 주세요.",
          data: "",
        },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      statusCode: "200",
      errorCode: "",
      message: "로그인했습니다.",
      data: { userId: "user-1", name: "Demo User" },
    });
  }),
];
