/**
 * convex/submission.ts
 * Internal functions for creating and validating Pokemon submissions.
 * Handles API key validation and hallucination flagging.
 */
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Validates an API key and returns the associated model name if valid.
 * Used by the HTTP endpoint to authenticate submissions.
 */
export const validateSecret = internalQuery({
  args: { key: v.string() },
  returns: v.union(v.object({ model: v.string() }), v.null()),
  handler: async (ctx, args) => {
    const secret = await ctx.db
      .query("secrets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!secret || !secret.isActive) {
      return null;
    }

    return { model: secret.model };
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
    pokedexNumber: v.number(),
    description: v.string(),
    svgCode: v.string(),
    isHallucination: v.boolean(),
    hallucinationReason: v.optional(v.string()),
  },
  returns: v.id("submissions"),
  handler: async (ctx, args) => {
    let isHallucination = args.isHallucination;
    let hallucinationReason = args.hallucinationReason;

    // Validate against Pokedex if not already flagged
    if (!isHallucination) {
      const pokedexEntry = await ctx.db
        .query("pokedex")
        .withIndex("by_pokedex_id", (q) => q.eq("id", args.pokedexNumber))
        .unique();

      if (!pokedexEntry) {
        isHallucination = true;
        hallucinationReason = `Invalid Pokedex ID: ${args.pokedexNumber}`;
      } else if (
        pokedexEntry.name.toLowerCase().trim() !==
        args.name.toLowerCase().trim()
      ) {
        isHallucination = true;
        hallucinationReason = `Name mismatch: Expected "${pokedexEntry.name}", got "${args.name}"`;
      }
    }

    const submissionId = await ctx.db.insert("submissions", {
      model: args.model,
      name: args.name,
      pokedexNumber: args.pokedexNumber,
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
      pokedexNumber: v.number(),
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
