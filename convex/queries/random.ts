/**
 * convex/queries/random.ts
 * Random submission selection for the rating flow.
 * Client passes excludeIds to filter without querying votes table.
 */
import { v } from "convex/values";
import { query } from "../_generated/server";
import { submissionValidator } from "../validators";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let m = shuffled.length;

  while (m) {
    const i = Math.floor(seededRandom(seed + m) * m--);
    [shuffled[m], shuffled[i]] = [shuffled[i], shuffled[m]];
  }

  return shuffled;
}

export const getRandomUnvotedSubmissions = query({
  args: {
    excludeIds: v.array(v.id("submissions")),
    limit: v.optional(v.number()),
  },
  returns: v.array(submissionValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const excludeSet = new Set(args.excludeIds.map((id) => id as string));

    // Fetch enough to account for exclusions and hallucinations
    const fetchLimit = Math.min(limit + excludeSet.size + 20, 150);

    const seed = Math.floor(Date.now() / 60000);
    const useDesc = seed % 2 === 0;

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_timestamp")
      .order(useDesc ? "desc" : "asc")
      .take(fetchLimit);

    const filtered = submissions.filter(
      (s) => !excludeSet.has(s._id as string) && s.isHallucination !== true,
    );

    return shuffleWithSeed(filtered, seed).slice(0, limit);
  },
});
