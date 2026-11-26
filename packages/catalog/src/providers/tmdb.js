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
  let response;for(let attempt=0;attempt<4;attempt++){response=await fetch(url,{headers});if(response.ok)return response.json();const retryable=response.status===429||response.status>=500;if(!retryable||attempt===3)throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);const retryAfter=Number(response.headers.get("retry-after")||0);const delay=Math.max(retryAfter*1000,250*Math.pow(2,attempt));await new Promise(resolve=>setTimeout(resolve,Math.min(delay,8000)));}throw new Error("TMDB request failed after retries");
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

export async function fetchCatalogueList(kind = "movie", list = "popular", page = 1, region = "IN") {
  const endpoint = list === "top_rated" ? `/${kind}/top_rated` : `/${kind}/popular`;
  const data = await tmdbRequest(endpoint, { page, region });
  return { page: data.page, totalPages: data.total_pages, results: (data.results ?? []).map(raw => normalizeTmdbResult(raw, kind === "tv" ? "tv" : "movie")) };
}

export function normalizeWatchProviderResults(raw,regions=["IN"]){const checkedAt=new Date().toISOString();const output=[];for(const region of regions){const regionData=raw?.results?.[region];if(!regionData)continue;for(const availabilityType of ["flatrate","free","rent","buy"]){for(const provider of regionData[availabilityType]||[]){output.push({platform:provider.provider_name,providerId:provider.provider_id,region,availabilityType,logo:provider.logo_path?`https://image.tmdb.org/t/p/w92${provider.logo_path}`:null,source:"TMDB",sourceUrl:regionData.link||null,checkedAt});}}}return output;}
export async function fetchWatchProviders(kind="movie",id,regions=["IN"]){if(!id)throw new Error("TMDB id required for watch-provider lookup");const data=await tmdbRequest(`/${kind}/${id}/watch/providers`);return normalizeWatchProviderResults(data,regions);}
export async function discoverByLanguage(kind = "movie", language = "hi", page = 1, params = {}) {
  return discoverTmdb(kind, { with_original_language: language, page, sort_by: "popularity.desc", ...params });
}
