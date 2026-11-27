import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.WEB_PORT || 4173);
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json; charset=utf-8" };
function securityHeaders(){return {"x-content-type-options":"nosniff","x-frame-options":"DENY","referrer-policy":"strict-origin-when-cross-origin","permissions-policy":"camera=(), microphone=(), geolocation=()","cache-control":"no-store"};}
function error(res,status,message,extra={}){res.writeHead(status,{"content-type":"text/plain; charset=utf-8",...securityHeaders(),...extra});res.end(message);}
http.createServer((req,res) => {
  if(req.method==="OPTIONS"){res.writeHead(204,{...securityHeaders(),"access-control-allow-methods":"GET, OPTIONS","access-control-allow-headers":"Content-Type"});return res.end();}
  if(req.method!=="GET")return error(res,405,"Method not allowed",{"allow":"GET, OPTIONS"});
  const url = new URL(req.url, "http://localhost");
  let file = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, "");
  const resolved = path.resolve(root, file);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) return error(res,403,"Forbidden");
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return error(res,404,"Not found");
  res.writeHead(200, { "content-type": mime[path.extname(resolved)] || "application/octet-stream", "cache-control":"no-cache", ...securityHeaders() });
  if(resolved===path.join(root,"index.html")){let html=fs.readFileSync(resolved,"utf8");const api=process.env.BHARATDARSHAN_API;if(api)html=html.replace("</head>",`<script>window.BHARATDARSHAN_API=${JSON.stringify(api).replace(/</g,"\\\\u003c")};</script></head>`);res.end(html);return;}fs.createReadStream(resolved).pipe(res);
}).listen(port, "0.0.0.0", () => console.log(`BharatDarshan Web running on http://localhost:${port}`));
