/**
 * convex/stats.ts
 * Internal mutations for computing and caching platform stats.
 * Updates pre-computed aggregates to avoid expensive full-table scans.
 */
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const recomputeStats = internalMutation({
  args: {},
  returns: v.object({
    totalSubmissions: v.number(),
    totalVotes: v.number(),
    totalHallucinations: v.number(),
    speciesCoverage: v.object({
      unique: v.number(),
      total: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();
    const votes = await ctx.db.query("votes").collect();

    // Calculate platform stats
    const speciesIds = new Set<number>();
    let totalHallucinations = 0;

    for (const submission of submissions) {
      speciesIds.add(submission.speciesNum);
      if (submission.isHallucination) {
        totalHallucinations++;
      }
    }

    const platformStats = {
      totalSubmissions: submissions.length,
      totalVotes: votes.length,
      totalHallucinations,
      speciesCoverage: {
        unique: speciesIds.size,
        total: 1025,
      },
    };

    // Update or create platform stats doc
    const existing = await ctx.db.query("platformStats").first();
    if (existing) {
      await ctx.db.patch("platformStats", existing._id, {
        ...platformStats,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("platformStats", {
        ...platformStats,
        lastUpdated: Date.now(),
      });
    }

    return platformStats;
  },
});

export const recomputeModelStats = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();

    // Aggregate by model
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

    for (const submission of submissions) {
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

    // Compute stats for each model
    let updated = 0;
    for (const [model, stats] of modelMap.entries()) {
      const avgNetScoreImage =
        stats.submissionCount > 0
          ? (stats.totalUpvotesImage - stats.totalDownvotesImage) / stats.submissionCount
          : 0;
      const avgNetScoreData =
        stats.submissionCount > 0
          ? (stats.totalUpvotesData - stats.totalDownvotesData) / stats.submissionCount
          : 0;
      const hallucinationRate =
        stats.submissionCount > 0 ? (stats.hallucinationCount / stats.submissionCount) * 100 : 0;

      const modelStats = {
        model,
        submissionCount: stats.submissionCount,
        totalUpvotesImage: stats.totalUpvotesImage,
        totalDownvotesImage: stats.totalDownvotesImage,
        totalUpvotesData: stats.totalUpvotesData,
        totalDownvotesData: stats.totalDownvotesData,
        hallucinationCount: stats.hallucinationCount,
        avgNetScoreImage,
        avgNetScoreData,
        hallucinationRate,
        lastUpdated: Date.now(),
      };

      // Update or create
      const existing = await ctx.db
        .query("modelStats")
        .withIndex("by_model", (q) => q.eq("model", model))
        .first();
      if (existing) {
        await ctx.db.patch("modelStats", existing._id, modelStats);
      } else {
        await ctx.db.insert("modelStats", modelStats);
      }
      updated++;
    }

    return updated;
  },
});
