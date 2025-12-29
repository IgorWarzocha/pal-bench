/**
 * convex/validators.ts
 * Shared validators and type definitions for Convex functions.
 * Provides reusable validators for submissions and common patterns.
 */
import { v } from "convex/values";

export const submissionValidator = v.object({
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
});

export const sortByValidator = v.union(
  v.literal("newest"),
  v.literal("oldest"),
  v.literal("most_upvoted"),
);

// Re-export vote validators from voting module for convenience
export { voteTypeValidator, voteValueValidator } from "./voting/helpers";
