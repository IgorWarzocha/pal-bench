/**
 * convex/maintenance.ts
 * Database maintenance and migration scripts.
 * Includes retroactive hallucination flagging for data integrity.
 */
import { internalMutation } from "./_generated/server";

export const flagInvalidNames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();
    const pokedexEntries = await ctx.db.query("pokedex").collect();

    const pokedexMap = new Map<number, string>();
    for (const p of pokedexEntries) {
      pokedexMap.set(p.id, p.name.toLowerCase().trim());
    }

    let flaggedCount = 0;
    let checkedCount = 0;

    for (const submission of submissions) {
      let isHallucination = submission.isHallucination;
      if (isHallucination === undefined) {
        isHallucination = false;
      }

      if (isHallucination === true) continue;

      checkedCount++;
      const expectedName = pokedexMap.get(submission.pokedexNumber);

      if (!expectedName) {
        await ctx.db.patch("submissions", submission._id, {
          isHallucination: true,
          hallucinationReason: `Invalid Pokedex ID: ${submission.pokedexNumber}`,
        });
        flaggedCount++;
      } else if (submission.name.toLowerCase().trim() !== expectedName) {
        await ctx.db.patch("submissions", submission._id, {
          isHallucination: true,
          hallucinationReason: `Name mismatch: Expected "${expectedName}" (ID ${submission.pokedexNumber}), got "${submission.name}"`,
        });
        flaggedCount++;
      } else if (submission.isHallucination === undefined) {
        await ctx.db.patch("submissions", submission._id, {
          isHallucination: false,
        });
      }
    }

    return {
      totalSubmissions: submissions.length,
      checkedCount,
      flaggedCount,
      message: `Checked ${checkedCount} submissions. Flagged ${flaggedCount} new hallucinations.`,
    };
  },
});
