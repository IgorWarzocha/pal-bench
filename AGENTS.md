# AGENTS.md - Development Guidelines for AI Agents

## Project Overview

This is a modern full-stack application using the "Vite Stack":

- **Frontend:** React 19.2+, Vite 7+, Tailwind CSS 4.1+
- **Backend:** Convex (Serverless real-time database)
- **Language:** TypeScript 5.9+ (Strict Mode)

## 1. Build, Lint, and Test Commands

### User vs. Agent Responsibilities

- **User (Human):** Runs `npm run dev`, `npm run build`, and manages the Convex dev server (`npx convex dev`).
- **Agent:** Runs `npm run lint`, `npx tsc --noEmit`, and `npx convex codegen`. Do NOT run build/dev commands.

### Build & Lint

- **Build:** `npm run build` (Runs `tsc -b` and `vite build`) - **User only**
- **Lint:** `npm run lint` (Runs `tsc` and `eslint`) - **Agent can run**
- **Type Check:** `npx tsc --noEmit` - **Agent can run**

### Testing

_Note: No dedicated test runner (Vitest/Jest) is currently configured for source code._

- **Action:** If asked to test a function, first verify if a test file exists. If not, create a minimal reproduction script or suggest adding Vitest.
- **Do NOT** run `npm test` as it is not defined.

### Development

- **Start Dev Server:** `npm run dev` (Runs frontend and Convex backend in parallel) - **User only**
- **Convex Dashboard:** `npx convex dashboard` - **User only**

## 2. Code Style & Conventions

### Core Principles

- **DRY & KISS:** Abstract repeated logic; prefer simple, readable solutions over clever ones.
- **Strict Typing:**
  - Avoid `any`. Use `unknown` if necessary.
  - Rely on type inference where possible, but use explicit return types for public APIs.
  - Fix type errors immediately; do not suppress them with `@ts-ignore` unless absolutely necessary and documented.
- **Comments:** Explain _why_, not _what_. Document public functions.

### TypeScript Guidelines

- Use `interface` for public contracts, `type` for unions/intersections.
- Use `as const` for string literals in discriminated unions.
- Records: `Record<Id<"tableName">, ValueType>` for type safety.
- Arrays: `const array: Array<T> = [...]`.

### React Guidelines (React 19+)

- **Components:** Functional components only.
- **State:** Use `useState`, `useReducer`, or Convex hooks (`useQuery`, `useMutation`).
- **Hooks:** Follow `eslint-plugin-react-hooks` rules strictly.
- **Styling:** Tailwind CSS 4. Use utility classes directly in JSX.
  - No `tailwind.config.js` (configured via CSS `@theme`).
  - Use `@apply` sparingly.

### Convex Backend Guidelines

**Crucial:** Follow strict Convex patterns.

**Convex Interaction:**

- The `convex/_generated` directory is the source of truth for types.
- **Agent:** Do NOT manually edit `_generated` files.
- **User:** Runs `npx convex dev` or `npx convex codegen` to keep types in sync.
- **Agent:** Runs `npx convex codegen` to regenerate types after schema changes.

1.  **Function Syntax:**
    - ALWAYS use object syntax with validators:
      ```typescript
      export const myFunc = query({
        args: { id: v.id("users") },
        returns: v.object({ name: v.string() }),
        handler: async (ctx, args) => { ... }
      });
      ```
    - **Validators:** Strict usage of `v` from `convex/values`.
      - Use `v.null()` for nullable returns.
      - Use `v.id("tableName")` for references.
      - Use `v.int64()` for BigInts (not `v.bigint()`).
      - Use `v.record(keys, values)` for dynamic objects.

2.  **Schema (`convex/schema.ts`):**
    - Define tables with `defineTable`.
    - Always define indexes: `.index("by_field", ["field"])`.
    - Index names should reflect fields (e.g., `by_role_and_status`).

3.  **Cross-Function Calls:**
    - Use `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction`.
    - **Important:** Pass `FunctionReference` (e.g., `api.folder.file.func`), NOT the function directly.
    - If calling a function in the _same_ file, use a type annotation to avoid circular inference:
      ```typescript
      const result: MyType = await ctx.runQuery(api.sameFile.func, { ... });
      ```

4.  **Mutations vs Actions:**
    - **Mutations:** For DB writes (`ctx.db`). Atomic. Fast.
    - **Actions:** For 3rd party APIs (OpenAI, Stripe). NO `ctx.db` access.
    - **Best Practice:** Minimal logic in Actions. Fetch data in Query -> Pass to Action -> Write result in Mutation.

5.  **Internal Functions:**
    - Use `internalQuery`/`internalMutation` for private logic.
    - Call via `internal.path.to.func`.
    - Secure sensitive operations by making them internal.

6.  **Pagination:**
    - Use `paginationOptsValidator` and `.paginate(args.paginationOpts)`.
    - Returns `page`, `isDone`, `continueCursor`.

### Database Query Patterns

- **No Filter:** Do NOT use `.filter()` if possible. Use `.withIndex()` for performance.
- **Ordering:** Default is `asc` (creation time). Use `.order("desc")` for recent first.
- **Unique:** Use `.unique()` when expecting a single result.
- **Delete:** No `.delete()` on query. Collect IDs then `ctx.db.delete(id)`.
  ```typescript
  const docs = await ctx.db.query("table").collect();
  for (const doc of docs) await ctx.db.delete(doc._id);
  ```

### Error Handling

- Fail fast. Throw specific errors rather than swallowing them.
- In Convex, throw `ConvexError` for client-facing errors (imports from `convex/values`).
- For internal errors, standard `Error` is fine.

### Formatting

- Prettier is configured. Run `npx prettier --write .` to format.
- Imports: Alphabetical, grouped by external/internal.
- **No Console Logs:** Remove `console.log` before committing.

## 3. Directory Structure

- `src/`: Frontend React code.
- `convex/`: Backend functions and schema.
- `convex/_generated/`: **DO NOT EDIT**.
- `public/`: Static assets.

## 4. Cursor/Copilot Rules Integration

_Derived from .cursor/rules/convex_rules.mdc_

- **Http Endpoints:** Define in `convex/http.ts` with `httpAction`.
- **Cron Jobs:** Use `crons.interval` in `convex/crons.ts`.
  ```typescript
  const crons = cronJobs();
  crons.interval("job name", { hours: 1 }, internal.folder.func, {});
  export default crons;
  ```
- **File Storage:** Use `ctx.storage` and `ctx.db.system.get("_storage", id)`.
- **Search:** Use `.withSearchIndex("search_body", q => q.search(...))`.
