import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTitle, auditCatalogue } from "../../../packages/catalog/src/catalog.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const ingestedPath = path.resolve(here, "../../../packages/catalog/src/ingested-catalog.json");
const samplePath = path.resolve(here, "../../../packages/catalog/src/sample-catalog.json");
const activePath = fs.existsSync(ingestedPath) ? ingestedPath : samplePath;
const items = JSON.parse(fs.readFileSync(activePath, "utf8")).map(normalizeTitle);
const report = auditCatalogue(items);
console.log(JSON.stringify({ source: path.basename(activePath), ...report }, null, 2));
