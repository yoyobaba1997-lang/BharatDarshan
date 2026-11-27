import test from "node:test";
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {once} from "node:events";

const apiPort=49000+Math.floor(Math.random()*1000);
const webPort=50000+Math.floor(Math.random()*1000);
const apiBase=`http://127.0.0.1:${apiPort}`;
const webBase=`http://127.0.0.1:${webPort}`;

async function waitFor(url,child,label){
  for(let i=0;i<50;i++){
    if(child.exitCode!==null)throw new Error(`${label} exited early with code ${child.exitCode}`);
    try{const response=await fetch(url,{signal:AbortSignal.timeout(1000)});if(response.ok)return;}
    catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error(`${label} did not become ready`);
}
function runScript(script,env){
  const result=spawn(process.execPath,[script],{cwd:new URL("../../",import.meta.url),env:{...process.env,...env},stdio:["ignore","pipe","pipe"]});
  return new Promise((resolve,reject)=>{
    let stdout="",stderr="";
    result.stdout.on("data",chunk=>stdout+=chunk);
    result.stderr.on("data",chunk=>stderr+=chunk);
    result.once("error",reject);
    result.once("close",code=>code===0?resolve(stdout+stderr):reject(new Error(`${script} failed (${code})\n${stdout}\n${stderr}`)));
  });
}

test("API and web release smoke scripts pass against local servers",async t=>{
  const api=spawn(process.execPath,["apps/api/src/server.js"],{cwd:new URL("../../",import.meta.url),env:{...process.env,PORT:String(apiPort)},stdio:"ignore"});
  const web=spawn(process.execPath,["apps/web/src/server.js"],{cwd:new URL("../../",import.meta.url),env:{...process.env,WEB_PORT:String(webPort),BHARATDARSHAN_API:apiBase},stdio:"ignore"});
  t.after(()=>{api.kill();web.kill();});
  await Promise.all([waitFor(apiBase+"/health",api,"API"),waitFor(webBase+"/",web,"Web")]);
  const apiOutput=await runScript("apps/api/src/smoke.js",{API_URL:apiBase});
  assert.match(apiOutput,/API release smoke checks passed/);
  const webOutput=await runScript("apps/web/src/smoke.js",{WEB_URL:webBase});
  assert.match(webOutput,/Web release smoke checks passed/);
});
