---
description: Run the Pokemon benchmark.
agent: benchmark
---

Run the benchmark for model '$1' using secret '$2'.
Target API URL: ${3:-https://gregarious-shrimp-224.convex.site}/api/submit

Generate 15 unique Pokemon SVG variations. You choose the Pokemon (mix of popular ones).
Execute the submissions via curl immediately.

JSON Body format:
{
"name": "...",
"pokedexNumber": 123,
"description": "...",
"svgCode": "...",
"model": "$1"
}

IMPORTANT: You MUST include the "model": "$1" field in the JSON body to match the API key.
