/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as admin_actions from "../admin_actions.js";
import type * as http from "../http.js";
import type * as maintenance from "../maintenance.js";
import type * as pokedex from "../pokedex.js";
import type * as queries from "../queries.js";
import type * as queries_index from "../queries/index.js";
import type * as queries_leaderboard from "../queries/leaderboard.js";
import type * as queries_random from "../queries/random.js";
import type * as queries_search from "../queries/search.js";
import type * as queries_submissions from "../queries/submissions.js";
import type * as submission from "../submission.js";
import type * as validators from "../validators.js";
import type * as voting from "../voting.js";
import type * as voting_helpers from "../voting/helpers.js";
import type * as voting_index from "../voting/index.js";
import type * as voting_mutations from "../voting/mutations.js";
import type * as voting_queries from "../voting/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  admin_actions: typeof admin_actions;
  http: typeof http;
  maintenance: typeof maintenance;
  pokedex: typeof pokedex;
  queries: typeof queries;
  "queries/index": typeof queries_index;
  "queries/leaderboard": typeof queries_leaderboard;
  "queries/random": typeof queries_random;
  "queries/search": typeof queries_search;
  "queries/submissions": typeof queries_submissions;
  submission: typeof submission;
  validators: typeof validators;
  voting: typeof voting;
  "voting/helpers": typeof voting_helpers;
  "voting/index": typeof voting_index;
  "voting/mutations": typeof voting_mutations;
  "voting/queries": typeof voting_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
