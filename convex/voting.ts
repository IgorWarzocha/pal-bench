/**
 * convex/voting.ts
 * Re-exports all voting functions from the voting/ directory.
 * Maintains backwards compatibility with existing imports.
 */
export {
  castVote,
  castVotesBatch,
  removeVote,
  getClientVotes,
  getClientVotesBatch,
  getClientVotedIds,
} from "./voting/index";
