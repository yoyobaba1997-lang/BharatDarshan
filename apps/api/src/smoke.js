const base=String(process.env.API_URL||"http://localhost:3000").replace(/\/$/,"");
const checks=["/health","/catalogue-meta","/languages","/categories","/platforms","/stats","/quality","/catalog?limit=1","/export"];
let failed=0;
for(const route of checks){
  try{
    const response=await fetch(base+route,{headers:{accept:"application/json"}});
    const contentType=response.headers.get("content-type")||"";
    if(!response.ok||!contentType.includes("application/json"))throw new Error(`HTTP ${response.status} / content-type ${contentType}`);
    const data=await response.json();
    if(route==="/health"&&!data.ok)throw new Error("Health payload did not report ok=true");
    if(route==="/catalog?limit=1"&&!Array.isArray(data.results))throw new Error("Catalogue response missing results array");
    if(route==="/export"&&!Array.isArray(data.items))throw new Error("Export response missing items array");
    console.log("PASS",route);
  }catch(error){failed++;console.error("FAIL",route,error.message);}
}
if(failed)process.exitCode=1;else console.log(`Smoke checks passed against ${base}`);
