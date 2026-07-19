export type ApiErrorKind =
  | "auth"
  | "validation"
  | "business"
  | "network"
  | "server"
  | "invalid-response"
  | "aborted";

export interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

interface ApiErrorOptions {
  readonly kind: ApiErrorKind;
  readonly statusCode?: string | undefined;
  readonly errorCode?: string | undefined;
  readonly fieldErrors?: readonly ApiFieldError[] | undefined;
  readonly cause?: unknown | undefined;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly statusCode: string | undefined;
  readonly errorCode: string | undefined;
  readonly fieldErrors: readonly ApiFieldError[] | undefined;
  override readonly cause: unknown | undefined;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.kind = options.kind;
    this.statusCode = options.statusCode;
    this.errorCode = options.errorCode;
    this.fieldErrors = options.fieldErrors;
    this.cause = options.cause;
  }
}

export function isAuthenticationError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.kind === "auth";
}
