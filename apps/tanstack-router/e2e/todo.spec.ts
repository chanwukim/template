import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/login");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("로그인 후 할 일을 추가하고 상세를 미리 불러온다", async ({ page }) => {
  await login(page);

  await page.getByLabel("새 할 일").fill("Playwright 시나리오 확인");
  await page.getByRole("button", { name: "할 일 추가" }).click();
  const todoLink = page.getByRole("link", { name: "Playwright 시나리오 확인" });
  await expect(todoLink).toBeVisible();

  await todoLink.hover();
  await todoLink.click();
  await expect(
    page.getByRole("heading", { name: "Playwright 시나리오 확인" }),
  ).toBeVisible();
});

test("병렬 section 요청의 401은 로그인 화면으로 한 번 수렴한다", async ({
  page,
}) => {
  await page.goto("/login");
  await page.evaluate(() =>
    sessionStorage.setItem("focus-todo.session", "authenticated"),
  );
  await page.goto("/dashboard?scenario=parallel-401");

  await expect(page).toHaveURL(/\/login\?redirect=/);
  await expect(page.getByText("Focus Todo")).toBeVisible();
});
