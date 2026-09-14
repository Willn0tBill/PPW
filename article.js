(()=>{
"use strict";
const addCss=href=>{const l=document.createElement("link");l.rel="stylesheet";l.href=href;document.head.appendChild(l)};
addCss("ppw-fixes.css?v=5");addCss("friendly.css?v=2");
const SUPABASE_URL="https://qyipadinsphoyxotrceo.supabase.co",SUPABASE_KEY="sb_publishable_S73dZK9ro03lWDbHFzZhw_5t5pDtGt";
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY),container=document.getElementById("articleContent"),slug=new URLSearchParams(location.search).get("slug");
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
const bodyHtml=v=>String(v||"").split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,"<br>")}</p>`).join("");
function showError(title,text){if(container)container.innerHTML=`<div class="article-error"><h1>${esc(title)}</h1><p>${esc(text)}</p><p><a class="article-back" href="index.html">Return to Paw Prints Weekly</a></p></div>`}
function injectTools(id){
 const wrap=document.createElement("div");wrap.className="ppw-tool-card ppw-article-tools";wrap.innerHTML=`<span class="eyebrow">ARTICLE TOOLS</span><div class="ppw-tool-buttons"><button type="button" class="small-button" id="copyArticleLink">Copy article link</button><button type="button" class="small-button secondary-button" id="shareArticle">Share article</button></div><div class="tool-result" id="articleToolMessage" aria-live="polite"></div>`;container.appendChild(wrap);
 const result=wrap.querySelector("#articleToolMessage"),url=location.href;
 wrap.querySelector("#copyArticleLink")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(url);result.textContent="Article link copied."}catch(e){const area=document.createElement("textarea");area.value=url;area.setAttribute("readonly","");area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();try{document.execCommand("copy");result.textContent="Article link copied."}catch(err){result.textContent="Copy is not available on this browser."}area.remove()}});
 wrap.querySelector("#shareArticle")?.addEventListener("click",async()=>{if(navigator.share){try{await navigator.share({title:document.title,url})}catch(e){}}else{try{await navigator.clipboard.writeText(url);result.textContent="Link copied — you can paste it anywhere."}catch(e){result.textContent="Sharing is not available on this browser."}}});
 const reactionKey=`ppw-reaction-${id}`,saved=localStorage.getItem(reactionKey),choices=["Helpful","Interesting","Made me smile"],reaction=document.createElement("div");reaction.className="ppw-tool-card ppw-reaction-card";reaction.innerHTML=`<span class="eyebrow">ARTICLE REACTION</span><h3>What did you think?</h3><div class="tool-options">${choices.map(x=>`<button type="button" class="tool-option" data-reaction="${esc(x)}">${esc(x)}</button>`).join("")}</div><div class="tool-result">${saved?`You chose “${esc(saved)}” on this device.`:"Your reaction stays private on this device."}</div>`;container.appendChild(reaction);
 reaction.querySelectorAll("[data-reaction]").forEach(b=>b.addEventListener("click",()=>{try{localStorage.setItem(reactionKey,b.dataset.reaction)}catch(e){}reaction.querySelectorAll("[data-reaction]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");reaction.querySelector(".tool-result").textContent=`Thanks! You chose “${b.dataset.reaction}”.`}));if(saved)reaction.querySelector(`[data-reaction="${CSS.escape(saved)}"]`)?.classList.add("selected");
}
function addProgress(){const bar=document.createElement("div");bar.className="ppw-reading-progress";bar.setAttribute("aria-hidden","true");document.body.appendChild(bar);const update=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=`${max>0?Math.min(100,Math.max(0,window.scrollY/max*100)):0}%`};window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);update()}
async function load(){
 if(!container)return;
 if(!slug){showError("Article not found","No article was selected.");return}
 try{
  const {data,error}=await db.from("articles").select("*").eq("slug",slug).eq("status","published").maybeSingle();
  if(error)throw error;
  if(!data){showError("Article not found","This article may have been removed or is not published.");return}
  document.title=`${data.title} | Paw Prints Weekly`;
  let gallery=[];
  try{const r=await db.from("article_images").select("*").eq("article_id",data.id).order("sort_order",{ascending:true});if(!r.error)gallery=r.data||[]}catch(e){console.warn("Article gallery unavailable:",e)}
  const cover=data.image_url?`<img class="article-hero-image" src="${esc(data.image_url)}" alt="${esc(data.title)}">`:"";
  const galleryHtml=gallery.length?`<div class="article-gallery" aria-label="Article photo gallery">${gallery.map((g,i)=>`<figure><img src="${esc(g.image_url)}" alt="${esc(g.alt_text||data.title)}" loading="lazy"><figcaption>${i+1} / ${gallery.length}</figcaption></figure>`).join("")}</div>`:"";
  const date=data.published_at?new Date(data.published_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"";
  container.innerHTML=`<span class="category">${esc(data.category).toUpperCase()}</span><h1>${esc(data.title)}</h1><div class="article-byline">By ${esc(data.author||"PPW Staff")} · ${esc(date)}</div>${cover}<div class="article-body">${bodyHtml(data.content)}</div>${galleryHtml}`;
  addProgress();injectTools(data.id);
 }catch(error){console.error("PPW article load failed:",error);showError("We couldn't load this article","Please refresh the page. If the problem continues, the newsroom database may be temporarily unavailable.")}
}
load();
})();
