import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTitle, searchCatalogue, validateCatalogue, languageRegistry, getLanguage } from "./catalog.js";
import sample from "./sample-catalog.json" with { type: "json" };

test("language registry includes Indian languages and is searchable by code", () => {
  assert.ok(languageRegistry.length >= 40);
  assert.equal(getLanguage("hi").name, "Hindi");
  assert.equal(getLanguage("or").name, "Odia");
});

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

test("validation detects duplicate IDs and missing title", () => {
  const issues=validateCatalogue([{id:"same",title:"One",type:"movie"},{id:"same",title:"Two",type:"movie"},{id:"missing",title:""}]);
  assert.ok(issues.some(issue=>issue.error==="Duplicate id"));
  assert.ok(issues.some(issue=>issue.error==="Missing title"));
});
