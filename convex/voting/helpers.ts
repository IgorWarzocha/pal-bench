/**
 * convex/voting/helpers.ts
 * Core vote processing logic for the 48-hour rolling vote system.
 * Users can re-vote after cooldown; scores accumulate for sentiment tracking.
 */
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export type VoteValue = "up" | "down";
export type VoteType = "image" | "data";

/** 48 hours in milliseconds */
export const VOTE_COOLDOWN_MS = 48 * 60 * 60 * 1000;

export interface VoteUpdate {
  upvotes_image?: number;
  downvotes_image?: number;
  upvotes_data?: number;
  downvotes_data?: number;
}

export const voteTypeValidator = v.union(v.literal("image"), v.literal("data"));
export const voteValueValidator = v.union(v.literal("up"), v.literal("down"));

export function getVoteFields(type: VoteType) {
  return {
    upField: type === "image" ? "upvotes_image" : "upvotes_data",
    downField: type === "image" ? "downvotes_image" : "downvotes_data",
  } as const;
}

interface ProcessVoteResult {
  action: "created" | "updated" | "unchanged";
  previousValue: VoteValue | null;
}

/** Processes a vote: updates existing if within cooldown, else creates new (cumulative). */
export async function processVote(
  ctx: MutationCtx,
  submission: Doc<"submissions">,
  clientId: string,
  type: VoteType,
  value: VoteValue,
): Promise<ProcessVoteResult> {
  const now = Date.now();
  const cooldownThreshold = now - VOTE_COOLDOWN_MS;

  // Find the most recent vote from this client on this submission
  const recentVote = await ctx.db
    .query("votes")
    .withIndex("by_client_submission", (q) =>
      q
        .eq("clientId", clientId)
        .eq("submissionId", submission._id)
        .eq("type", type),
    )
    .order("desc")
    .first();

  const { upField, downField } = getVoteFields(type);

  // If there's a recent vote within the cooldown period, update it
  // Votes without timestamp (pre-migration) are treated as expired
  const voteTimestamp = recentVote?.timestamp ?? 0;
  if (recentVote && voteTimestamp > cooldownThreshold) {
    if (recentVote.value === value) {
      return { action: "unchanged", previousValue: recentVote.value };
    }

    await ctx.db.patch("votes", recentVote._id, { value, timestamp: now });

    const updates: VoteUpdate = {};
    if (value === "up") {
      updates[upField] = submission[upField] + 1;
      updates[downField] = Math.max(0, submission[downField] - 1);
    } else {
      updates[upField] = Math.max(0, submission[upField] - 1);
      updates[downField] = submission[downField] + 1;
    }

    await ctx.db.patch("submissions", submission._id, updates);
    return { action: "updated", previousValue: recentVote.value };
  }

  // No recent vote or vote is outside cooldown - create new vote (cumulative)
  await ctx.db.insert("votes", {
    submissionId: submission._id,
    clientId,
    type,
    value,
    timestamp: now,
  });

  const updates: VoteUpdate = {};
  if (value === "up") {
    updates[upField] = submission[upField] + 1;
  } else {
    updates[downField] = submission[downField] + 1;
  }

  await ctx.db.patch("submissions", submission._id, updates);
  return { action: "created", previousValue: null };
}
