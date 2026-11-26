import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchTrending } from "../../../packages/catalog/src/providers/tmdb.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(here, "../../../packages/catalog/src/ingested-catalog.json");
const pages = Math.max(1, Math.min(5, Number(process.env.INGEST_PAGES || 1)));
const types = (process.env.INGEST_TYPES || "movie,tv").split(",").map(x => x.trim()).filter(Boolean);
const all = [];
for (const type of types) {
  for (let page = 1; page <= pages; page++) {
    const result = await fetchTrending(type, "week", page);
    all.push(...result.results);
  }
}
const unique = new Map(all.map(item => [item.id, item]));
fs.writeFileSync(outputPath, JSON.stringify([...unique.values()], null, 2) + "\n");
console.log(`Saved ${unique.size} normalized titles to ${outputPath}`);
