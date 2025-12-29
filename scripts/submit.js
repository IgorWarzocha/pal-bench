import fs from "fs";
import path from "path";

// Usage: node submit.js <URL> <KEY> <JSON_FILE>
// JSON_FILE should contain: { name, pokedexNumber, description, svgPath }

const [url, key, jsonPath] = process.argv.slice(2);

if (!url || !key || !jsonPath) {
  console.error(
    "Usage: node submit.js <CONVEX_HTTP_URL> <API_KEY> <DATA_JSON>",
  );
  console.error(
    'DATA_JSON example: { "name": "Pikachu", "pokedexNumber": 25, "description": "...", "svgPath": "./pikachu.svg" }',
  );
  process.exit(1);
}

async function main() {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  if (data.svgPath) {
    const svgCode = fs.readFileSync(
      path.resolve(path.dirname(jsonPath), data.svgPath),
      "utf-8",
    );
    data.svgCode = svgCode;
    delete data.svgPath;
  }

  console.log(`Submitting ${data.name} to ${url}...`);

  const res = await fetch(`${url}/api/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.error("Error:", res.status, await res.text());
    process.exit(1);
  }

  console.log("Success:", await res.json());
}

main().catch(console.error);
