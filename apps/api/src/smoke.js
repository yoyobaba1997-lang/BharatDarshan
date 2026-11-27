const base=String(process.env.API_URL||"http://localhost:3000").replace(/\/$/,"");
const timeoutMs=Number(process.env.SMOKE_TIMEOUT_MS||10000);
const checks=[
  {route:"/health",validate:data=>{if(!data.ok)throw new Error("Health payload did not report ok=true");if(!Number.isInteger(data.catalogueCount)||data.catalogueCount<0)throw new Error("Health catalogueCount is invalid");}},
  {route:"/catalogue-meta",validate:data=>{if(!["demo-sample","ingested-snapshot"].includes(data.source))throw new Error("Unexpected catalogue source");if(!Number.isInteger(data.titleCount)||data.titleCount<0)throw new Error("Metadata titleCount is invalid");}},
  {route:"/languages",validate:data=>{if(!Array.isArray(data)||!data.length)throw new Error("Language registry must be a non-empty array");}},
  {route:"/categories",validate:data=>{if(!Array.isArray(data)||!data.length)throw new Error("Categories must be a non-empty array");}},
  {route:"/platforms",validate:data=>{if(!Array.isArray(data)||!data.length)throw new Error("Platforms must be a non-empty array");}},
  {route:"/stats",validate:data=>{if(!Number.isInteger(data.total)||data.total<0)throw new Error("Stats total is invalid");}},
  {route:"/quality",validate:data=>{if(!data||typeof data!=="object"||!data.counts)throw new Error("Quality report missing counts");}},
  {route:"/catalog?limit=1",validate:data=>{if(!Array.isArray(data.results)||!Number.isInteger(data.total)||data.limit!==1)throw new Error("Catalogue response schema invalid");}},
  {route:"/export",validate:data=>{if(!Array.isArray(data.items)||!data.schemaVersion)throw new Error("Export response schema invalid");}}
];
const securityHeaders=["x-content-type-options","x-frame-options","referrer-policy","permissions-policy"];
let failed=0;
for(const check of checks){
  try{
    const response=await fetch(base+check.route,{headers:{accept:"application/json"},signal:AbortSignal.timeout(timeoutMs)});
    const contentType=response.headers.get("content-type")||"";
    if(!response.ok||!contentType.includes("application/json"))throw new Error(`HTTP ${response.status} / content-type ${contentType}`);
    for(const header of securityHeaders)if(!response.headers.has(header))throw new Error(`Missing security header: ${header}`);
    check.validate(await response.json());
    console.log("PASS",check.route);
  }catch(error){failed++;console.error("FAIL",check.route,error.message);}
}
try{
  const response=await fetch(base+"/health",{method:"POST",signal:AbortSignal.timeout(timeoutMs)});
  if(response.status!==405||response.headers.get("allow")!=="GET, OPTIONS")throw new Error(`Expected 405 and Allow header, got ${response.status}`);
  console.log("PASS unsupported-method handling");
}catch(error){failed++;console.error("FAIL unsupported-method handling",error.message);}
if(failed)process.exitCode=1;else console.log(`API release smoke checks passed against ${base} (${checks.length+1} checks)`);
