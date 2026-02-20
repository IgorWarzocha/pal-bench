/**
 * convex/queries/stats.ts
 * Platform-wide statistics from pre-computed aggregates.
 */
import { query } from "../_generated/server";
import { platformStatsValidator } from "../validators";

export const getStats = query({
  args: {},
  returns: platformStatsValidator,
  handler: async (ctx) => {
    const cachedStats = await ctx.db.query("platformStats").first();
    const modelStats = await ctx.db.query("modelStats").collect();

    if (!cachedStats) {
      return {
        totalSubmissions: 0,
        totalVotes: 0,
        totalHallucinations: 0,
        hallucinationRate: 0,
        modelStats: [],
        speciesCoverage: {
          unique: 0,
          total: 1025,
        },
      };
    }

    return {
      totalSubmissions: cachedStats.totalSubmissions,
      totalVotes: cachedStats.totalVotes,
      totalHallucinations: cachedStats.totalHallucinations,
      hallucinationRate:
        cachedStats.totalSubmissions > 0
          ? (cachedStats.totalHallucinations / cachedStats.totalSubmissions) * 100
          : 0,
      modelStats: modelStats.map((ms) => ({
        model: ms.model,
        submissionCount: ms.submissionCount,
        totalUpvotesImage: ms.totalUpvotesImage,
        totalDownvotesImage: ms.totalDownvotesImage,
        totalUpvotesData: ms.totalUpvotesData,
        totalDownvotesData: ms.totalDownvotesData,
        hallucinationCount: ms.hallucinationCount,
        avgNetScoreImage: ms.avgNetScoreImage,
        avgNetScoreData: ms.avgNetScoreData,
        hallucinationRate: ms.hallucinationRate,
      })),
      speciesCoverage: cachedStats.speciesCoverage,
    };
  },
});
