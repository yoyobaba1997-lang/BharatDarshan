import languages from "./languages.json" with { type: "json" };
import categories from "./categories.json" with { type: "json" };

export const languageRegistry = languages;
export const catalogueCategories = categories;

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
    regions: unique(item.regions)
  };
}

export function searchCatalogue(items, query = "", filters = {}) {
  const q = String(query).trim().toLocaleLowerCase();
  return items.filter(raw => {
    const item = normalizeTitle(raw);
    const haystack = [item.title, item.originalTitle, ...item.aliases].join(" ").toLocaleLowerCase();
    return (!q || haystack.includes(q))
      && (!filters.type || item.type === filters.type)
      && (!filters.language || item.languages.includes(filters.language) || item.audioLanguages.includes(filters.language) || item.dubLanguages.includes(filters.language))
      && (!filters.genre || item.genres.includes(filters.genre))
      && (!filters.year || item.year === Number(filters.year));
  });
}
