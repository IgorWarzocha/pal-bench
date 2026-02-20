/**
 * convex/voting/mutations.ts
 * Vote casting and removal mutations with 48-hour rolling cooldown.
 * Updates denormalized counts on submissions for efficient queries.
 */
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
  voteTypeValidator,
  voteValueValidator,
  getVoteFields,
  processVote,
  VoteUpdate,
  VOTE_COOLDOWN_MS,
} from "./helpers";
import { rateLimiter } from "../rateLimiter";
import { applyVoteDeltaStats } from "../stats_helpers";

export const castVote = mutation({
  args: {
    submissionId: v.id("submissions"),
    clientId: v.string(),
    type: voteTypeValidator,
    value: voteValueValidator,
  },
  returns: v.object({
    action: v.union(v.literal("created"), v.literal("updated"), v.literal("unchanged")),
    previousValue: v.union(v.literal("up"), v.literal("down"), v.null()),
  }),
  handler: async (ctx, args) => {
    // Rate limit per client to prevent abuse
    await rateLimiter.limit(ctx, "castVote", {
      key: args.clientId,
      throws: true,
    });

    const submission = await ctx.db.get("submissions", args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    return processVote(ctx, submission, args.clientId, args.type, args.value);
  },
});

export const castVotesBatch = mutation({
  args: {
    votes: v.array(
      v.object({
        submissionId: v.id("submissions"),
        value: voteValueValidator,
      }),
    ),
    clientId: v.string(),
    type: voteTypeValidator,
  },
  returns: v.object({
    processed: v.number(),
    created: v.number(),
    updated: v.number(),
    unchanged: v.number(),
  }),
  handler: async (ctx, args) => {
    // Rate limit batch operations more strictly
    await rateLimiter.limit(ctx, "castVotesBatch", {
      key: args.clientId,
      throws: true,
    });

    const stats = { processed: 0, created: 0, updated: 0, unchanged: 0 };

    for (const vote of args.votes) {
      const submission = await ctx.db.get("submissions", vote.submissionId);
      if (!submission) continue;

      stats.processed++;
      const result = await processVote(ctx, submission, args.clientId, args.type, vote.value);

      if (result.action === "created") stats.created++;
      else if (result.action === "updated") stats.updated++;
      else stats.unchanged++;
    }

    return stats;
  },
});

export const removeVote = mutation({
  args: {
    submissionId: v.id("submissions"),
    clientId: v.string(),
    type: voteTypeValidator,
  },
  returns: v.object({
    removed: v.boolean(),
    previousValue: v.union(v.literal("up"), v.literal("down"), v.null()),
  }),
  handler: async (ctx, args) => {
    // Rate limit per client
    await rateLimiter.limit(ctx, "removeVote", {
      key: args.clientId,
      throws: true,
    });

    const now = Date.now();
    const cooldownThreshold = now - VOTE_COOLDOWN_MS;

    // Find the most recent vote within cooldown period
    const recentVote = await ctx.db
      .query("votes")
      .withIndex("by_client_submission", (q) =>
        q.eq("clientId", args.clientId).eq("submissionId", args.submissionId).eq("type", args.type),
      )
      .order("desc")
      .first();

    // Only allow removing votes within the cooldown period
    const voteTimestamp = recentVote?.timestamp ?? 0;
    if (!recentVote || voteTimestamp <= cooldownThreshold) {
      return { removed: false, previousValue: null };
    }

    const submission = await ctx.db.get("submissions", args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    await ctx.db.delete("votes", recentVote._id);

    const { upField, downField } = getVoteFields(args.type);
    const updates: VoteUpdate = {};

    if (recentVote.value === "up") {
      updates[upField] = Math.max(0, submission[upField] - 1);
    } else {
      updates[downField] = Math.max(0, submission[downField] - 1);
    }

    await ctx.db.patch("submissions", args.submissionId, updates);

    await applyVoteDeltaStats(ctx, {
      model: submission.model,
      totalVotesDelta: -1,
      upvotesImageDelta: args.type === "image" && recentVote.value === "up" ? -1 : 0,
      downvotesImageDelta: args.type === "image" && recentVote.value === "down" ? -1 : 0,
      upvotesDataDelta: args.type === "data" && recentVote.value === "up" ? -1 : 0,
      downvotesDataDelta: args.type === "data" && recentVote.value === "down" ? -1 : 0,
    });

    return { removed: true, previousValue: recentVote.value };
  },
});
