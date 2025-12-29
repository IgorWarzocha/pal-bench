/**
 * convex/queries.ts
 * Re-exports all public query functions from the queries/ directory.
 * Maintains backwards compatibility with existing imports.
 */
export {
  getSubmission,
  listSubmissions,
  getRecentSubmissions,
  getSubmissionsByPokedex,
  getSubmissionsByModel,
  getRandomUnvotedSubmissions,
  getLeaderboard,
  getModels,
  getStats,
  searchSubmissions,
} from "./queries/index";
