/**
 * convex/crons.ts
 * Scheduled jobs for database maintenance.
 * Runs vote cleanup every hour to remove expired votes (48h+ old).
 */
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup expired votes",
  { hours: 1 },
  internal.maintenance.cleanupExpiredVotes,
  {},
);

export default crons;
