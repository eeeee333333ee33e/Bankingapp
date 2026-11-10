const SESSION_KEY = "nexo-demo-session";

export const DEMO_CREDENTIALS = {
  email: "demo@nexo.test",
  password: "NexoDemo2026!",
};

export const DEMO_OTP = "123456";

export function isValidCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
}

export function isValidOtp(code: string) {
  return code === DEMO_OTP;
}

export function hasAuthSession() {
  return typeof window !== "undefined" && window.sessionStorage.getItem(SESSION_KEY) === "active";
}

export function createAuthSession() {
  window.sessionStorage.setItem(SESSION_KEY, "active");
}

export function clearAuthSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}