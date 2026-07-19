const sessionKey = "focus-todo.session";

export function hasSession(): boolean {
  return window.sessionStorage.getItem(sessionKey) === "authenticated";
}

export function establishSession(): void {
  window.sessionStorage.setItem(sessionKey, "authenticated");
}

export function clearSession(): void {
  window.sessionStorage.removeItem(sessionKey);
}
