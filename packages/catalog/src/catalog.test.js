import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTitle, searchCatalogue, validateCatalogue, auditCatalogue, languageRegistry, getLanguage, streamingPlatforms, classifyTitle, buildCatalogueShelves } from "./catalog.js";
import sample from "./sample-catalog.json" with { type: "json" };

test("platform registry includes Indian and international OTT services", () => {
  const names=streamingPlatforms.map(p=>p.name);
  for (const name of ["ZEE5","Sony LIV","JioHotstar","Prime Video","Netflix","aha","hoichoi","Sun NXT"]) assert.ok(names.includes(name));
});

test("language registry includes Indian languages and is searchable by code", () => {
  assert.ok(languageRegistry.length >= 40);
  assert.equal(getLanguage("hi").name, "Hindi");
  assert.equal(getLanguage("or").name, "Odia");
});

test("language registry uses correct Bodo and Tibetan ISO codes", () => { assert.equal(getLanguage("brx").name,"Bodo"); assert.equal(getLanguage("bo").name,"Tibetan"); assert.equal(getLanguage("gon").name,"Gondi"); });

test("normalization trims and de-duplicates catalogue metadata", () => {
  const item = normalizeTitle({id:"x",title:"  Test  ",genres:["Drama","Drama"],languages:["hi","hi"]});
  assert.equal(item.title,"Test");
  assert.deepEqual(item.genres,["Drama"]);
  assert.deepEqual(item.languages,["hi"]);
});

test("search supports title query and language/audio/dub filters", () => {
  assert.equal(searchCatalogue(sample,"Demo Indian Film").length,1);
  assert.equal(searchCatalogue(sample,"",{language:"or"}).length,1);
  assert.equal(searchCatalogue(sample,"",{language:"hi",type:"anime"}).length,1);
  assert.equal(searchCatalogue(sample,"",{genre:"Adventure"}).length,1);
});

test("search filters by streaming platform metadata",()=>{const items=[{id:"p1",title:"Platform Film",streamingPlatforms:["Netflix"]},{id:"p2",title:"Other",providerAvailability:[{platform:"ZEE5"}]}];assert.equal(searchCatalogue(items,"",{platform:"Netflix"}).length,1);assert.equal(searchCatalogue(items,"",{platform:"ZEE5"}).length,1);});

test("validation detects duplicate IDs and missing title", () => {
  const issues=validateCatalogue([{id:"same",title:"One",type:"movie"},{id:"same",title:"Two",type:"movie"},{id:"missing",title:""}]);
  assert.ok(issues.some(issue=>issue.error==="Duplicate id"));
  assert.ok(issues.some(issue=>issue.error==="Missing title"));
});

test("classification detects Indian content and anime conservatively from metadata", () => {
  const tamil = classifyTitle({ id:"t", title:"Tamil Film", type:"movie", languages:["ta"] });
  assert.equal(tamil.isIndian, true);
  const anime = classifyTitle({ id:"a", title:"Anime Film", type:"movie", originalLanguage:"ja", genres:["Animation"], regions:["JP"] });
  assert.equal(anime.isAnime, true);
  assert.ok(anime.tags.includes("anime"));
});

test("Hindi dubbed shelf requires explicit Hindi dub metadata", () => {
  const dubbed = classifyTitle({ id:"h", title:"Dubbed", type:"movie", dubLanguages:["hi"] });
  const notAssumed = classifyTitle({ id:"n", title:"Unknown", type:"movie" });
  assert.ok(dubbed.tags.includes("hindi-dubbed"));
  assert.ok(!notAssumed.tags.includes("hindi-dubbed"));
});

test("shelf builder returns classified collections", () => {
  const shelves = buildCatalogueShelves([
    { id:"1", title:"Indian", languages:["hi"] },
    { id:"2", title:"Anime", originalLanguage:"ja", genres:["Animation"], regions:["JP"] }
  ]);
  assert.equal(shelves["Indian Cinema"].length, 1);
  assert.equal(shelves.Anime.length, 1);
});

test("classification preserves imported discovery tags and handles case-insensitive Hindi metadata", () => {
  const item=classifyTitle({id:"x",title:"Discovery",type:"movie",tags:["Trending","Popular"],dubLanguages:["HI"],audioLanguages:["hi"]});
  assert.ok(item.tags.includes("trending"));
  assert.ok(item.tags.includes("popular"));
  assert.ok(item.tags.includes("hindi-dubbed"));
  assert.ok(item.collections.includes("Hindi-Dubbed"));
  assert.ok(item.collections.includes("Hindi Audio"));
  const shelves=buildCatalogueShelves([item]);
  assert.equal(shelves.Trending.length,1);
  assert.equal(shelves.Popular.length,1);
});


test("catalogue audit reports missing metadata, invalid rating and duplicate titles", () => {
  const report = auditCatalogue([
    { id:"a", title:"Same Film", type:"movie", year:2020, poster:"poster.jpg", overview:"Synopsis", genres:["Drama"], languages:["hi"], rating:8 },
    { id:"b", title:"Same Film", type:"movie", year:2020, rating:12 },
    { id:"c", title:"Incomplete", type:"series", rating:-1 }
  ]);
  assert.equal(report.counts.total,3);
  assert.equal(report.counts.duplicateTitles,1);
  assert.equal(report.counts.invalidRatings,2);
  assert.ok(report.issues.some(issue=>issue.code==="missing_poster"));
  assert.ok(report.issues.some(issue=>issue.code==="missing_overview"));
  assert.ok(report.issues.some(issue=>issue.code==="missing_languages"));
  assert.ok(report.completenessPercent < 100);
});

test("catalogue audit treats an empty catalogue as 100 percent completeness", () => {
  const report=auditCatalogue([]);
  assert.equal(report.completenessPercent,100);
  assert.equal(report.issues.length,0);
});
