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

const modelStatsValidator = v.object({
  model: v.string(),
  submissionCount: v.number(),
  totalUpvotesImage: v.number(),
  totalDownvotesImage: v.number(),
  totalUpvotesData: v.number(),
  totalDownvotesData: v.number(),
  avgNetScoreImage: v.number(),
  avgNetScoreData: v.number(),
  hallucinationCount: v.number(),
  hallucinationRate: v.number(),
});

export const getStats = query({
  args: {},
  returns: v.object({
    totalSubmissions: v.number(),
    totalVotes: v.number(),
    totalHallucinations: v.number(),
    hallucinationRate: v.number(),
    modelStats: v.array(modelStatsValidator),
    pokedexCoverage: v.object({
      unique: v.number(),
      total: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();
    const votes = await ctx.db.query("votes").collect();

    const modelMap = new Map<
      string,
      {
        submissionCount: number;
        totalUpvotesImage: number;
        totalDownvotesImage: number;
        totalUpvotesData: number;
        totalDownvotesData: number;
        hallucinationCount: number;
      }
    >();

    const pokedexNumbers = new Set<number>();
    let totalHallucinations = 0;

    for (const submission of submissions) {
      pokedexNumbers.add(submission.pokedexNumber);

      if (submission.isHallucination) {
        totalHallucinations++;
      }

      const existing = modelMap.get(submission.model);
      if (existing) {
        existing.submissionCount++;
        existing.totalUpvotesImage += submission.upvotes_image;
        existing.totalDownvotesImage += submission.downvotes_image;
        existing.totalUpvotesData += submission.upvotes_data;
        existing.totalDownvotesData += submission.downvotes_data;
        if (submission.isHallucination) {
          existing.hallucinationCount++;
        }
      } else {
        modelMap.set(submission.model, {
          submissionCount: 1,
          totalUpvotesImage: submission.upvotes_image,
          totalDownvotesImage: submission.downvotes_image,
          totalUpvotesData: submission.upvotes_data,
          totalDownvotesData: submission.downvotes_data,
          hallucinationCount: submission.isHallucination ? 1 : 0,
        });
      }
    }

    const modelStats = Array.from(modelMap.entries())
      .map(([model, stats]) => ({
        model,
        ...stats,
        avgNetScoreImage:
          stats.submissionCount > 0
            ? (stats.totalUpvotesImage - stats.totalDownvotesImage) /
              stats.submissionCount
            : 0,
        avgNetScoreData:
          stats.submissionCount > 0
            ? (stats.totalUpvotesData - stats.totalDownvotesData) /
              stats.submissionCount
            : 0,
        hallucinationRate:
          stats.submissionCount > 0
            ? (stats.hallucinationCount / stats.submissionCount) * 100
            : 0,
      }))
      .sort((a, b) => b.avgNetScoreImage - a.avgNetScoreImage);

    return {
      totalSubmissions: submissions.length,
      totalVotes: votes.length,
      totalHallucinations,
      hallucinationRate:
        submissions.length > 0
          ? (totalHallucinations / submissions.length) * 100
          : 0,
      modelStats,
      pokedexCoverage: {
        unique: pokedexNumbers.size,
        total: 1025,
      },
    };
  },
});
