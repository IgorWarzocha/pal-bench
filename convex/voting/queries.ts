/**
 * convex/voting/queries.ts
 * Vote retrieval queries respecting the 48-hour rolling cooldown.
 * Only returns votes within the active cooldown window.
 */
import { v } from "convex/values";
import { query } from "../_generated/server";
import { VoteValue, VOTE_COOLDOWN_MS } from "./helpers";

export const getClientVotes = query({
  args: {
    submissionId: v.id("submissions"),
    clientId: v.string(),
  },
  returns: v.object({
    imageVote: v.union(v.literal("up"), v.literal("down"), v.null()),
    dataVote: v.union(v.literal("up"), v.literal("down"), v.null()),
  }),
  handler: async (ctx, args) => {
    const cooldownThreshold = Date.now() - VOTE_COOLDOWN_MS;

    const imageVote = await ctx.db
      .query("votes")
      .withIndex("by_client_submission", (q) =>
        q.eq("clientId", args.clientId).eq("submissionId", args.submissionId).eq("type", "image"),
      )
      .order("desc")
      .first();

    const dataVote = await ctx.db
      .query("votes")
      .withIndex("by_client_submission", (q) =>
        q.eq("clientId", args.clientId).eq("submissionId", args.submissionId).eq("type", "data"),
      )
      .order("desc")
      .first();

    return {
      imageVote:
        imageVote && (imageVote.timestamp ?? 0) > cooldownThreshold ? imageVote.value : null,
      dataVote: dataVote && (dataVote.timestamp ?? 0) > cooldownThreshold ? dataVote.value : null,
    };
  },
});

export const getClientVotesBatch = query({
  args: {
    submissionIds: v.array(v.id("submissions")),
    clientId: v.string(),
  },
  returns: v.record(
    v.string(),
    v.object({
      imageVote: v.union(v.literal("up"), v.literal("down"), v.null()),
      dataVote: v.union(v.literal("up"), v.literal("down"), v.null()),
    }),
  ),
  handler: async (ctx, args) => {
    const cooldownThreshold = Date.now() - VOTE_COOLDOWN_MS;
    const result: Record<string, { imageVote: VoteValue | null; dataVote: VoteValue | null }> = {};

    for (const id of args.submissionIds) {
      result[id as string] = { imageVote: null, dataVote: null };
    }

    if (args.submissionIds.length === 0) {
      return result;
    }

    const allClientVotes = await ctx.db
      .query("votes")
      .withIndex("by_client_submission", (q) => q.eq("clientId", args.clientId))
      .collect();

    const submissionIdSet = new Set(args.submissionIds.map((id) => id as string));

    for (const vote of allClientVotes) {
      const voteTimestamp = vote.timestamp ?? 0;
      if (voteTimestamp <= cooldownThreshold) continue;

      const subId = vote.submissionId as string;
      if (submissionIdSet.has(subId)) {
        if (vote.type === "image") {
          result[subId].imageVote = vote.value;
        } else {
          result[subId].dataVote = vote.value;
        }
      }
    }

    return result;
  },
});

export const getClientVotedIds = query({
  args: {
    clientId: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const cooldownThreshold = Date.now() - VOTE_COOLDOWN_MS;

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_client_submission", (q) => q.eq("clientId", args.clientId))
      .collect();

    const votedIds = new Set<string>();
    for (const vote of votes) {
      const voteTimestamp = vote.timestamp ?? 0;
      if (vote.type === "image" && voteTimestamp > cooldownThreshold) {
        votedIds.add(vote.submissionId as string);
      }
    }

    return Array.from(votedIds);
  },
});
