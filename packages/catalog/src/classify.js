const LANGUAGE_COUNTRY = {
  hi:"IN", ta:"IN", te:"IN", ml:"IN", kn:"IN", bn:"IN", mr:"IN", gu:"IN", pa:"IN", or:"IN", as:"IN", ur:"IN", sa:"IN", ks:"IN", sd:"IN", kok:"IN", mai:"IN", mni:"IN", ne:"IN", brx:"IN", doi:"IN", sat:"IN", bho:"IN", awa:"IN", hne:"IN", raj:"IN", har:"IN", tcy:"IN", kha:"IN", grt:"IN", lus:"IN", trp:"IN", lb:"IN", mwr:"IN", mag:"IN", sck:"IN", bap:"IN", dhd:"IN", rkt:"IN", pnb:"IN", syr:"IN", kru:"IN", ho:"IN", unr:"IN", xnr:"IN", bfq:"IN", gvr:"IN"
};
const ANIME_KEYWORDS = /anime|manga|studio ghibli|shonen|shojo|isekai|crunchyroll/i;
const hasCode = (list,code) => (list??[]).some(value=>String(value).trim().toLowerCase()===code);
export function classifyTitle(item) {
  const genres=(item.genres??[]).map(x=>String(x).toLowerCase());
  const countries=(item.regions??[]).map(x=>String(x).toUpperCase());
  const originalLanguage=String(item.originalLanguage??item.languages?.[0]??"").toLowerCase();
  const tags=new Set((item.tags??[]).map(x=>String(x).toLowerCase()));
  const titleText=[item.title,item.originalTitle,...(item.aliases??[]),...(item.keywords??[])].filter(Boolean).join(" ");
  const isAnimation=genres.includes("animation")||genres.includes("animated");
  const isAnime=item.type==="anime"||(isAnimation&&(originalLanguage==="ja"||countries.includes("JP")||ANIME_KEYWORDS.test(titleText)));
  const isIndian=countries.includes("IN")||LANGUAGE_COUNTRY[originalLanguage]==="IN"||(item.languages??[]).some(code=>LANGUAGE_COUNTRY[String(code).toLowerCase()]==="IN");
  if(isAnime)tags.add("anime");
  if(isIndian)tags.add("indian-content");
  if(isAnimation)tags.add("animation");
  if(hasCode(item.dubLanguages,"hi"))tags.add("hindi-dubbed");
  if(hasCode(item.audioLanguages,"hi"))tags.add("hindi-audio");
  const collections=new Set((item.collections??[]).map(x=>String(x)));
  if(isAnime)collections.add("Anime");
  if(isIndian)collections.add("Indian Cinema");
  if(hasCode(item.dubLanguages,"hi"))collections.add("Hindi-Dubbed");
  if(hasCode(item.audioLanguages,"hi"))collections.add("Hindi Audio");
  return {...item,isAnime,isIndian,tags:[...tags],collections:[...collections]};
}
export function buildCatalogueShelves(items) {
  const classified=items.map(classifyTitle);
  return {
    "Indian Cinema":classified.filter(item=>item.isIndian),
    "Anime":classified.filter(item=>item.isAnime),
    "Hindi-Dubbed":classified.filter(item=>item.tags.includes("hindi-dubbed")),
    "Hindi Audio":classified.filter(item=>item.tags.includes("hindi-audio")),
    "Animation":classified.filter(item=>item.tags.includes("animation")),
    "Trending":classified.filter(item=>item.tags.includes("trending")),
    "Popular":classified.filter(item=>item.tags.includes("popular")),
    "Top Rated":classified.filter(item=>item.tags.includes("top-rated"))
  };
}
