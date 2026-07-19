type ExpiryEffect = () => Promise<void> | void;

export class SessionExpiryCoordinator {
  private expiryPromise: Promise<void> | null = null;
  private effect: ExpiryEffect = () => undefined;

  configure(effect: ExpiryEffect): void {
    this.effect = effect;
  }

  expire(): Promise<void> {
    if (this.expiryPromise) {
      return this.expiryPromise;
    }

    this.expiryPromise = Promise.resolve(this.effect());
    return this.expiryPromise;
  }

  reset(): void {
    this.expiryPromise = null;
  }
}

export const sessionExpiryCoordinator = new SessionExpiryCoordinator();
