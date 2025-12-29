/**
 * convex/voting/mutations.ts
 * Vote casting and removal mutations.
 * Includes single-vote and batch operations for efficiency.
 */
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
  voteTypeValidator,
  voteValueValidator,
  getVoteFields,
  VoteUpdate,
} from "./helpers";

export const castVote = mutation({
  args: {
    submissionId: v.id("submissions"),
    clientId: v.string(),
    type: voteTypeValidator,
    value: voteValueValidator,
  },
  returns: v.object({
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("unchanged"),
    ),
    previousValue: v.union(v.literal("up"), v.literal("down"), v.null()),
  }),
  handler: async (ctx, args) => {
    const submission = await ctx.db.get("submissions", args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_client_submission", (q) =>
        q
          .eq("clientId", args.clientId)
          .eq("submissionId", args.submissionId)
          .eq("type", args.type),
      )
      .unique();

    const { upField, downField } = getVoteFields(args.type);

    if (existingVote) {
      if (existingVote.value === args.value) {
        return {
          action: "unchanged" as const,
          previousValue: existingVote.value,
        };
      }

      await ctx.db.patch("votes", existingVote._id, { value: args.value });

      const updates: VoteUpdate = {};
      if (args.value === "up") {
        updates[upField] = submission[upField] + 1;
        updates[downField] = submission[downField] - 1;
      } else {
        updates[upField] = submission[upField] - 1;
        updates[downField] = submission[downField] + 1;
      }

      await ctx.db.patch("submissions", args.submissionId, updates);
      return { action: "updated" as const, previousValue: existingVote.value };
    }

    await ctx.db.insert("votes", {
      submissionId: args.submissionId,
      clientId: args.clientId,
      type: args.type,
      value: args.value,
    });

    const updates: VoteUpdate = {};
    if (args.value === "up") {
      updates[upField] = submission[upField] + 1;
    } else {
      updates[downField] = submission[downField] + 1;
    }

    await ctx.db.patch("submissions", args.submissionId, updates);
    return { action: "created" as const, previousValue: null };
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
    const stats = { processed: 0, created: 0, updated: 0, unchanged: 0 };
    const { upField, downField } = getVoteFields(args.type);

    for (const vote of args.votes) {
      const submission = await ctx.db.get("submissions", vote.submissionId);
      if (!submission) continue;

      stats.processed++;

      const existingVote = await ctx.db
        .query("votes")
        .withIndex("by_client_submission", (q) =>
          q
            .eq("clientId", args.clientId)
            .eq("submissionId", vote.submissionId)
            .eq("type", args.type),
        )
        .unique();

      if (existingVote) {
        if (existingVote.value === vote.value) {
          stats.unchanged++;
          continue;
        }

        await ctx.db.patch("votes", existingVote._id, { value: vote.value });

        const updates: VoteUpdate = {};
        if (vote.value === "up") {
          updates[upField] = submission[upField] + 1;
          updates[downField] = submission[downField] - 1;
        } else {
          updates[upField] = submission[upField] - 1;
          updates[downField] = submission[downField] + 1;
        }

        await ctx.db.patch("submissions", vote.submissionId, updates);
        stats.updated++;
      } else {
        await ctx.db.insert("votes", {
          submissionId: vote.submissionId,
          clientId: args.clientId,
          type: args.type,
          value: vote.value,
        });

        const updates: VoteUpdate = {};
        if (vote.value === "up") {
          updates[upField] = submission[upField] + 1;
        } else {
          updates[downField] = submission[downField] + 1;
        }

        await ctx.db.patch("submissions", vote.submissionId, updates);
        stats.created++;
      }
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
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_client_submission", (q) =>
        q
          .eq("clientId", args.clientId)
          .eq("submissionId", args.submissionId)
          .eq("type", args.type),
      )
      .unique();

    if (!existingVote) {
      return { removed: false, previousValue: null };
    }

    const submission = await ctx.db.get("submissions", args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    await ctx.db.delete("votes", existingVote._id);

    const { upField, downField } = getVoteFields(args.type);
    const updates: VoteUpdate = {};

    if (existingVote.value === "up") {
      updates[upField] = Math.max(0, submission[upField] - 1);
    } else {
      updates[downField] = Math.max(0, submission[downField] - 1);
    }

    await ctx.db.patch("submissions", args.submissionId, updates);
    return { removed: true, previousValue: existingVote.value };
  },
});
