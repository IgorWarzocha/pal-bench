---
feature: "Poke-Bench Core"
spec: |
  A benchmark platform for LLM-generated Pokemon SVGs. Features a public API for submissions, a voting system for image/data quality, and a leaderboard/stats interface.
---

## Task List

### Feature 1: Backend Infrastructure
Description: Backend implementation including database schema, HTTP API for model submissions, and internal/public functions for data retrieval and voting.
- [x] 1.01 Design and implement Convex Schema (secrets, submissions, votes) (note: Schema finalized and deployed.)
- [x] 1.02 Implement HTTP Submission Endpoint (POST /api/submit) with Secret validation (note: HTTP endpoint implemented in convex/http.ts)
- [~] 1.03 Implement Voting System (Mutations with client fingerprinting) and robust key validation (note: Updating validation logic to strictly enforce model-key binding) (note: Updating validation logic to store failures instead of rejecting them.)
- [x] 1.04 Implement Public Queries (Leaderboard, Filtered List, Stats) (note: Public queries implemented in convex/queries.ts)

### Feature 2: Frontend Interface
Description: Frontend implementation using React 19, Tailwind 4, and Shadcn UI.
- [ ] 2.01 Setup Wouter Routing (Home, Browse, Stats)
- [ ] 2.02 Create PokemonCard Component (Safe SVG rendering, Voting UI)
- [~] 2.03 Implement Leaderboard Page with 'Rate 5' Hero section (note: Redesigning Home Page for active rating flow)
- [ ] 2.04 Implement Browse/Filter Page
- [~] 2.05 Implement Stats Page (Charts) (note: Adding 'Hallucinations' section to Stats page.)
