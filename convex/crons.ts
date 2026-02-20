/**
 * convex/crons.ts
 * Scheduled jobs for database maintenance and stats updates.
 * Runs vote cleanup every hour and stats recompute every 15 minutes.
 */
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cleanup expired votes (48h+) every 5 minutes in larger batches.
crons.interval("cleanup expired votes", { minutes: 5 }, internal.maintenance.cleanupExpiredVotes, {
  batchSize: 1000,
  maxBatches: 10,
});

// Live stats are maintained incrementally in submission/voting mutations.
// Full-table recomputes are intentionally not scheduled to avoid large-dataset scans.

export default crons;
