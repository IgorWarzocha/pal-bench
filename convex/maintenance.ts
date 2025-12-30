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
    const speciesEntries = await ctx.db.query("species").collect();

    const speciesMap = new Map<number, string>();
    for (const s of speciesEntries) {
      speciesMap.set(s.id, s.name.toLowerCase().trim());
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
      const expectedName = speciesMap.get(submission.speciesNum);

      if (!expectedName) {
        await ctx.db.patch("submissions", submission._id, {
          isHallucination: true,
          hallucinationReason: `Invalid Species ID: ${submission.speciesNum}`,
        });
        flaggedCount++;
      } else if (submission.name.toLowerCase().trim() !== expectedName) {
        await ctx.db.patch("submissions", submission._id, {
          isHallucination: true,
          hallucinationReason: `Name mismatch: Expected "${expectedName}" (ID ${submission.speciesNum}), got "${submission.name}"`,
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
