/**
 * convex/validators.ts
 * Centralized validators for all Convex function arguments and return types.
 */
import { v } from "convex/values";

export const submissionValidator = v.object({
  _id: v.id("submissions"),
  _creationTime: v.number(),
  model: v.string(),
  name: v.string(),
  speciesNum: v.number(),
  description: v.string(),
  svgCode: v.string(),
  upvotes_image: v.number(),
  downvotes_image: v.number(),
  upvotes_data: v.number(),
  downvotes_data: v.number(),
  isHallucination: v.optional(v.boolean()),
  hallucinationReason: v.optional(v.string()),
  timestamp: v.number(),
});

export const sortByValidator = v.union(
  v.literal("newest"),
  v.literal("oldest"),
  v.literal("most_upvoted"),
);

export const modelStatsValidator = v.object({
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

export const platformStatsValidator = v.object({
  totalSubmissions: v.number(),
  totalVotes: v.number(),
  totalHallucinations: v.number(),
  hallucinationRate: v.number(),
  modelStats: v.array(modelStatsValidator),
  speciesCoverage: v.object({
    unique: v.number(),
    total: v.number(),
  }),
});

export { voteTypeValidator, voteValueValidator } from "./voting/helpers";
