/**
 * convex/maintenance.ts
 * Database maintenance, migrations, and scheduled cleanup jobs.
 * Handles vote expiry and hallucination flagging.
 */
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { VOTE_COOLDOWN_MS } from "./voting/helpers";

/**
 * Backfills timestamp on votes that are missing it.
 * Uses _creationTime as the timestamp value. Run once after schema migration.
 */
export const backfillVoteTimestamps = internalMutation({
  args: {},
  returns: v.object({
    updated: v.number(),
  }),
  handler: async (ctx, _args) => {
    const votes = await ctx.db.query("votes").collect();
    let updated = 0;

    for (const vote of votes) {
      if ((vote as Record<string, unknown>).timestamp === undefined) {
        await ctx.db.patch("votes", vote._id, {
          timestamp: vote._creationTime,
        });
        updated++;
      }
    }

    return { updated };
  },
});

/**
 * Deletes votes older than 48 hours. Called by cron job.
 * Processes in batches to avoid timeouts on large datasets.
 */
export const cleanupExpiredVotes = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
    maxBatches: v.optional(v.number()),
  },
  returns: v.object({
    deleted: v.number(),
    hasMore: v.boolean(),
    batchesProcessed: v.number(),
  }),
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 1000;
    const maxBatches = args.maxBatches ?? 10;
    const threshold = Date.now() - VOTE_COOLDOWN_MS;

    let deleted = 0;
    let batchesProcessed = 0;
    let hasMore = false;

    for (let i = 0; i < maxBatches; i++) {
      const expiredVotes = await ctx.db
        .query("votes")
        .withIndex("by_timestamp", (q) => q.lt("timestamp", threshold))
        .take(batchSize);

      if (expiredVotes.length === 0) {
        hasMore = false;
        break;
      }

      for (const vote of expiredVotes) {
        await ctx.db.delete("votes", vote._id);
      }

      deleted += expiredVotes.length;
      batchesProcessed += 1;

      if (expiredVotes.length < batchSize) {
        hasMore = false;
        break;
      }

      hasMore = true;
    }

    return { deleted, hasMore, batchesProcessed };
  },
});

export const flagInvalidNames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();
    const speciesEntries = await ctx.db.query("species").collect();

    const speciesMap = new Map<number, string>();
    for (const s of speciesEntries) {
      speciesMap.set(s.id, s.name.toLowerCase().trim());
    }

    let flaggedCount = 0;
    let checkedCount = 0;

    for (const submission of submissions) {
      let isHallucination = submission.isHallucination;
      if (isHallucination === undefined) {
        isHallucination = false;
      }

      if (isHallucination === true) continue;

      checkedCount++;
      const expectedName = speciesMap.get(submission.speciesNum);

      if (!expectedName) {
        await ctx.db.patch("submissions", submission._id, {
          isHallucination: true,
          hallucinationReason: `Invalid Species ID: ${submission.speciesNum}`,
        });
        flaggedCount++;
      } else if (submission.name.toLowerCase().trim() !== expectedName) {
        await ctx.db.patch("submissions", submission._id, {
          isHallucination: true,
          hallucinationReason: `Name mismatch: Expected "${expectedName}" (ID ${submission.speciesNum}), got "${submission.name}"`,
        });
        flaggedCount++;
      } else if (submission.isHallucination === undefined) {
        await ctx.db.patch("submissions", submission._id, {
          isHallucination: false,
        });
      }
    }

    return {
      totalSubmissions: submissions.length,
      checkedCount,
      flaggedCount,
      message: `Checked ${checkedCount} submissions. Flagged ${flaggedCount} new hallucinations.`,
    };
  },
});
