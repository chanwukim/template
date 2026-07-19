import z from "zod";

import type { ApiResponse } from "./api-client";
import { ApiError, type ApiErrorKind, type ApiFieldError } from "./api-error";

const fieldErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});

const envelopeSchema = z.object({
  statusCode: z.string(),
  errorCode: z.string(),
  message: z.string(),
  data: z.unknown(),
});

function classifyApiError(httpStatus: number): ApiErrorKind {
  if (httpStatus === 401) return "auth";
  if (httpStatus === 422) return "validation";
  if (httpStatus >= 500) return "server";
  return "business";
}

function parseFieldErrors(data: unknown): readonly ApiFieldError[] | undefined {
  const result = z.array(fieldErrorSchema).safeParse(data);
  return result.success ? result.data : undefined;
}

export function parseApiData<TData>(
  response: ApiResponse,
  dataSchema: z.ZodType<TData>,
): TData {
  const envelopeResult = envelopeSchema.safeParse(response.body);

  if (!envelopeResult.success) {
    throw new ApiError("API 응답 형식이 올바르지 않습니다.", {
      kind: "invalid-response",
      statusCode: String(response.httpStatus),
      cause: envelopeResult.error,
    });
  }

  const envelope = envelopeResult.data;
  if (response.httpStatus < 200 || response.httpStatus >= 300) {
    throw new ApiError(envelope.message, {
      kind: classifyApiError(response.httpStatus),
      statusCode: envelope.statusCode,
      errorCode: envelope.errorCode,
      fieldErrors: parseFieldErrors(envelope.data),
    });
  }

  const dataResult = dataSchema.safeParse(envelope.data);
  if (!dataResult.success) {
    throw new ApiError("API 응답 데이터가 계약과 다릅니다.", {
      kind: "invalid-response",
      statusCode: envelope.statusCode,
      cause: dataResult.error,
    });
  }

  return dataResult.data;
}
