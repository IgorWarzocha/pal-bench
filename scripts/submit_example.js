import { fetch } from "node-fetch"; // You might need to install this or use built-in fetch in Node 18+

// WAIT: The HTTP endpoint is served by Convex, not Vite!
// We need the CONVEX_URL from .env.local

// This script expects arguments: SECRET_KEY SVG_FILE [METADATA_JSON]

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: node scripts/submit.js <CONVEX_SITE_URL> <SECRET_KEY> <SVG_FILE_PATH>");
  process.exit(1);
}

const [siteUrl, secretKey, svgPath] = args;
import fs from "fs";

async function submit() {
  const svgCode = fs.readFileSync(svgPath, "utf-8");

  // Example metadata - in a real scenario, this might come from a sidecar JSON
  const payload = {
    name: "Pikachu", // TODO: Make dynamic
    pokedexNumber: 25,
    description: "A yellow mouse pal with electric cheeks.",
    svgCode: svgCode,
    // Model is derived from secret in current impl
  };

  console.log(`Submitting to ${siteUrl}/api/submit...`);

  const response = await fetch(`${siteUrl}/api/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log(response.status, result);
}

submit().catch(console.error);
