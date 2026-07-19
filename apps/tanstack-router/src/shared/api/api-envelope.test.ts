import { describe, expect, it } from "vitest";
import z from "zod";

import { parseApiData } from "./api-envelope";
import { ApiError } from "./api-error";

describe("parseApiData", () => {
  it("검증된 성공 데이터만 반환한다", () => {
    const data = parseApiData(
      {
        httpStatus: 200,
        body: {
          statusCode: "200",
          errorCode: "",
          message: "ok",
          data: { id: "todo-1" },
        },
      },
      z.object({ id: z.string() }),
    );

    expect(data).toEqual({ id: "todo-1" });
  });

  it("401 응답을 인증 오류로 변환한다", () => {
    expect(() =>
      parseApiData(
        {
          httpStatus: 401,
          body: {
            statusCode: "401",
            errorCode: "SESSION_EXPIRED",
            message: "expired",
            data: "",
          },
        },
        z.object({ id: z.string() }),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<ApiError>>({
        kind: "auth",
        errorCode: "SESSION_EXPIRED",
      }),
    );
  });

  it("서버 필드 오류를 보존한다", () => {
    try {
      parseApiData(
        {
          httpStatus: 422,
          body: {
            statusCode: "422",
            errorCode: "VALIDATION_ERROR",
            message: "invalid",
            data: [{ field: "title", message: "required" }],
          },
        },
        z.unknown(),
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).fieldErrors).toEqual([
        { field: "title", message: "required" },
      ]);
    }
  });
});
