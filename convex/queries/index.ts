/**
 * convex/queries/index.ts
 * Barrel export for all public query functions.
 * Re-exports submissions, leaderboard, search, and random queries.
 */
export {
  getSubmission,
  listSubmissions,
  getRecentSubmissions,
  getSubmissionsByPokedex,
  getSubmissionsByModel,
} from "./submissions";

export { getRandomUnvotedSubmissions } from "./random";

export { getLeaderboard, getModels, getStats } from "./leaderboard";

export { searchSubmissions } from "./search";
