import languages from "./languages.json" with { type: "json" };
import categories from "./categories.json" with { type: "json" };
import platforms from "./platforms.json" with { type: "json" };
import { classifyTitle, buildCatalogueShelves } from "./classify.js";

export const languageRegistry = languages;
export const catalogueCategories = categories;
export const streamingPlatforms = platforms;
export { classifyTitle, buildCatalogueShelves };

export function getLanguage(code) {
  return languageRegistry.find(language => language.code.toLowerCase() === String(code).toLowerCase()) ?? null;
}

export function normalizeTitle(item) {
  const title = String(item.title ?? "").trim();
  if (!item.id || !title) throw new TypeError("Catalogue item requires id and title");
  const unique = values => [...new Set((values ?? []).map(x => String(x).trim()).filter(Boolean))];
  return {
    ...item,
    title,
    type: item.type ?? "movie",
    aliases: unique(item.aliases),
    genres: unique(item.genres),
    languages: unique(item.languages),
    audioLanguages: unique(item.audioLanguages),
    subtitleLanguages: unique(item.subtitleLanguages),
    dubLanguages: unique(item.dubLanguages),
    regions: unique(item.regions),
    tags: unique(item.tags),
    collections: unique(item.collections),
    keywords: unique(item.keywords),
    audioLanguages: unique(item.audioLanguages),
    dubLanguages: unique(item.dubLanguages),
    subtitleLanguages: unique(item.subtitleLanguages)
  };
}

export function searchCatalogue(items, query = "", filters = {}) {
  const q = String(query).trim().toLocaleLowerCase();
  return items.filter(raw => {
    const item = normalizeTitle(raw);
    const haystack = [item.title, item.originalTitle, ...item.aliases].join(" ").toLocaleLowerCase();
    return (!q || haystack.includes(q))
      && (!filters.type || item.type === filters.type)
      && (!filters.language || item.languages.includes(filters.language) || item.audioLanguages.includes(filters.language) || item.subtitleLanguages.includes(filters.language) || item.dubLanguages.includes(filters.language))
      && (!filters.genre || item.genres.includes(filters.genre))
      && (!filters.region || item.regions.includes(filters.region))
      && (!filters.year || item.year === Number(filters.year));
  });
}

export function validateCatalogue(items) {
  const issues = [];
  const ids = new Set();
  for (const raw of items) {
    if (!raw?.id) issues.push({id:null,error:"Missing id"});
    else if (ids.has(raw.id)) issues.push({id:raw.id,error:"Duplicate id"});
    else ids.add(raw.id);
    if (!String(raw?.title ?? "").trim()) issues.push({id:raw?.id ?? null,error:"Missing title"});
    if (raw?.type && !["movie","series","anime","episode"].includes(raw.type)) issues.push({id:raw.id,error:"Unsupported type"});
    for (const code of [...(raw?.languages ?? []),...(raw?.audioLanguages ?? []),...(raw?.subtitleLanguages ?? []),...(raw?.dubLanguages ?? [])]) {
      if (!getLanguage(code) && !["ja","ko","zh","fr","es","de","it","pt","ru","ar","th","vi","id","ms","fil","tr"].includes(code)) {
        issues.push({id:raw?.id ?? null,error:"Unknown language code: "+code});
      }
    }
  }
  return issues;
}
