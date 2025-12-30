/**
 * convex/species.ts
 * Species validation and seeding functions.
 * Validates Pal name/ID pairs and seeds the species table.
 */
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const validateSpeciesEntry = internalQuery({
  args: {
    id: v.number(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("species")
      .withIndex("by_species_id", (q) => q.eq("id", args.id))
      .first();

    if (!entry) {
      return { valid: false, error: `Invalid Species ID: ${args.id}` };
    }

    if (entry.name.toLowerCase() !== args.name.toLowerCase().trim()) {
      return {
        valid: false,
        error: `Species name mismatch. Expected "${entry.name}" for ID ${args.id}, got "${args.name}"`,
      };
    }

    return { valid: true };
  },
});

export const seedSpecies = internalMutation({
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
        .query("species")
        .withIndex("by_species_id", (q) => q.eq("id", entry.id))
        .first();

      if (!exists) {
        await ctx.db.insert("species", entry);
      }
    }
  },
});
