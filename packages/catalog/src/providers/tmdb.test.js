import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTmdbResult } from "./tmdb.js";

test("TMDB movie result is normalized with stable source ID", () => {
  const movie=normalizeTmdbResult({id:123,title:"Example",original_title:"Example Original",overview:"Plot",release_date:"2025-05-01",original_language:"hi",genre_ids:[18],poster_path:"/poster.jpg",backdrop_path:"/back.jpg",vote_average:8.1},"movie",new Map([[18,"Drama"]]));
  assert.equal(movie.id,"tmdb-movie-123");
  assert.equal(movie.type,"movie");
  assert.equal(movie.title,"Example");
  assert.deepEqual(movie.genres,["Drama"]);
  assert.equal(movie.year,2025);
  assert.equal(movie.sourceIds.tmdb,123);
});

test("TMDB TV result uses series fields", () => {
  const show=normalizeTmdbResult({id:321,name:"Example Series",original_name:"Original",first_air_date:"2024-01-01",original_language:"ta",genre_ids:[10759]},"tv",new Map([[10759,"Action & Adventure"]]));
  assert.equal(show.type,"series");
  assert.equal(show.title,"Example Series");
  assert.equal(show.year,2024);
  assert.deepEqual(show.genres,["Action & Adventure"]);
});
