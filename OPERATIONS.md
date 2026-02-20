# Pal-Bench Operations Guide

This document describes the full lifecycle of operating the Pal-Bench system, from onboarding contributors to monitoring submissions and statistics.

## Table of Contents

1. [System Overview](#system-overview)
2. [Initial Setup](#initial-setup)
3. [Onboarding Contributors](#onboarding-contributors)
4. [Submission Lifecycle](#submission-lifecycle)
5. [Monitoring & Verification](#monitoring--verification)
6. [Statistics & Analytics](#statistics--analytics)
7. [Maintenance Tasks](#maintenance-tasks)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

Pal-Bench is a benchmarking platform for AI-generated Pal illustrations. The system consists of:

- **Frontend:** React app for browsing and voting on submissions
- **Backend:** Convex for data storage, real-time updates, and API endpoints
- **Auth Layer:** API keys + username validation for submissions

### Key Concepts

- **Submission:** A single AI-generated Pal with SVG code, metadata, and votes
- **Model:** The AI model that generated a submission (e.g., "gpt-4", "claude-3")
- **Hallucination:** When a model generates incorrect species data (wrong name/ID)
- **Species:** The canonical species reference (name + Pokedex number)

---

## Initial Setup

### Prerequisites

```bash
# Install dependencies
npm install

# Start development environment
npm run dev
```

This starts both the Vite frontend and Convex backend in parallel.

### Environment Variables

The system uses Convex environment variables. No secrets should be committed to git.

```bash
# Set your Convex deployment URL
npx convex dev
```

---

## Onboarding Contributors

Contributors need an API key to submit Pal illustrations to the system. Here's how to create one:

### 1. Create a Contributor API Key

Use the Convex CLI or the dashboard to create a secret:

```bash
# Using the Convex CLI (recommended)
npx convex run internal.admin.createSecret --model "gpt-4" --username "alice"
```

Or via the Convex dashboard:

1. Go to your project's dashboard
2. Navigate to "Functions" → "internal/admin/createSecret"
3. Run with `model: "gpt-4"` and `username: "alice"`

**Output:**

```
"pk_a1b2c3d4e5f6..."
```

The key format is `pk_` followed by 48 hex characters generated using `crypto.getRandomValues()`.

**Note:** For backwards compatibility, the `username` field is optional. Existing API keys without a username will continue to work, but new keys should include a username for enhanced security.

### 2. Distribute Credentials

Provide the contributor with:

- **API Key:** `pk_a1b2c3d4e5f6...` (keep secret!)
- **Username:** `alice`
- **Convex Deployment URL:** Your production URL (e.g., `https://giant-panda-123.convex.cloud`)
- **Expected Model Name:** The model string (e.g., `gpt-4`)

**Important:** The username must match the API key's username during submission.

### 3. Verify Access

The contributor should test their credentials:

```bash
node scripts/submit.js \
  "https://giant-panda-123.convex.cloud" \
  "pk_a1b2c3d4e5f6..." \
  test_submission.json
```

---

## Submission Lifecycle

### Step 1: Generate Pal Artwork

The contributor generates a Pal illustration using their AI model and exports it as SVG code.

**Example prompt:**

> "Generate an SVG illustration of Bulbasaur (#001), a grass/poison type Pal with a green bulb on its back."

### Step 2: Prepare Submission Data

Create a JSON file with submission metadata:

```json
{
  "name": "Bulbasaur",
  "pokedexNumber": 1,
  "description": "A small, quadrupedal Pokémon with green-blue skin and a bulb on its back.",
  "svgPath": "./bulbasaur.svg",
  "username": "alice"
}
```

**Note:** `username` is optional but recommended if your API key has a username set.

### Step 3: Submit to API

Use the submission script:

```bash
node scripts/submit.js \
  <CONVEX_HTTP_URL> \
  <API_KEY> \
  submission.json
```

**Example:**

```bash
node scripts/submit.js \
  "https://giant-panda-123.convex.cloud" \
  "pk_a1b2c3d4e5f6..." \
  submissions/bulbasaur.json
```

### Step 4: Server-Side Validation

The server validates:

1. **API Key:** Exists in `secrets` table and `isActive = true`
2. **Username:** Matches the API key's username
3. **Model:** Matches the API key's model
4. **Species:** Validates against the `species` table (name + Pokedex number)
5. **SVG:** Contains valid `<svg>` markup

**Validation Outcomes:**

| Status            | HTTP Code     | Description                          |
| ----------------- | ------------- | ------------------------------------ |
| Success           | 201           | Submission accepted                  |
| Invalid Key       | 403           | API key not found or inactive        |
| Username Mismatch | 403           | Username doesn't match API key       |
| Model Mismatch    | 400           | Model doesn't match API key          |
| Invalid Species   | 201 (flagged) | Accepted but marked as hallucination |

### Step 5: Hallucination Detection

If the species validation fails, the submission is:

- Still accepted into the database
- Flagged with `isHallucination: true`
- Given a `hallucinationReason` explaining the issue
- Included in statistics for transparency

**Example hallucinations:**

- Wrong name for Pokedex number
- Invalid Pokedex number (>1025)
- Name mismatch (case-insensitive)

### Step 6: Storage

Valid submissions are stored in the `submissions` table:

```typescript
{
  _id: "submission_id",
  model: "gpt-4",
  name: "Bulbasaur",
  speciesNum: 1,
  description: "...",
  svgCode: "<svg>...</svg>",
  upvotes_image: 0,
  downvotes_image: 0,
  upvotes_data: 0,
  downvotes_data: 0,
  isHallucination: false,
  timestamp: 1234567890
}
```

---

## Monitoring & Verification

### View Submissions

Submissions appear immediately on the frontend:

- **Homepage:** Browse submissions by model
- **Leaderboard:** Ranked by net score (upvotes - downvotes)
- **Browse Page:** Filter by model, species, or hallucination status

### Vote on Submissions

Users vote on two dimensions:

- **Image Quality:** Is the artwork good?
- **Data Accuracy:** Is the metadata correct?

**Voting Mechanics:**

- Each client gets a unique ID (stored in localStorage)
- Users can change votes within 48 hours (rolling cooldown)
- After 48 hours, votes are locked and cleaned up
- Rate-limited to 20 votes/minute per client

### Verify Submissions

To check a specific submission's details:

```bash
npx convex run --query internal.submission.getSubmission --id="<submission_id>"
```

Or via the dashboard:

1. Go to "Data" → "submissions"
2. Find the submission by name or model
3. Review SVG, metadata, and vote counts

---

## Statistics & Analytics

The system maintains pre-computed statistics for performance.

### View Platform Stats

Visit `/stats` on the frontend to see:

- **Total Submissions:** Count of all submissions
- **Total Votes:** Count of all votes cast
- **Hallucination Rate:** Percentage of flagged submissions
- **Species Coverage:** Unique species / 1025 total
- **Model Performance:** Per-model breakdown with:
  - Submission count
  - Average net scores (image & data)
  - Hallucination rate

### Stats Refresh Cycle

- **Automatic:** Stats recomputed every 15 minutes via cron job
- **Manual:** Trigger recomputation via Convex dashboard:
  ```
  internal.stats.recomputeStats
  internal.stats.recomputeModelStats
  ```

### Raw Data Access

For custom analytics, query the database directly:

```bash
# Export all submissions
npx convex data export submissions --output=submissions.csv

# Count submissions by model
npx convex run --query "SELECT model, COUNT(*) FROM submissions GROUP BY model"
```

---

## Maintenance Tasks

### Daily Tasks

- **Monitor new submissions:** Check for unexpected hallucinations
- **Review vote patterns:** Look for suspicious voting activity

### Weekly Tasks

- **Review API keys:** Deactivate keys for inactive contributors
- **Check stats accuracy:** Verify hallucination rates are reasonable
- **Backup data:** Export submissions and votes (Convex handles backups automatically)

### On-Demand Tasks

#### Create New API Key

```bash
npx convex run internal.admin.createSecret --model "claude-3" --username "bob"
```

#### Deactivate API Key

Via the dashboard:

1. Go to "Data" → "secrets"
2. Find the key by username
3. Set `isActive` to `false`

#### Seed Species Data

The species table is seeded from PokeAPI:

```bash
npx convex run internal.admin_actions.seedSpeciesData
```

This fetches all 1025 species entries and populates the `species` table.

#### Cleanup Old Votes

Votes older than 48 hours are automatically cleaned up every hour via cron. To manually trigger:

```bash
npx convex run internal.maintenance.cleanupExpiredVotes --batchSize=500
```

---

## Troubleshooting

### Submission Fails with 403

**Issue:** API key rejected

**Solutions:**

- Verify API key is correct
- Check `isActive` is `true` in the `secrets` table
- Ensure username matches the key's username (if key has username set)
- For legacy keys without username, omit the `username` field from submission

### Submission Flagged as Hallucination

**Issue:** Valid submission marked as incorrect

**Solutions:**

- Check species table has the correct entry
- Verify name matches exactly (case-insensitive)
- Check Pokedex number is valid (1-1025)

**Fix:** Update the species table:

```bash
npx convex run internal.species.seedSpecies --entries="[{\"id\":1,\"name\":\"Bulbasaur\"}]"
```

### Stats Are Outdated

**Issue:** Stats page shows old data

**Solution:** Manually trigger stats recomputation:

```bash
npx convex run internal.stats.recomputeStats
npx convex run internal.stats.recomputeModelStats
```

### High Vote Volume Detected

**Issue:** Suspicious voting activity

**Solutions:**

- Check the rate limiter is active: `ctx.rateLimiter.limit()`
- Review logs for repeated client IDs
- Consider lowering rate limits in `convex/rateLimiter.ts`

### CORS Errors in Production

**Issue:** Browser rejects API requests

**Solution:** Update CORS settings in `convex/http.ts`:

```typescript
"Access-Control-Allow-Origin": "https://yourdomain.com"
```

---

## API Reference

### HTTP Endpoints

#### POST /api/submit

Submit a new Pal illustration.

**Headers:**

```
Authorization: Bearer <api_key>
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Pikachu",
  "pokedexNumber": 25,
  "description": "A yellow mouse pal.",
  "svgCode": "<svg>...</svg>",
  "username": "alice",
  "model": "gpt-4"
}
```

**Note:** `username` is optional for backwards compatibility with legacy API keys. If the API key has a username set, the submission must include the matching username.

**Response (201):**

```json
{
  "success": true,
  "submissionId": "submission_id",
  "model": "gpt-4",
  "isHallucination": false
}
```

**Response (403):**

```json
{
  "error": "Invalid or inactive API key"
}
```

### Internal Functions

These are only callable from the server or via CLI.

#### internal.admin.createSecret

Create a new API key for a contributor.

**Args:** `{ model: string, username: string }`

**Returns:** `string` (the API key)

#### internal.stats.recomputeStats

Recompute platform-wide statistics.

**Args:** `{}`

**Returns:** Platform stats object

#### internal.stats.recomputeModelStats

Recompute per-model statistics.

**Args:** `{}`

**Returns:** Number of models updated

---

## Security Considerations

### Rate Limiting

- **Voting:** 20 votes/minute per client (burst up to 3)
- **Batch Voting:** 10 batch requests/minute per client
- **Submissions:** Protected by API key (no rate limiting for trusted contributors)

### API Key Security

- Keys are generated using `crypto.getRandomValues()` (cryptographically secure)
- 48 hex characters + `pk_` prefix = ~192 bits of entropy
- Store keys securely; never commit to git
- Deactivate keys when access is no longer needed

### Username Validation

- New API keys should include a `username` field
- Submissions with username must match the API key's username
- Legacy keys without username continue to work (username is optional)
- Provides rudimentary two-factor validation (key + name) when used

### Vercel Edge Protection (Production)

When deployed to Vercel, you get additional protection:

- **BotID:** Invisible CAPTCHA blocking automated bots
- **DDoS Mitigation:** Automatic protection at the edge
- **WAF Rate Limiting:** Network-layer rate limits

---

## Conclusion

This guide covers the full lifecycle of operating Pal-Bench, from creating API keys to monitoring statistics and maintaining data quality. For additional help, refer to the Convex documentation or the project's AGENTS.md file.

**Happy benchmarking!** 🎮
