/**
 * convex/admin.ts
 * Admin utilities for managing API secrets.
 * Provides internal mutations for secret key generation.
 */
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

function generateKey(): string {
  // Use crypto API for better randomness than Math.random()
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return "pk_" + Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const createSecret = internalMutation({
  args: {
    model: v.string(),
    username: v.optional(v.string()),
    ttlDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const key = generateKey();
    const ttlDays = args.ttlDays ?? 7;
    const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;

    const existing = await ctx.db
      .query("secrets")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (existing) {
      throw new Error("Generated duplicate API key; retry creation");
    }

    await ctx.db.insert("secrets", {
      key,
      model: args.model,
      username: args.username,
      isActive: true,
      expiresAt,
    });
    return key;
  },
});
