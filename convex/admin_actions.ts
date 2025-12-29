/**
 * convex/admin_actions.ts
 * Admin actions for data seeding operations.
 * Fetches Pokemon data from PokeAPI and populates the pokedex table.
 */
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

interface PokedexEntry {
  entry_number: number;
  pokemon_species: { name: string };
}

interface NationalPokedexResponse {
  pokemon_entries: PokedexEntry[];
}

export const seedPokedexData = internalAction({
  args: {},
  handler: async (ctx) => {
    const res = await fetch("https://pokeapi.co/api/v2/pokedex/national");
    const data = (await res.json()) as NationalPokedexResponse;

    const allEntries = data.pokemon_entries.map((p) => ({
      id: p.entry_number,
      name: p.pokemon_species.name,
    }));

    const BATCH_SIZE = 100;
    for (let i = 0; i < allEntries.length; i += BATCH_SIZE) {
      const batch = allEntries.slice(i, i + BATCH_SIZE);
      await ctx.runMutation(internal.pokedex.seedPokedex, { entries: batch });
    }
  },
});
