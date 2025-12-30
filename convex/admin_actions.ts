/**
 * convex/admin_actions.ts
 * Admin actions for data seeding operations.
 * Fetches Pal data from external source and populates the species table.
 */
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

interface SpeciesEntry {
  entry_number: number;
  pokemon_species: { name: string };
}

interface NationalDexResponse {
  pokemon_entries: SpeciesEntry[];
}

export const seedSpeciesData = internalAction({
  args: {},
  handler: async (ctx) => {
    // We still use PokeAPI for the source data, but map it to our generic "Species" schema.
    const res = await fetch("https://pokeapi.co/api/v2/pokedex/national");
    const data = (await res.json()) as NationalDexResponse;

    const allEntries = data.pokemon_entries.map((p) => ({
      id: p.entry_number,
      name: p.pokemon_species.name,
    }));

    const BATCH_SIZE = 100;
    for (let i = 0; i < allEntries.length; i += BATCH_SIZE) {
      const batch = allEntries.slice(i, i + BATCH_SIZE);
      await ctx.runMutation(internal.species.seedSpecies, { entries: batch });
    }
  },
});
