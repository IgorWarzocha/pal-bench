/**
 * convex/submission.ts
 * Internal functions for creating and validating Pal submissions.
 * Handles API key validation and hallucination flagging.
 */
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { applySubmissionCreatedStats } from "./stats_helpers";

/**
 * Validates an API key and returns the associated model name if valid.
 * Used by the HTTP endpoint to authenticate submissions.
 */
export const validateSecret = internalQuery({
  args: { key: v.string() },
  returns: v.union(v.object({ model: v.string(), username: v.optional(v.string()) }), v.null()),
  handler: async (ctx, args) => {
    const secret = await ctx.db
      .query("secrets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!secret || !secret.isActive) {
      return null;
    }

    if (secret.expiresAt === undefined || Date.now() > secret.expiresAt) {
      return null;
    }

    return { model: secret.model, username: secret.username };
  },
});

/**
 * Creates a new submission in the database.
 * Called by the HTTP endpoint after secret validation.
 * Supports the Silent Failure / Name & Shame pattern for hallucinations.
 */
export const createSubmission = internalMutation({
  args: {
    model: v.string(),
    name: v.string(),
    speciesNum: v.number(),
    description: v.string(),
    svgCode: v.string(),
    isHallucination: v.boolean(),
    hallucinationReason: v.optional(v.string()),
  },
  returns: v.id("submissions"),
  handler: async (ctx, args) => {
    let isHallucination = args.isHallucination;
    let hallucinationReason = args.hallucinationReason;

    // Validate against Species if not already flagged
    if (!isHallucination) {
      const speciesEntry = await ctx.db
        .query("species")
        .withIndex("by_species_id", (q) => q.eq("id", args.speciesNum))
        .unique();

      if (!speciesEntry) {
        isHallucination = true;
        hallucinationReason = `Invalid Species ID: ${args.speciesNum}`;
      } else if (speciesEntry.name.toLowerCase().trim() !== args.name.toLowerCase().trim()) {
        isHallucination = true;
        hallucinationReason = `Name mismatch: Expected "${speciesEntry.name}", got "${args.name}"`;
      }
    }

    const submissionId = await ctx.db.insert("submissions", {
      model: args.model,
      name: args.name,
      speciesNum: args.speciesNum,
      description: args.description,
      svgCode: args.svgCode,
      upvotes_image: 0,
      downvotes_image: 0,
      upvotes_data: 0,
      downvotes_data: 0,
      isHallucination,
      hallucinationReason,
      timestamp: Date.now(),
    });

    await applySubmissionCreatedStats(ctx, {
      model: args.model,
      speciesNum: args.speciesNum,
      isHallucination,
    });

    return submissionId;
  },
});

/**
 * Gets a submission by ID (internal use).
 */
export const getSubmission = internalQuery({
  args: { id: v.id("submissions") },
  returns: v.union(
    v.object({
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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get("submissions", args.id);
  },
});
