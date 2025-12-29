/**
 * convex/queries/search.ts
 * Search functionality for Pokemon submissions.
 * Provides full-text search with optional model filtering.
 */
import { v } from "convex/values";
import { query } from "../_generated/server";
import { submissionValidator } from "../validators";

export const searchSubmissions = query({
  args: {
    searchQuery: v.string(),
    model: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(submissionValidator),
  handler: async (ctx, args) => {
    if (!args.searchQuery.trim()) {
      return [];
    }

    const limit = args.limit ?? 20;

    const searchResults = ctx.db
      .query("submissions")
      .withSearchIndex("search_name", (q) => {
        const sq = q.search("name", args.searchQuery);
        if (args.model) {
          return sq.eq("model", args.model);
        }
        return sq;
      });

    return await searchResults.take(limit);
  },
});
