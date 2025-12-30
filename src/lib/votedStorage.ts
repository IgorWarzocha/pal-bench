/**
 * src/lib/votedStorage.ts
 * LocalStorage utility for tracking voted submission IDs with 48-hour expiry.
 * Enables re-voting after cooldown period expires (rolling vote system).
 */

const VOTED_IDS_KEY = "poke-bench-voted-ids-v2";
const LEGACY_KEY = "poke-bench-voted-ids";

/** 48 hours in milliseconds - must match backend VOTE_COOLDOWN_MS */
const VOTE_COOLDOWN_MS = 48 * 60 * 60 * 1000;

interface VoteRecord {
  id: string;
  timestamp: number;
}

/** Removes legacy storage key on first access */
function migrateLegacyStorage(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(LEGACY_KEY)) {
    localStorage.removeItem(LEGACY_KEY);
  }
}

function getVoteRecords(): VoteRecord[] {
  if (typeof window === "undefined") return [];
  migrateLegacyStorage();

  const stored = localStorage.getItem(VOTED_IDS_KEY);
  if (!stored) return [];

  return JSON.parse(stored) as VoteRecord[];
}

function setVoteRecords(records: VoteRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTED_IDS_KEY, JSON.stringify(records));
}

/** Removes expired votes and returns active records */
function pruneExpired(records: VoteRecord[]): VoteRecord[] {
  const threshold = Date.now() - VOTE_COOLDOWN_MS;
  return records.filter((r) => r.timestamp > threshold);
}

/** Returns IDs of submissions voted on within the cooldown period */
export function getVotedIds(): string[] {
  const records = pruneExpired(getVoteRecords());
  setVoteRecords(records);
  return records.map((r) => r.id);
}

/** Adds a single submission ID with current timestamp */
export function addVotedId(id: string): void {
  if (typeof window === "undefined") return;

  const records = pruneExpired(getVoteRecords());
  const existingIndex = records.findIndex((r) => r.id === id);

  if (existingIndex >= 0) {
    records[existingIndex].timestamp = Date.now();
  } else {
    records.push({ id, timestamp: Date.now() });
  }

  setVoteRecords(records);
}

/** Adds multiple submission IDs with current timestamp */
export function addVotedIds(newIds: string[]): void {
  if (typeof window === "undefined") return;

  const records = pruneExpired(getVoteRecords());
  const existingIds = new Set(records.map((r) => r.id));
  const now = Date.now();

  for (const id of newIds) {
    if (existingIds.has(id)) {
      const record = records.find((r) => r.id === id);
      if (record) record.timestamp = now;
    } else {
      records.push({ id, timestamp: now });
    }
  }

  setVoteRecords(records);
}

/** Clears all vote records (for testing/debugging) */
export function clearVotedIds(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VOTED_IDS_KEY);
}
