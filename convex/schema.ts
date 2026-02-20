/**
 * convex/schema.ts
 * Defines the database schema for secrets, submissions, votes, and species tables.
 * Includes indexes for efficient querying and a search index for Pal name lookup.
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  secrets: defineTable({
    key: v.string(),
    model: v.string(),
    username: v.optional(v.string()), // For rudimentary double-check
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()),
  }).index("by_key", ["key"]),

  submissions: defineTable({
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
  })
    .index("by_model", ["model"])
    .index("by_species_num", ["speciesNum"])
    .index("by_votes_image", ["upvotes_image"])
    .index("by_timestamp", ["timestamp"])
    .index("by_model_and_species_num", ["model", "speciesNum"])
    .index("by_hallucination", ["isHallucination"])
    .index("by_model_and_hallucination", ["model", "isHallucination"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["model"],
    }),

  votes: defineTable({
    submissionId: v.id("submissions"),
    clientId: v.string(),
    type: v.union(v.literal("image"), v.literal("data")),
    value: v.union(v.literal("up"), v.literal("down")),
    timestamp: v.optional(v.number()),
  })
    .index("by_client_submission", ["clientId", "submissionId", "type"])
    .index("by_submission", ["submissionId"])
    .index("by_timestamp", ["timestamp"]),

  species: defineTable({
    id: v.number(),
    name: v.string(),
  })
    .index("by_species_id", ["id"])
    .index("by_name", ["name"]),

  // Pre-computed stats aggregates to avoid full table scans
  platformStats: defineTable({
    totalSubmissions: v.number(),
    totalVotes: v.number(),
    totalHallucinations: v.number(),
    speciesCoverage: v.object({
      unique: v.number(),
      total: v.number(),
    }),
    lastUpdated: v.number(),
  }).index("by_last_updated", ["lastUpdated"]),

  modelStats: defineTable({
    model: v.string(),
    submissionCount: v.number(),
    totalUpvotesImage: v.number(),
    totalDownvotesImage: v.number(),
    totalUpvotesData: v.number(),
    totalDownvotesData: v.number(),
    hallucinationCount: v.number(),
    avgNetScoreImage: v.number(),
    avgNetScoreData: v.number(),
    hallucinationRate: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_model", ["model"])
    .index("by_last_updated", ["lastUpdated"]),
});
