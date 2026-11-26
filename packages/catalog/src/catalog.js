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
    streamingPlatforms: unique(item.streamingPlatforms),
    providerAvailability: Array.isArray(item.providerAvailability) ? item.providerAvailability : [],
    tags: unique(item.tags),
    collections: unique(item.collections),
    keywords: unique(item.keywords)
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
      && (!filters.year || item.year === Number(filters.year))
      && (!filters.platform || item.streamingPlatforms.includes(filters.platform) || item.providerAvailability.some(provider => provider.platform === filters.platform));
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

export function auditCatalogue(items) {
  const issues = [];
  const duplicateKeys = new Map();
  const counts = { total: items.length, missingPoster: 0, missingOverview: 0, missingYear: 0, missingGenres: 0, missingLanguages: 0, duplicateTitles: 0, invalidRatings: 0, providerMetadataTitles: 0, providerRecords: 0, staleProviderRecords: 0, missingProviderCheckedAt: 0 };
  const normalizedTitles = value => String(value ?? "").trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  items.forEach((raw, index) => {
    const id = raw?.id ?? null;
    const title = String(raw?.title ?? raw?.name ?? "").trim();
    const add = (code, message) => issues.push({ id, index, code, message });
    if (!(raw?.poster || raw?.posterUrl || raw?.image)) { counts.missingPoster++; add("missing_poster", "Poster artwork is missing"); }
    if (!String(raw?.overview ?? raw?.synopsis ?? "").trim()) { counts.missingOverview++; add("missing_overview", "Synopsis/overview is missing"); }
    if (!(Number.isInteger(Number(raw?.year)) && Number(raw.year) > 1800 && Number(raw.year) <= new Date().getFullYear()+2) && !/^\d{4}/.test(String(raw?.releaseDate ?? ""))) { counts.missingYear++; add("missing_year", "Valid release year/date is missing"); }
    if (!Array.isArray(raw?.genres) || raw.genres.length === 0) { counts.missingGenres++; add("missing_genres", "Genre metadata is missing"); }
    if (!Array.isArray(raw?.languages) || raw.languages.length === 0) { counts.missingLanguages++; add("missing_languages", "Primary language metadata is missing"); }
    if (raw?.rating != null && (!Number.isFinite(Number(raw.rating)) || Number(raw.rating) < 0 || Number(raw.rating) > 10)) { counts.invalidRatings++; add("invalid_rating", "Rating is outside the expected 0–10 range"); }
    const providers=Array.isArray(raw?.providerAvailability)?raw.providerAvailability:[];if(providers.length)counts.providerMetadataTitles++;counts.providerRecords+=providers.length;providers.forEach(record=>{if(!record.checkedAt){counts.missingProviderCheckedAt++;add("provider_missing_timestamp","Provider metadata lacks a checked timestamp");}else{const date=Date.parse(record.checkedAt);if(!Number.isFinite(date)||date>Date.now()+86400000||Date.now()-date>30*86400000){counts.staleProviderRecords++;add("provider_stale","Provider metadata timestamp is invalid, future-dated, or older than 30 days");}}});
    const key = [normalizedTitles(title), String(raw?.year ?? raw?.releaseDate?.slice?.(0,4) ?? ""), String(raw?.type ?? "")].join("|");
    if (title && duplicateKeys.has(key)) { counts.duplicateTitles++; add("possible_duplicate", "Possible duplicate title/year/type; compare metadata before merging"); }
    else if (title) duplicateKeys.set(key, id);
  });
  const fields = ["missingPoster","missingOverview","missingYear","missingGenres","missingLanguages"];
  const completeness = items.length ? Math.round((1-fields.reduce((sum,key)=>sum+counts[key],0)/(items.length*fields.length))*100) : 100;
  return { counts, completenessPercent: Math.max(0,completeness), issues };
}
