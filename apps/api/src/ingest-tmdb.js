import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchTrending, fetchCatalogueList, discoverByLanguage, fetchGenreMap } from "../../../packages/catalog/src/providers/tmdb.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(here, "../../../packages/catalog/src/ingested-catalog.json");
const pages = Math.max(1, Math.min(10, Number(process.env.INGEST_PAGES || 1)));
const types = (process.env.INGEST_TYPES || "movie,tv").split(",").map(x => x.trim()).filter(Boolean);
const modes = (process.env.INGEST_MODES || "trending,popular,top_rated,indian_languages").split(",").map(x => x.trim()).filter(Boolean);
const languages = (process.env.INGEST_LANGUAGES || "hi,ta,te,ml,kn,bn,mr,gu,pa,or,as").split(",").map(x => x.trim()).filter(Boolean);
const all = [];
for (const type of types) {
  const kind = type === "tv" ? "tv" : "movie";
  const genreMap = await fetchGenreMap(kind);
  for (const mode of modes) {
    if (mode === "indian_languages") {
      for (const language of languages) {
        for (let page = 1; page <= pages; page++) {
          const result = await discoverByLanguage(kind, language, page, { region: "IN" });
          all.push(...result.results.map(item => ({ ...item, genres: (item.genreIds ?? []).map(id => genreMap.get(id)).filter(Boolean) })));
        }
      }
      continue;
    }
    for (let page = 1; page <= pages; page++) {
      const result = mode === "trending"
        ? await fetchTrending(type, "week", page)
        : await fetchCatalogueList(kind, mode, page, "IN");
      all.push(...result.results.map(item => ({ ...item, genres: (item.genreIds ?? []).map(id => genreMap.get(id)).filter(Boolean) })));
    }
  }
}
const unique = new Map(all.map(item => [item.id, item]));
fs.writeFileSync(outputPath, JSON.stringify([...unique.values()], null, 2) + "\n");
console.log(`Saved ${unique.size} normalized titles to ${outputPath}`);
