/**
 * convex/queries/stats.ts
 * Platform-wide statistics aggregation including model performance and coverage metrics.
 */
import { query } from "../_generated/server";
import { platformStatsValidator } from "../validators";

interface ModelAccumulator {
  submissionCount: number;
  totalUpvotesImage: number;
  totalDownvotesImage: number;
  totalUpvotesData: number;
  totalDownvotesData: number;
  hallucinationCount: number;
}

export const getStats = query({
  args: {},
  returns: platformStatsValidator,
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();
    const votes = await ctx.db.query("votes").collect();

    const modelMap = new Map<string, ModelAccumulator>();
    const speciesIds = new Set<number>();
    let totalHallucinations = 0;

    for (const submission of submissions) {
      speciesIds.add(submission.speciesNum);

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
      speciesCoverage: {
        unique: speciesIds.size,
        total: 1025,
      },
    };
  },
});
