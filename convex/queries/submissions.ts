/**
 * convex/queries/submissions.ts
 * Core submission queries for fetching, listing, and filtering Pal submissions.
 * Handles pagination and model-based filtering.
 */
import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { submissionValidator, sortByValidator } from "../validators";

export const getSubmission = query({
  args: { id: v.id("submissions") },
  returns: v.union(submissionValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("submissions", args.id);
  },
});

export const listSubmissions = query({
  args: {
    paginationOpts: paginationOptsValidator,
    model: v.optional(v.string()),
    sortBy: v.optional(sortByValidator),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy ?? "newest";

    let baseQuery;

    if (args.model) {
      baseQuery = ctx.db
        .query("submissions")
        .withIndex("by_model", (q) => q.eq("model", args.model!));
    } else if (sortBy === "most_upvoted") {
      baseQuery = ctx.db.query("submissions").withIndex("by_votes_image");
    } else {
      baseQuery = ctx.db.query("submissions").withIndex("by_timestamp");
    }

    if (sortBy === "oldest") {
      baseQuery = baseQuery.order("asc");
    } else {
      baseQuery = baseQuery.order("desc");
    }

    return await baseQuery.paginate(args.paginationOpts);
  },
});

export const getRecentSubmissions = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(submissionValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    return await ctx.db
      .query("submissions")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getSubmissionsBySpecies = query({
  args: {
    speciesNum: v.number(),
  },
  returns: v.array(submissionValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_species_num", (q) => q.eq("speciesNum", args.speciesNum))
      .collect();
  },
});

export const getSubmissionsByModel = query({
  args: {
    model: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(submissionValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    return await ctx.db
      .query("submissions")
      .withIndex("by_model", (q) => q.eq("model", args.model))
      .order("desc")
      .take(limit);
  },
});
