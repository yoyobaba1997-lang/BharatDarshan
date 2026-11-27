import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchCatalogue, languageRegistry, catalogueCategories, streamingPlatforms, normalizeTitle, buildCatalogueShelves, auditCatalogue } from "../../../packages/catalog/src/catalog.js";
import { toGenericCatalogue } from "../../../packages/adapters/src/generic.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const samplePath = path.resolve(here, "../../../packages/catalog/src/sample-catalog.json");
const ingestedPath = path.resolve(here, "../../../packages/catalog/src/ingested-catalog.json");
const activePath = fs.existsSync(ingestedPath) ? ingestedPath : samplePath;
const catalogue = JSON.parse(fs.readFileSync(activePath, "utf8")).map(normalizeTitle);
const PORT = Number(process.env.PORT || 3000);
const API_STARTED_AT = new Date().toISOString();

function securityHeaders() { return { "access-control-allow-origin": process.env.ALLOWED_ORIGIN || "*", "x-content-type-options":"nosniff", "x-frame-options":"DENY", "referrer-policy":"no-referrer", "permissions-policy":"camera=(), microphone=(), geolocation=()", "vary":"Origin" }; }
function send(res, status, body, extraHeaders = {}) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", ...securityHeaders(), "cache-control":status===200 && res.req?.url!=="/health" ? "public, max-age=60" : "no-store", ...extraHeaders });
  res.end(JSON.stringify(body, null, 2));
}

const rateBuckets=new Map();const MAX_RATE_BUCKETS=10000;const envInt=(name,fallback,min,max)=>{const raw=process.env[name];if(raw===undefined||raw==="")return fallback;const value=Number(raw);return Number.isInteger(value)&&value>=min&&value<=max?value:fallback;};const RATE_LIMIT=envInt("API_RATE_LIMIT",120,1,100000);const RATE_WINDOW_MS=envInt("API_RATE_WINDOW_MS",60000,1000,3600000);function checkRateLimit(ip){const now=Date.now();const bucket=rateBuckets.get(ip);if(!bucket||now-bucket.startedAt>=RATE_WINDOW_MS){if(rateBuckets.size>=MAX_RATE_BUCKETS&&!bucket){const oldest=rateBuckets.keys().next().value;if(oldest!==undefined)rateBuckets.delete(oldest);}rateBuckets.set(ip,{startedAt:now,count:1});return true;}bucket.count++;return bucket.count<=RATE_LIMIT;}setInterval(()=>{const now=Date.now();for(const [ip,bucket] of rateBuckets)if(now-bucket.startedAt>=RATE_WINDOW_MS)rateBuckets.delete(ip);},Math.min(RATE_WINDOW_MS,60000)).unref();
const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": process.env.ALLOWED_ORIGIN || "*",
      "access-control-allow-methods": "GET,OPTIONS",
      "access-control-allow-headers": "Content-Type"
    });
    return res.end();
  }
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed", allowedMethods: ["GET", "OPTIONS"] }, { "allow":"GET, OPTIONS" });
  const clientIp=req.socket.remoteAddress||"unknown";if(!checkRateLimit(clientIp))return send(res,429,{error:`Rate limit exceeded. Retry after ${Math.ceil(RATE_WINDOW_MS/1000)} seconds.`},{"retry-after":String(Math.ceil(RATE_WINDOW_MS/1000))});
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/health") return send(res, 200, { ok: true, name: "BharatDarshan API", version: "0.1.0", catalogueCount: catalogue.length, catalogueSource: path.basename(activePath), checkedAt: new Date().toISOString() });
  if (url.pathname === "/languages") return send(res, 200, languageRegistry);
  if (url.pathname === "/categories") return send(res, 200, catalogueCategories);
  if (url.pathname === "/platforms") return send(res, 200, streamingPlatforms);
  if (url.pathname === "/catalogue-meta") {const snapshotExists=activePath===ingestedPath;const snapshotStat=snapshotExists?fs.statSync(activePath):null;const providerRecords=catalogue.flatMap(item=>item.providerAvailability||[]);const providerTitles=catalogue.filter(item=>(item.providerAvailability||[]).length).length;const checkedDates=providerRecords.map(record=>record.checkedAt).filter(Boolean).sort();return send(res,200,{source:snapshotExists?"ingested-snapshot":"demo-sample",sourceFile:path.basename(activePath),titleCount:catalogue.length,snapshotModifiedAt:snapshotStat?.mtime.toISOString()||null,providerMetadataTitles:providerTitles,providerRecordCount:providerRecords.length,providerRegions:[...new Set(providerRecords.map(record=>record.region).filter(Boolean))],latestProviderCheckedAt:checkedDates.at(-1)||null,apiStartedAt:API_STARTED_AT});}
  if (url.pathname === "/shelves") return send(res, 200, Object.fromEntries(Object.entries(buildCatalogueShelves(catalogue)).map(([name, items]) => [name, items.length])));
  if (url.pathname === "/quality") return send(res, 200, auditCatalogue(catalogue));
  if (url.pathname === "/export") return send(res, 200, toGenericCatalogue(catalogue));
  if (url.pathname === "/stats") {
    const typeCounts = Object.fromEntries(["movie","series","anime","episode"].map(type => [type, catalogue.filter(item => item.type === type || (type === "anime" && item.tags?.includes("anime"))).length]));
    const languageCounts = {};
    catalogue.forEach(item => [...(item.languages || []), ...(item.audioLanguages || [])].forEach(code => { languageCounts[code] = (languageCounts[code] || 0) + 1; }));
    const indianCount = catalogue.filter(item => item.isIndian || item.tags?.includes("indian-content") || (item.regions || []).includes("IN")).length;
    const providerTitles=catalogue.filter(item=>Array.isArray(item.providerAvailability)&&item.providerAvailability.length).length;const providerNames=[...new Set(catalogue.flatMap(item=>(item.providerAvailability||[]).map(record=>record.platform)))];const providerRegions=[...new Set(catalogue.flatMap(item=>(item.providerAvailability||[]).map(record=>record.region)))];return send(res, 200, { total: catalogue.length, indian: indianCount, typeCounts, languageCounts, providerMetadataTitles:providerTitles, providers:providerNames, providerRegions, quality: auditCatalogue(catalogue) });
  }
  if (url.pathname === "/catalog") {
    const query = url.searchParams.get("q") ?? "";if(query.length>300)return send(res,400,{error:"Search query must be 300 characters or fewer"});
    const filters = {
      type: url.searchParams.get("type") || undefined,
      language: url.searchParams.get("language") || undefined,
      genre: url.searchParams.get("genre") || undefined,
      region: url.searchParams.get("region") || undefined,
      year: url.searchParams.get("year") || undefined,
      platform: url.searchParams.get("platform") || undefined
    };
    const results = searchCatalogue(catalogue, query, filters);
    const requestedLimit=Number(url.searchParams.get("limit")||50);const requestedOffset=Number(url.searchParams.get("offset")||0);if(!Number.isInteger(requestedLimit)||requestedLimit<1||requestedLimit>100||!Number.isInteger(requestedOffset)||requestedOffset<0)return send(res,400,{error:"limit must be 1–100 and offset must be a non-negative integer"});const limit=requestedLimit;const offset=requestedOffset;
    return send(res, 200, { total: results.length, limit, offset, results: results.slice(offset, offset + limit) });
  }
  return send(res, 404, { error: "Not found", availableRoutes: ["/health", "/languages", "/categories", "/platforms", "/catalogue-meta", "/catalog", "/shelves", "/quality", "/stats", "/export"] });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BharatDarshan API listening on ${PORT}`);
});
