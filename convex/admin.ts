/**
 * convex/admin.ts
 * Admin utilities for managing API secrets.
 * Provides internal mutations for secret key generation.
 */
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

function generateKey(): string {
  return (
    "pk_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export const createSecret = internalMutation({
  args: {
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const key = generateKey();
    await ctx.db.insert("secrets", {
      key,
      model: args.model,
      isActive: true,
    });
    return key;
  },
});
