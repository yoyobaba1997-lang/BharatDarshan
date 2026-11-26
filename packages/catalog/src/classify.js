const LANGUAGE_COUNTRY = {
  hi:"IN", ta:"IN", te:"IN", ml:"IN", kn:"IN", bn:"IN", mr:"IN", gu:"IN", pa:"IN", or:"IN", as:"IN", ur:"IN", sa:"IN", ks:"IN", sd:"IN", kok:"IN", mai:"IN", mni:"IN", ne:"IN", brx:"IN", doi:"IN", sat:"IN", bho:"IN"
};

const ANIME_KEYWORDS = /anime|animation|manga|studio ghibli|shonen|shojo|isekai|crunchyroll/i;
const HINDI_DUB_LABELS = ["Hindi Dubbed", "Hindi Audio", "Hindi Dub"];

export function classifyTitle(item) {
  const genres = (item.genres ?? []).map(x => String(x).toLowerCase());
  const countries = (item.regions ?? []).map(x => String(x).toUpperCase());
  const originalLanguage = String(item.originalLanguage ?? item.languages?.[0] ?? "").toLowerCase();
  const tags = new Set((item.tags ?? []).map(x => String(x).toLowerCase()));
  const titleText = [item.title, item.originalTitle, ...(item.aliases ?? []), ...(item.keywords ?? [])].filter(Boolean).join(" ");
  const isAnimation = genres.includes("animation") || genres.includes("animated");
  const isAnime = item.type === "anime" || (isAnimation && (originalLanguage === "ja" || countries.includes("JP") || ANIME_KEYWORDS.test(titleText)));
  const isIndian = countries.includes("IN") || LANGUAGE_COUNTRY[originalLanguage] === "IN" || (item.languages ?? []).some(code => LANGUAGE_COUNTRY[String(code).toLowerCase()] === "IN");
  if (isAnime) tags.add("anime");
  if (isIndian) tags.add("indian-content");
  if (isAnimation) tags.add("animation");
  if ((item.dubLanguages ?? []).some(code => String(code).toLowerCase() === "hi")) tags.add("hindi-dubbed");
  if ((item.audioLanguages ?? []).some(code => String(code).toLowerCase() === "hi")) tags.add("hindi-audio");
  return {
    ...item,
    isAnime,
    isIndian,
    tags: [...tags],
    collections: [
      ...(isAnime ? ["Anime"] : []),
      ...(isIndian ? ["Indian Cinema"] : []),
      ...((item.dubLanguages ?? []).includes("hi") ? ["Hindi-Dubbed"] : [])
    ]
  };
}

export function buildCatalogueShelves(items) {
  const classified = items.map(classifyTitle);
  return {
    "Indian Cinema": classified.filter(item => item.isIndian),
    "Anime": classified.filter(item => item.isAnime),
    "Hindi-Dubbed": classified.filter(item => item.tags.includes("hindi-dubbed")),
    "Hindi Audio": classified.filter(item => item.tags.includes("hindi-audio")),
    "Animation": classified.filter(item => item.tags.includes("animation")),
    "Trending": classified.filter(item => item.tags.includes("trending")),
    "Top Rated": classified.filter(item => item.tags.includes("top-rated"))
  };
}
