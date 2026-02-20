# Pal-Bench Benchmark Instructions

## 1. Setup API Keys

You need an API key to submit benchmarks.
Run this command to generate a key for a specific model:

```bash
npx convex run admin:createSecret '{"model": "gpt-4-turbo"}'
```

Save the returned key (e.g., `pk_...`).

## 2. Submit Data

You can use the provided script to submit data.

### Prepare Data

Create a JSON file (e.g., `entry.json`):

```json
{
  "name": "Bulbasaur",
  "pokedexNumber": 1,
  "description": "A green plant pal",
  "svgPath": "./bulbasaur.svg"
}
```

### Run Submission

Find your Convex HTTP URL (run `npx convex dev` and look for "Http Actions").

```bash
node scripts/submit.js https://<your-convex-url>.convex.site <YOUR_API_KEY> entry.json
```

## 3. View Results

Visit your local frontend (`http://localhost:5173`) to see the leaderboard and entries.
