import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

interface PlatformStatsDoc {
  _id: Id<"platformStats">;
  totalSubmissions: number;
  totalVotes: number;
  totalHallucinations: number;
  speciesCoverage: {
    unique: number;
    total: number;
  };
}

interface ModelStatsDoc {
  _id: Id<"modelStats">;
  model: string;
  submissionCount: number;
  totalUpvotesImage: number;
  totalDownvotesImage: number;
  totalUpvotesData: number;
  totalDownvotesData: number;
  hallucinationCount: number;
}

const TOTAL_SPECIES = 1025;

async function getOrCreatePlatformStats(ctx: MutationCtx): Promise<PlatformStatsDoc> {
  const existing = await ctx.db.query("platformStats").first();
  if (existing) {
    return existing;
  }

  const id = await ctx.db.insert("platformStats", {
    totalSubmissions: 0,
    totalVotes: 0,
    totalHallucinations: 0,
    speciesCoverage: { unique: 0, total: TOTAL_SPECIES },
    lastUpdated: Date.now(),
  });

  const created = await ctx.db.get("platformStats", id);
  if (!created) {
    throw new Error("Failed to create platform stats");
  }

  return created;
}

async function getOrCreateModelStats(ctx: MutationCtx, model: string): Promise<ModelStatsDoc> {
  const existing = await ctx.db
    .query("modelStats")
    .withIndex("by_model", (q) => q.eq("model", model))
    .first();

  if (existing) {
    return existing;
  }

  const id = await ctx.db.insert("modelStats", {
    model,
    submissionCount: 0,
    totalUpvotesImage: 0,
    totalDownvotesImage: 0,
    totalUpvotesData: 0,
    totalDownvotesData: 0,
    hallucinationCount: 0,
    avgNetScoreImage: 0,
    avgNetScoreData: 0,
    hallucinationRate: 0,
    lastUpdated: Date.now(),
  });

  const created = await ctx.db.get("modelStats", id);
  if (!created) {
    throw new Error(`Failed to create model stats for ${model}`);
  }

  return created;
}

function computeModelDerived(stats: {
  submissionCount: number;
  totalUpvotesImage: number;
  totalDownvotesImage: number;
  totalUpvotesData: number;
  totalDownvotesData: number;
  hallucinationCount: number;
}) {
  const { submissionCount } = stats;
  return {
    avgNetScoreImage:
      submissionCount > 0
        ? (stats.totalUpvotesImage - stats.totalDownvotesImage) / submissionCount
        : 0,
    avgNetScoreData:
      submissionCount > 0
        ? (stats.totalUpvotesData - stats.totalDownvotesData) / submissionCount
        : 0,
    hallucinationRate: submissionCount > 0 ? (stats.hallucinationCount / submissionCount) * 100 : 0,
  };
}

export async function applySubmissionCreatedStats(
  ctx: MutationCtx,
  args: { model: string; speciesNum: number; isHallucination: boolean },
): Promise<void> {
  const platform = await getOrCreatePlatformStats(ctx);

  const existingSpeciesSubmission = await ctx.db
    .query("submissions")
    .withIndex("by_species_num", (q) => q.eq("speciesNum", args.speciesNum))
    .take(1);

  const uniqueSpeciesIncrement = existingSpeciesSubmission.length === 0 ? 1 : 0;

  await ctx.db.patch("platformStats", platform._id, {
    totalSubmissions: platform.totalSubmissions + 1,
    totalHallucinations: platform.totalHallucinations + (args.isHallucination ? 1 : 0),
    speciesCoverage: {
      ...platform.speciesCoverage,
      unique: platform.speciesCoverage.unique + uniqueSpeciesIncrement,
    },
    lastUpdated: Date.now(),
  });

  const modelStats = await getOrCreateModelStats(ctx, args.model);
  const submissionCount = modelStats.submissionCount + 1;
  const hallucinationCount = modelStats.hallucinationCount + (args.isHallucination ? 1 : 0);

  await ctx.db.patch("modelStats", modelStats._id, {
    submissionCount,
    hallucinationCount,
    ...computeModelDerived({
      submissionCount,
      totalUpvotesImage: modelStats.totalUpvotesImage,
      totalDownvotesImage: modelStats.totalDownvotesImage,
      totalUpvotesData: modelStats.totalUpvotesData,
      totalDownvotesData: modelStats.totalDownvotesData,
      hallucinationCount,
    }),
    lastUpdated: Date.now(),
  });
}

export async function applyVoteDeltaStats(
  ctx: MutationCtx,
  args: {
    model: string;
    totalVotesDelta?: number;
    upvotesImageDelta?: number;
    downvotesImageDelta?: number;
    upvotesDataDelta?: number;
    downvotesDataDelta?: number;
  },
): Promise<void> {
  const platform = await getOrCreatePlatformStats(ctx);
  const modelStats = await getOrCreateModelStats(ctx, args.model);

  const totalUpvotesImage = modelStats.totalUpvotesImage + (args.upvotesImageDelta ?? 0);
  const totalDownvotesImage = modelStats.totalDownvotesImage + (args.downvotesImageDelta ?? 0);
  const totalUpvotesData = modelStats.totalUpvotesData + (args.upvotesDataDelta ?? 0);
  const totalDownvotesData = modelStats.totalDownvotesData + (args.downvotesDataDelta ?? 0);

  await ctx.db.patch("platformStats", platform._id, {
    totalVotes: Math.max(0, platform.totalVotes + (args.totalVotesDelta ?? 0)),
    lastUpdated: Date.now(),
  });

  await ctx.db.patch("modelStats", modelStats._id, {
    totalUpvotesImage,
    totalDownvotesImage,
    totalUpvotesData,
    totalDownvotesData,
    ...computeModelDerived({
      submissionCount: modelStats.submissionCount,
      totalUpvotesImage,
      totalDownvotesImage,
      totalUpvotesData,
      totalDownvotesData,
      hallucinationCount: modelStats.hallucinationCount,
    }),
    lastUpdated: Date.now(),
  });
}
