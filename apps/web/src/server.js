import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.WEB_PORT || 4173);
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json; charset=utf-8" };

http.createServer((req,res) => {
  const url = new URL(req.url, "http://localhost");
  let file = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "");
  const resolved = path.resolve(root, file);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) { res.writeHead(403); return res.end("Forbidden"); }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "content-type": mime[path.extname(resolved)] || "application/octet-stream", "cache-control":"no-cache" });
  if(resolved===path.join(root,"index.html")){let html=fs.readFileSync(resolved,"utf8");const api=process.env.BHARATDARSHAN_API;if(api)html=html.replace("</head>",`<script>window.BHARATDARSHAN_API=${JSON.stringify(api)};</script></head>`);res.end(html);return;}fs.createReadStream(resolved).pipe(res);
}).listen(port, "0.0.0.0", () => console.log(`BharatDarshan Web running on http://localhost:${port}`));
