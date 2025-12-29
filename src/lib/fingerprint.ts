/**
 * src/lib/fingerprint.ts
 * Generates and persists a unique client ID using crypto.randomUUID.
 * Used for anonymous vote tracking without user accounts.
 */

const STORAGE_KEY = "poke-bench-client-id";

export function getFingerprint(): string {
  if (typeof window === "undefined") return "server-side";

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
