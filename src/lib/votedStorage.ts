/**
 * src/lib/votedStorage.ts
 * LocalStorage utility for tracking voted submission IDs.
 * Avoids expensive votes table queries by keeping state client-side.
 */

const VOTED_IDS_KEY = "poke-bench-voted-ids";

export function getVotedIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(VOTED_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addVotedId(id: string): void {
  if (typeof window === "undefined") return;

  const ids = getVotedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(VOTED_IDS_KEY, JSON.stringify(ids));
  }
}

export function addVotedIds(newIds: string[]): void {
  if (typeof window === "undefined") return;

  const ids = new Set(getVotedIds());
  for (const id of newIds) {
    ids.add(id);
  }
  localStorage.setItem(VOTED_IDS_KEY, JSON.stringify(Array.from(ids)));
}

export function clearVotedIds(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VOTED_IDS_KEY);
}
