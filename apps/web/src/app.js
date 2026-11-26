const API = window.BHARATDARSHAN_API || "http://localhost:3000";
let catalogue = [];
let languages = [];
let activeType = "";
let activeLanguage = "";
let query = "";
const $ = (id) => document.getElementById(id);
const fallback = [
 {id:"demo-1",title:"Sample Indian Film",type:"movie",languages:["hi"],genres:["Drama"],year:2025,regions:["IN"],rating:8.1},
 {id:"demo-2",title:"Sample Regional Series",type:"series",languages:["ta"],genres:["Thriller"],year:2024,regions:["IN"],rating:7.8},
 {id:"demo-3",title:"Sample Anime",type:"anime",languages:["ja"],genres:["Animation"],year:2025,regions:["JP"],rating:8.5},
 {id:"demo-4",title:"Sample World Cinema",type:"movie",languages:["en"],genres:["Drama"],year:2023,regions:["US"],rating:7.6}
];
function langName(code){return languages.find(l=>l.code===code)?.name || code || "Unknown";}
function titleCard(item){const name=item.title||item.name||"Untitled";const year=item.year||item.releaseDate?.slice?.(0,4)||"";const lang=(item.languages||[])[0];const card=document.createElement("article");card.className="card";card.innerHTML=`<div class="poster"><div class="poster-fallback">${escapeHtml(name)}</div></div><div class="card-title" title="${escapeHtml(name)}">${escapeHtml(name)}</div><div class="card-meta"><span>${escapeHtml(String(year))}</span><span>•</span><span>${escapeHtml(langName(lang))}</span></div>`;return card;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function filtered(){return catalogue.filter(i=>{const t=(i.title||i.name||"").toLowerCase();const q=query.toLowerCase();const matchesQuery=!q||t.includes(q)||(i.aliases||[]).some(a=>a.toLowerCase().includes(q));const matchesType=!activeType||i.type===activeType||(activeType==="anime"&&i.tags?.includes("anime"));const matchesLang=!activeLanguage||(i.languages||[]).includes(activeLanguage);return matchesQuery&&matchesType&&matchesLang;});}
function renderShelf(id,items){const el=$(id);el.replaceChildren();items.slice(0,18).forEach(i=>el.append(titleCard(i)));if(!items.length){el.innerHTML='<div class="empty">No matching titles yet.</div>';}}
function render(){const items=filtered();const indian=items.filter(i=>i.isIndian||i.tags?.includes("indian-content")||(i.regions||[]).includes("IN"));const anime=items.filter(i=>i.type==="anime"||i.tags?.includes("anime"));const regional=indian.filter(i=>(i.languages||[]).some(l=>!["hi","en"].includes(l)));const international=items.filter(i=>!indian.includes(i)&&!anime.includes(i));renderShelf("trending-cards",items);renderShelf("indian-cards",indian);renderShelf("regional-cards",regional);renderShelf("anime-cards",anime);renderShelf("international-cards",international);$("status").textContent=`Showing ${items.length} catalogue titles · ${languages.length} language options · ${query?"search results": "metadata discovery"}`;}
function setupLanguages(){const select=$("language-select");languages.forEach(l=>{const option=document.createElement("option");option.value=l.code;option.textContent=l.nativeName? `${l.name} · ${l.nativeName}`:l.name;select.append(option);});const chipRoot=$("language-chips");languages.slice(0,16).forEach(l=>{const b=document.createElement("button");b.className="language-chip";b.textContent=l.nativeName||l.name;b.dataset.language=l.code;b.onclick=()=>{activeLanguage=activeLanguage===l.code?"":l.code;select.value=activeLanguage;updateLanguageChips();render();};chipRoot.append(b);});const grid=$("language-grid");languages.forEach(l=>{const tile=document.createElement("button");tile.className="language-tile";tile.innerHTML=`<strong>${escapeHtml(l.nativeName||l.name)}</strong><span>${escapeHtml(l.name)}</span>`;tile.onclick=()=>{activeLanguage=l.code;select.value=l.code;updateLanguageChips();render();window.scrollTo({top:0,behavior:"smooth"});};grid.append(tile);});}
function updateLanguageChips(){document.querySelectorAll(".language-chip").forEach(b=>b.classList.toggle("selected",b.dataset.language===activeLanguage));}
async function init(){try{const [cat,langs]=await Promise.all([fetch(API+"/catalog?limit=100").then(r=>r.ok?r.json():Promise.reject()),fetch(API+"/languages").then(r=>r.ok?r.json():Promise.reject())]);catalogue=cat.results||[];languages=langs;}catch(e){catalogue=fallback;languages=[{code:"hi",name:"Hindi",nativeName:"हिन्दी"},{code:"ta",name:"Tamil",nativeName:"தமிழ்"},{code:"te",name:"Telugu",nativeName:"తెలుగు"},{code:"bn",name:"Bengali",nativeName:"বাংলা"},{code:"ml",name:"Malayalam",nativeName:"മലയാളം"},{code:"kn",name:"Kannada",nativeName:"ಕನ್ನಡ"},{code:"mr",name:"Marathi",nativeName:"मराठी"},{code:"en",name:"English",nativeName:"English"},{code:"ja",name:"Japanese",nativeName:"日本語"}];$("status").textContent="API unavailable · displaying demonstration catalogue only. Start API at localhost:3000 to load real metadata.";}setupLanguages();render();}
document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{activeType=b.dataset.type;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("selected",x===b));render();});
$("language-select").onchange=e=>{activeLanguage=e.target.value;updateLanguageChips();render();};
$("search-toggle").onclick=()=>{$("search-panel").classList.toggle("hidden");$("search-input").focus();};
$("search-close").onclick=()=>{$("search-panel").classList.add("hidden");query="";$("search-input").value="";render();};
$("search-input").oninput=e=>{query=e.target.value;render();};
$("explore-btn").onclick=()=>document.querySelector(".shelf").scrollIntoView({behavior:"smooth"});
$("details-btn").onclick=()=>alert("BharatDarshan is a multilingual metadata and discovery project. Streaming availability depends on official provider rights and region.");
init();
