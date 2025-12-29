/**
 * convex/pokedex.ts
 * Pokedex validation and seeding functions.
 * Validates Pokemon name/ID pairs and seeds the pokedex table from PokeAPI.
 */
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const validatePokedexEntry = internalQuery({
  args: {
    id: v.number(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("pokedex")
      .withIndex("by_pokedex_id", (q) => q.eq("id", args.id))
      .first();

    if (!entry) {
      return { valid: false, error: `Invalid Pokedex number: ${args.id}` };
    }

    if (entry.name.toLowerCase() !== args.name.toLowerCase().trim()) {
      return {
        valid: false,
        error: `Pokemon name mismatch. Expected "${entry.name}" for ID ${args.id}, got "${args.name}"`,
      };
    }

    return { valid: true };
  },
});

export const seedPokedex = internalMutation({
  args: {
    entries: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const entry of args.entries) {
      const exists = await ctx.db
        .query("pokedex")
        .withIndex("by_pokedex_id", (q) => q.eq("id", entry.id))
        .first();

      if (!exists) {
        await ctx.db.insert("pokedex", entry);
      }
    }
  },
});
