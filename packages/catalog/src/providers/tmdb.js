const API_BASE = "https://api.themoviedb.org/3";

function getToken() {
  const token = process.env.TMDB_READ_ACCESS_TOKEN || process.env.TMDB_API_KEY;
  if (!token) throw new Error("Set TMDB_READ_ACCESS_TOKEN or TMDB_API_KEY in environment");
  return token;
}

export async function tmdbRequest(endpoint, params = {}) {
  const url = new URL(API_BASE + endpoint);
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  const token = getToken();
  const headers = token.startsWith("eyJ") ? { Authorization: "Bearer " + token } : {};
  if (!headers.Authorization) url.searchParams.set("api_key", token);
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
  return response.json();
}

const genreCache = new Map();
async function genresFor(kind) {
  if (!genreCache.has(kind)) {
    const data = await tmdbRequest(`/genre/${kind}/list`, { language: "en" });
    genreCache.set(kind, new Map((data.genres ?? []).map(g => [g.id, g.name])));
  }
  return genreCache.get(kind);
}

export function normalizeTmdbResult(raw, kind = "movie", genreMap = new Map()) {
  const isTv = kind === "tv";
  const title = isTv ? raw.name : raw.title;
  const originalTitle = isTv ? raw.original_name : raw.original_title;
  const date = isTv ? raw.first_air_date : raw.release_date;
  const language = raw.original_language || null;
  const id = `tmdb-${kind}-${raw.id}`;
  return {
    id,
    type: isTv ? "series" : "movie",
    title: title ?? "",
    originalTitle: originalTitle ?? title ?? "",
    aliases: [],
    overview: raw.overview ?? "",
    releaseDate: date || null,
    year: date ? Number(date.slice(0, 4)) : null,
    genres: (raw.genre_ids ?? []).map(id => genreMap.get(id)).filter(Boolean),
    genreIds: raw.genre_ids ?? [],
    languages: language ? [language] : [],
    audioLanguages: [],
    subtitleLanguages: [],
    dubLanguages: [],
    regions: raw.origin_country ?? [],
    poster: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null,
    backdrop: raw.backdrop_path ? `https://image.tmdb.org/t/p/w1280${raw.backdrop_path}` : null,
    rating: raw.vote_average ?? null,
    sourceIds: { tmdb: raw.id },
    streamingPlatforms: [],
    providerAvailability: []
  };
}

export async function fetchGenreMap(kind = "movie") {
  const data = await tmdbRequest(`/genre/${kind}/list`, { language: "en" });
  return new Map((data.genres ?? []).map(g => [g.id, g.name]));
}

export async function fetchTrending(kind = "all", window = "day", page = 1) {
  const data = await tmdbRequest(`/trending/${kind}/${window}`, { page });
  return { page: data.page, totalPages: data.total_pages, results: (data.results ?? []).map(raw => normalizeTmdbResult(raw, raw.media_type === "tv" ? "tv" : "movie")) };
}

export async function searchTmdb(query, kind = "multi", page = 1, region = "IN") {
  const data = await tmdbRequest(`/search/${kind}`, { query, page, region, include_adult: "false" });
  return { page: data.page, totalPages: data.total_pages, results: (data.results ?? []).filter(raw => raw.media_type !== "person").map(raw => normalizeTmdbResult(raw, raw.media_type === "tv" ? "tv" : kind === "tv" ? "tv" : "movie")) };
}

export async function discoverTmdb(kind = "movie", params = {}) {
  const data = await tmdbRequest(`/discover/${kind}`, { region: "IN", ...params });
  return { page: data.page, totalPages: data.total_pages, results: (data.results ?? []).map(raw => normalizeTmdbResult(raw, kind === "tv" ? "tv" : "movie")) };
}
