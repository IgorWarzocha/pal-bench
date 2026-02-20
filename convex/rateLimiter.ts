/**
 * convex/rateLimiter.ts
 * Rate limiting configuration for voting mutations.
 * Uses the Convex rate limiter component to prevent abuse.
 */
import { components } from "./_generated/api";
import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Per-client rate limit for voting: 1 vote per 3 seconds max
  // This prevents rapid-fire voting while still allowing normal usage
  castVote: {
    kind: "token bucket",
    rate: 20, // 20 votes per minute
    period: MINUTE,
    capacity: 3, // Allow up to 3 in quick succession
  },
  // Stricter limit for batch operations
  castVotesBatch: {
    kind: "fixed window",
    rate: 10, // 10 batch requests per minute
    period: MINUTE,
  },
  // Limit for removing votes (same as casting)
  removeVote: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 3,
  },
});
