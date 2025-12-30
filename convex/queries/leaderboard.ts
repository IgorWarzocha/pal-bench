/**
 * convex/queries/leaderboard.ts
 * Leaderboard rankings and platform statistics.
 * Provides model comparisons, hallucination tracking, and coverage metrics.
 */
import { v } from "convex/values";
import { query } from "../_generated/server";
import { submissionValidator } from "../validators";

function calculateNetScore(upvotes: number, downvotes: number): number {
  return upvotes - downvotes;
}

export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    model: v.optional(v.string()),
  },
  returns: v.array(submissionValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let submissions;

    if (args.model) {
      submissions = await ctx.db
        .query("submissions")
        .withIndex("by_model", (q) => q.eq("model", args.model!))
        .collect();

      submissions.sort((a, b) => {
        const aScore = calculateNetScore(a.upvotes_image, a.downvotes_image);
        const bScore = calculateNetScore(b.upvotes_image, b.downvotes_image);
        return bScore - aScore;
      });

      return submissions.slice(0, limit);
    }

    submissions = await ctx.db
      .query("submissions")
      .withIndex("by_votes_image")
      .order("desc")
      .take(limit * 2);

    submissions.sort((a, b) => {
      const aScore = calculateNetScore(a.upvotes_image, a.downvotes_image);
      const bScore = calculateNetScore(b.upvotes_image, b.downvotes_image);
      return bScore - aScore;
    });

    return submissions.slice(0, limit);
  },
});

export const getModels = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();

    const uniqueModels = new Set<string>();
    for (const submission of submissions) {
      uniqueModels.add(submission.model);
    }

    return Array.from(uniqueModels).sort();
  },
});
