import z from "zod";

import { apiClient } from "../api-client";
import { parseApiData } from "../api-envelope";

export const loginInputSchema = z.object({
  email: z.email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(8, "비밀번호는 8자 이상 입력해 주세요."),
});

const loginResultSchema = z.object({
  userId: z.string(),
  name: z.string(),
});

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface LoginResult {
  readonly userId: string;
  readonly name: string;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const requestBody = loginInputSchema.parse(input);
  const response = await apiClient.request({
    path: "/api/login",
    method: "POST",
    body: requestBody,
  });

  return parseApiData(response, loginResultSchema);
}
