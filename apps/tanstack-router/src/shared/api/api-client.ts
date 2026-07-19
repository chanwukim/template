import { ApiError } from "./api-error";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface ApiRequest {
  readonly path: string;
  readonly method?: HttpMethod;
  readonly body?: unknown;
  readonly signal?: AbortSignal | undefined;
}

export interface ApiResponse {
  readonly httpStatus: number;
  readonly body: unknown;
}

export interface ApiClient {
  request(request: ApiRequest): Promise<ApiResponse>;
}

function getScenarioHeader(): string | null {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("scenario");
}

export const apiClient: ApiClient = {
  async request(request) {
    const headers = new Headers({
      Accept: "application/json",
    });
    const scenario = getScenarioHeader();

    if (request.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }
    if (scenario) {
      headers.set("x-msw-scenario", scenario);
    }

    try {
      const requestInit: RequestInit = {
        method: request.method ?? "GET",
        headers,
        credentials: "include",
      };
      if (request.body !== undefined)
        requestInit.body = JSON.stringify(request.body);
      if (request.signal) requestInit.signal = request.signal;

      const response = await fetch(request.path, requestInit);

      let body: unknown;
      try {
        body = await response.json();
      } catch (cause) {
        throw new ApiError("API 응답을 JSON으로 해석할 수 없습니다.", {
          kind: "invalid-response",
          statusCode: String(response.status),
          cause,
        });
      }

      return {
        httpStatus: response.status,
        body,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError("요청이 취소되었습니다.", {
          kind: "aborted",
          cause: error,
        });
      }

      throw new ApiError("서버에 연결할 수 없습니다.", {
        kind: "network",
        cause: error,
      });
    }
  },
};
