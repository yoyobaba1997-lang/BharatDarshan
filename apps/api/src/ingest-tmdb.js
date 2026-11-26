import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchTrending, fetchCatalogueList, discoverByLanguage, fetchGenreMap } from "../../../packages/catalog/src/providers/tmdb.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(here, "../../../packages/catalog/src/ingested-catalog.json");
const pages = Math.max(1, Math.min(20, Number(process.env.INGEST_PAGES || 1)));
const types = (process.env.INGEST_TYPES || "movie,tv").split(",").map(x => x.trim()).filter(Boolean);
const modes = (process.env.INGEST_MODES || "trending,popular,top_rated,indian_languages").split(",").map(x => x.trim()).filter(Boolean);
const languages = (process.env.INGEST_LANGUAGES || "hi,ta,te,ml,kn,bn,mr,gu,pa,or,as,ur").split(",").map(x => x.trim()).filter(Boolean);
const modeTags = { trending:"trending", popular:"popular", top_rated:"top-rated" };
const all = [];
for (const type of types) {
  const kind = type === "tv" ? "tv" : "movie";
  const genreMap = await fetchGenreMap(kind);
  for (const mode of modes) {
    if (mode === "indian_languages") {
      for (const language of languages) {
        for (let page = 1; page <= pages; page++) {
          const result = await discoverByLanguage(kind, language, page, { region: "IN" });
          all.push(...result.results.map(item => ({ ...item, tags:[...(item.tags||[]),"indian-language-discovery",`language-${language}`], collections:[...(item.collections||[]),`Language: ${language}`], genres:(item.genreIds??[]).map(id=>genreMap.get(id)).filter(Boolean) })));
        }
      }
      continue;
    }
    if (!["trending","popular","top_rated"].includes(mode)) throw new Error(`Unsupported INGEST_MODE: ${mode}`);
    for (let page = 1; page <= pages; page++) {
      const result = mode === "trending" ? await fetchTrending(type, "week", page) : await fetchCatalogueList(kind, mode, page, "IN");
      all.push(...result.results.map(item => ({ ...item, tags:[...(item.tags||[]),modeTags[mode]], genres:(item.genreIds??[]).map(id=>genreMap.get(id)).filter(Boolean) })));
    }
  }
}
const existing = process.env.INGEST_REPLACE === "1" ? [] : (fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath,"utf8")) : []);
const merged = new Map(existing.map(item => [item.id,item]));
const ingestedAt = new Date().toISOString();
for (const rawItem of all) {
  const item = { ...rawItem, ingestion: { ...(rawItem.ingestion||{}), source:"TMDB", ingestedAt, modes:[...new Set([...(rawItem.ingestion?.modes||[]), ...modes])], languages:[...new Set([...(rawItem.ingestion?.languages||[]), ...languages])] } };
  const previous = merged.get(item.id);
  if (!previous) { merged.set(item.id,item); continue; }
  const union = (a,b) => [...new Set([...(a||[]),...(b||[])])];
  const keep=(fresh,old)=>fresh===null||fresh===undefined||fresh===""?old:fresh;
  merged.set(item.id,{...previous,...item,
    title:keep(item.title,previous.title),originalTitle:keep(item.originalTitle,previous.originalTitle),overview:keep(item.overview,previous.overview),releaseDate:keep(item.releaseDate,previous.releaseDate),year:keep(item.year,previous.year),poster:keep(item.poster,previous.poster),backdrop:keep(item.backdrop,previous.backdrop),rating:keep(item.rating,previous.rating),
    sourceIds:{...(previous.sourceIds||{}),...(item.sourceIds||{})},
    ingestion:{...(previous.ingestion||{}),...(item.ingestion||{}),modes:union(previous.ingestion?.modes,item.ingestion?.modes),languages:union(previous.ingestion?.languages,item.ingestion?.languages)},
    tags:union(previous.tags,item.tags),collections:union(previous.collections,item.collections),
    genres:union(previous.genres,item.genres),languages:union(previous.languages,item.languages),
    audioLanguages:union(previous.audioLanguages,item.audioLanguages),subtitleLanguages:union(previous.subtitleLanguages,item.subtitleLanguages),
    dubLanguages:union(previous.dubLanguages,item.dubLanguages),regions:union(previous.regions,item.regions)
  });
}
fs.writeFileSync(outputPath,JSON.stringify([...merged.values()],null,2)+"\n");
console.log(`Saved ${merged.size} normalized titles from ${all.length} source records to ${outputPath}. Mode: ${process.env.INGEST_REPLACE === "1" ? "replace" : "incremental merge"}. Set INGEST_REPLACE=1 to replace the snapshot.`);
