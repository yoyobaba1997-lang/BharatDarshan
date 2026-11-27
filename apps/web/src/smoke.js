const base=String(process.env.WEB_URL||"http://localhost:4173").replace(/\/$/,"");
const timeoutMs=Number(process.env.SMOKE_TIMEOUT_MS||10000);
const securityHeaders=["x-content-type-options","x-frame-options","referrer-policy","permissions-policy"];
const expectedApi=process.env.BHARATDARSHAN_API;
const checks=[
  ["/","text/html",["BharatDarshan","detail-modal","watchlist"]],
  ["/styles.css","text/css",["provider-details","dashboard"]],
  ["/app.js","javascript",["function init","catalogueMeta","watchlist"]],
  ["/manifest.webmanifest","application/manifest",["BharatDarshan"]],
  ["/sw.js","javascript",["install","fetch"]]
];
let failed=0;
for(const [route,type,markers] of checks){
  try{
    const response=await fetch(base+route,{signal:AbortSignal.timeout(timeoutMs)});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const contentType=response.headers.get("content-type")||"";
    if(!contentType.includes(type))throw new Error("Unexpected content-type "+contentType);
    for(const header of securityHeaders)if(!response.headers.has(header))throw new Error("Missing security header: "+header);
    const body=await response.text();
    for(const marker of markers)if(!body.includes(marker))throw new Error("Missing expected marker "+marker);
    if(route==="/"&&expectedApi&&!body.includes(JSON.stringify(expectedApi)))throw new Error("Web page does not expose the configured BharatDarshan API URL");
    console.log("PASS",route);
  }catch(error){failed++;console.error("FAIL",route,error.message);}
}
try{
  const missing=await fetch(base+"/smoke-test-missing-route",{signal:AbortSignal.timeout(timeoutMs)});
  if(missing.status!==404)throw new Error("Expected HTTP 404, got "+missing.status);
  for(const header of securityHeaders)if(!missing.headers.has(header))throw new Error("Missing security header: "+header);
  console.log("PASS 404 handling with security headers");
}catch(error){failed++;console.error("FAIL 404 handling",error.message);}
try{
  const response=await fetch(base+"/",{method:"POST",signal:AbortSignal.timeout(timeoutMs)});
  if(response.status!==405||response.headers.get("allow")!=="GET, OPTIONS")throw new Error("Expected HTTP 405 and Allow header, got "+response.status);
  for(const header of securityHeaders)if(!response.headers.has(header))throw new Error("Missing security header: "+header);
  console.log("PASS unsupported-method handling");
}catch(error){failed++;console.error("FAIL unsupported-method handling",error.message);}
try{
  const response=await fetch(base+"/",{method:"OPTIONS",signal:AbortSignal.timeout(timeoutMs)});
  if(response.status!==204)throw new Error("Expected HTTP 204, got "+response.status);
  for(const header of securityHeaders)if(!response.headers.has(header))throw new Error("Missing security header: "+header);
  console.log("PASS OPTIONS preflight");
}catch(error){failed++;console.error("FAIL OPTIONS preflight",error.message);}
if(failed)process.exitCode=1;else console.log(`Web release smoke checks passed against ${base} (${checks.length + 3} checks)`);
