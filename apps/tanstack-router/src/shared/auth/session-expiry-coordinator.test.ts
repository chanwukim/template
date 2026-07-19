import { describe, expect, it, vi } from "vitest";

import { SessionExpiryCoordinator } from "./session-expiry-coordinator";

describe("SessionExpiryCoordinator", () => {
  it("동시에 만료 요청을 받아도 세션 종료 효과를 한 번만 실행한다", async () => {
    const expireEffect = vi.fn(async () => undefined);
    const coordinator = new SessionExpiryCoordinator();
    coordinator.configure(expireEffect);

    const expiries = [
      coordinator.expire(),
      coordinator.expire(),
      coordinator.expire(),
    ];
    await Promise.all(expiries);

    expect(expireEffect).toHaveBeenCalledTimes(1);
    expect(expiries[0]).toBe(expiries[1]);
    expect(expiries[1]).toBe(expiries[2]);
  });

  it("명시적으로 reset한 뒤에는 다음 세션 만료를 처리한다", async () => {
    const expireEffect = vi.fn(async () => undefined);
    const coordinator = new SessionExpiryCoordinator();
    coordinator.configure(expireEffect);

    await coordinator.expire();
    coordinator.reset();
    await coordinator.expire();

    expect(expireEffect).toHaveBeenCalledTimes(2);
  });
});
