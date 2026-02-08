/**
 * Free, simple password protection for the ops dashboard.
 * No backend: password from env, session in sessionStorage.
 */

const OPS_STORAGE_KEY = 'ops_authenticated';
const OPS_PASSWORD_KEY = 'VITE_OPS_PASSWORD';

export function getOpsPassword(): string {
  return (import.meta as unknown as { env: Record<string, string> }).env?.[OPS_PASSWORD_KEY] ?? '';
}

export function isOpsProtected(): boolean {
  return getOpsPassword().length > 0;
}

export function isOpsAuthenticated(): boolean {
  if (!isOpsProtected()) return true;
  try {
    return sessionStorage.getItem(OPS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setOpsAuthenticated(): void {
  try {
    sessionStorage.setItem(OPS_STORAGE_KEY, '1');
  } catch {
    // ignore
  }
}

export function clearOpsAuthenticated(): void {
  try {
    sessionStorage.removeItem(OPS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function checkOpsPassword(input: string): boolean {
  return input === getOpsPassword();
}
