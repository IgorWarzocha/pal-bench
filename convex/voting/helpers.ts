/**
 * convex/voting/helpers.ts
 * Shared types and utilities for voting operations.
 */
import { v } from "convex/values";

export type VoteValue = "up" | "down";
export type VoteType = "image" | "data";

export interface VoteUpdate {
  upvotes_image?: number;
  downvotes_image?: number;
  upvotes_data?: number;
  downvotes_data?: number;
}

export const voteTypeValidator = v.union(v.literal("image"), v.literal("data"));
export const voteValueValidator = v.union(v.literal("up"), v.literal("down"));

export function getVoteFields(type: VoteType) {
  return {
    upField: type === "image" ? "upvotes_image" : "upvotes_data",
    downField: type === "image" ? "downvotes_image" : "downvotes_data",
  } as const;
}
