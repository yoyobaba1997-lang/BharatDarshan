import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchCatalogue, languageRegistry, catalogueCategories, streamingPlatforms, normalizeTitle } from "../../../packages/catalog/src/catalog.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const samplePath = path.resolve(here, "../../../packages/catalog/src/sample-catalog.json");
const catalogue = JSON.parse(fs.readFileSync(samplePath, "utf8")).map(normalizeTitle);
const PORT = Number(process.env.PORT || 3000);

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
  res.end(JSON.stringify(body, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,OPTIONS",
      "access-control-allow-headers": "Content-Type"
    });
    return res.end();
  }
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/health") return send(res, 200, { ok: true, name: "BharatDarshan API", version: "0.1.0" });
  if (url.pathname === "/languages") return send(res, 200, languageRegistry);
  if (url.pathname === "/categories") return send(res, 200, catalogueCategories);
  if (url.pathname === "/platforms") return send(res, 200, streamingPlatforms);
  if (url.pathname === "/catalog") {
    const query = url.searchParams.get("q") ?? "";
    const filters = {
      type: url.searchParams.get("type") || undefined,
      language: url.searchParams.get("language") || undefined,
      genre: url.searchParams.get("genre") || undefined,
      region: url.searchParams.get("region") || undefined,
      year: url.searchParams.get("year") || undefined
    };
    const results = searchCatalogue(catalogue, query, filters);
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 50)));
    const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
    return send(res, 200, { total: results.length, limit, offset, results: results.slice(offset, offset + limit) });
  }
  return send(res, 404, { error: "Not found", availableRoutes: ["/health", "/languages", "/categories", "/platforms", "/catalog"] });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BharatDarshan API listening on ${PORT}`);
});
