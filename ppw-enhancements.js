(()=>{
"use strict";
const SUPABASE_URL="https://qyipadinsphoyxotrceo.supabase.co";
const SUPABASE_KEY="sb_publishable_S73dZK9ro03lWDbHFzZhw_5t5pDtGt";
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
const date=v=>v?new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase():"";

function revealSetup(){
 const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
 const items=document.querySelectorAll(".reveal");
 if(reduce){items.forEach(el=>el.classList.add("visible"));return}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   entry.target.classList.toggle("visible",entry.isIntersecting);
 }),{threshold:.08,rootMargin:"0px 0px -30px 0px"});
 items.forEach(el=>observer.observe(el));
}

async function renderFeatured(){
 const host=document.getElementById("featuredArticle");
 if(!host)return;
 const {data,error}=await db.from("articles").select("id,title,slug,excerpt,category,author,image_url,published_at,featured").eq("status","published").order("published_at",{ascending:false}).limit(12);
 if(error){console.warn("PPW featured stories:",error.message);return}
 const lead=data?.find(a=>a.featured)||data?.[0];
 const second=data?.find(a=>a.id!==lead?.id);
 if(!lead){host.innerHTML='<div class="empty-card">Your first featured story will appear here after you publish it.</div>';return}
 host.classList.add("dual-featured");
 host.innerHTML=[lead,second].filter(Boolean).map((a,i)=>`<article class="featured-card featured-card-${i+1} reveal"><a href="article.html?slug=${encodeURIComponent(a.slug)}">${a.image_url?`<img class="story-image" src="${esc(a.image_url)}" alt="${esc(a.title)}" loading="lazy">`:`<div class="story-placeholder">${esc(a.category).toUpperCase()}</div>`}<div class="story-body"><div class="featured-badge">${i===0?"EDITOR'S LEAD":"ALSO FEATURED"}</div><span class="category-pill">${esc(a.category).toUpperCase()}</span><h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"Read this story from Paw Prints Weekly.")}</p><div class="meta"><span>${esc((a.author||"PPW Staff").toUpperCase())}</span><span>${date(a.published_at)}</span></div></div></a></article>`).join("");
 revealSetup();
}

async function renderStaff(){
 const host=document.getElementById("staffGrid");
 if(!host)return;
 const {data,error}=await db.from("staff_members").select("id,name,role,bio,sort_order").eq("active",true).order("sort_order",{ascending:true});
 if(error){host.innerHTML='<div class="empty-card">The newsroom staff list is temporarily unavailable.</div>';return}
 host.innerHTML=data?.length?data.map(s=>`<article class="staff-card reveal"><div class="staff-initial">${esc((s.name||"PPW").trim().charAt(0).toUpperCase())}</div><div><span class="staff-role">${esc(s.role||"Staff Member")}</span><h3>${esc(s.name)}</h3>${s.bio?`<p>${esc(s.bio)}</p>`:""}</div></article>`).join(""):'<div class="empty-card">Staff information will appear here soon.</div>';
 revealSetup();
}

function renderGames(){
 if(document.getElementById("ppwGamesSection"))return;
 const anchor=document.querySelector("#staff")||document.querySelector("#about");
 if(!anchor)return;
 const section=document.createElement("section");
 section.id="ppwGamesSection";
 section.className="section ppw-games-home reveal";
 section.innerHTML=`<div class="section-head"><div><span class="eyebrow">TAKE A BREAK</span><h2>PPW Games</h2></div><span class="head-note">Daily puzzles + quick games for Wildcats.</span></div><div class="ppw-games-card"><div><span class="ppw-games-label">PLAY TODAY</span><h3>PawWord, Crossword & Paw Match</h3><p>Try the daily word puzzle, solve the mini crossword, or see how fast you can match all eight pairs.</p></div><div class="ppw-games-actions"><a href="games.html#pawword" class="button primary">Play PawWord</a><a href="games.html#paw-match" class="button secondary">Play Paw Match</a></div></div>`;
 anchor.parentNode.insertBefore(section,anchor);
 revealSetup();
}

function addGamesNav(){
 const nav=document.getElementById("mainNav");
 if(!nav||nav.querySelector('a[href="games.html"]'))return;
 const a=document.createElement("a");a.href="games.html";a.textContent="Games";
 nav.insertBefore(a,nav.querySelector('a[href="admin/"]')||null);
}

function performanceMode(){
 const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const slow=connection&&(connection.saveData||/2g/.test(connection.effectiveType||""));
 const cores=navigator.hardwareConcurrency||2;
 const memory=navigator.deviceMemory||2;
 const high=!reduce&&!slow&&(cores>=6||memory>=8);
 document.documentElement.dataset.ppwPerformance=high?"high":"light";
 if(!high)return;
 const style=document.createElement("style");
 style.textContent=`html[data-ppw-performance="high"] .interactive-card{transition:transform .2s ease,box-shadow .2s ease}html[data-ppw-performance="high"] .interactive-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(70,45,20,.12)}`;
 document.head.appendChild(style);
}

function addInteractiveCards(){
 document.querySelectorAll(".story-card,.life-card,.perspective-card,.feature-card,.media-card,.editorial-card,.staff-card").forEach(el=>el.classList.add("interactive-card"));
}

function start(){
 renderFeatured();
 renderStaff();
 renderGames();
 addGamesNav();
 performanceMode();
 addInteractiveCards();
 document.querySelectorAll('a[href="admin.html"]').forEach(a=>a.href="admin/");
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
