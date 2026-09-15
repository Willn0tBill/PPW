(()=>{
'use strict';
const U='https://qyipadinsphoyxotrceo.supabase.co',K='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const url=a=>`article.html?slug=${encodeURIComponent(a.slug||'')}`;
const img=(a,cls='layout-image')=>a.image_url?`<img class="${cls}" src="${esc(a.image_url)}" alt="${esc(a.title||'')}" loading="lazy">`:`<div class="${cls}" aria-hidden="true"></div>`;
const meta=a=>`<div class="layout-meta"><span>${esc((a.author||'PPW Staff').toUpperCase())}</span><span>${a.published_at?esc(new Date(a.published_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}).toUpperCase()):''}</span></div>`;
const basic=(a)=>`<span class="layout-kicker">${esc(a.category||'PPW').toUpperCase()}</span><h3>${esc(a.title||'Untitled Article')}</h3><p>${esc(a.excerpt||'Read the latest story from Paw Prints Weekly.')}</p>${meta(a)}`;
async function load(){
 try{
  const r=await fetch(`${U}/rest/v1/articles?select=id,title,slug,excerpt,category,author,image_url,published_at,status,featured&status=eq.published&order=published_at.desc`,{headers:{apikey:K,Authorization:`Bearer ${K}`,Accept:'application/json'}});
  if(!r.ok)throw new Error(`HTTP ${r.status}`); const all=await r.json(); if(!Array.isArray(all))return;
  const by={};all.forEach(a=>{const k=String(a.category||'').trim().toLowerCase();(by[k]??=[]).push(a)});
  render('school-news',by['school news']||[],'school');
  render('student-life',by['student life']||[],'life');
  render('sports',by['sports']||[],'sports');
  render('perspectives',by['perspectives']||[],'perspectives');
  render('world-events',by['world events']||[],'world');
  render('features',by['features']||[],'features');
  render('entertainment-media',by['entertainment & media']||[],'media');
  render('editorial',by['editorial']||[],'editorial');
 }catch(e){console.warn('PPW category layouts could not load:',e)}
}
function empty(cat){return `<div class="empty-card">No ${cat.toLowerCase()} stories have been published yet.</div>`}
function render(section,items,type){const root=document.querySelector(`#${section} .category-content`);if(!root)return;if(!items.length){root.innerHTML=empty(section.replace(/-/g,' '));return}const rows=items.slice(0,6);
 if(type==='school')root.innerHTML=`<div class="school-list">${rows.map((a,i)=>`<article class="school-row"><a href="${url(a)}"><span class="num">${String(i+1).padStart(2,'0')}</span><div>${basic(a)}</div>${a.image_url?img(a,'school-thumb layout-image'):''}</a></article>`).join('')}</div>`;
 if(type==='life')root.innerHTML=`<div class="life-grid">${rows.slice(0,3).map((a,i)=>`<article class="life-card"><a class="layout-card" href="${url(a)}">${img(a)}<div class="life-copy">${basic(a)}</div></a></article>`).join('')}</div>`;
 if(type==='sports')root.innerHTML=`<div class="sports-grid">${rows.map(a=>`<a class="sports-card" href="${url(a)}">${img(a,'sports-thumb')}<div>${basic(a)}</div><span class="sports-arrow">→</span></a>`).join('')}</div>`;
 if(type==='perspectives')root.innerHTML=`<div class="perspective-grid">${rows.slice(0,4).map(a=>`<a class="perspective-card" href="${url(a)}">${basic(a)}</a>`).join('')}</div>`;
 if(type==='world')root.innerHTML=`<div class="world-grid">${rows.map(a=>`<a class="world-card layout-card" href="${url(a)}">${a.image_url?img(a):''}${basic(a)}</a>`).join('')}</div>`;
 if(type==='features')root.innerHTML=`<div class="features-grid">${rows.slice(0,4).map(a=>`<a class="feature-card" href="${url(a)}">${img(a)}<div class="story-body">${basic(a)}</div></a>`).join('')}</div>`;
 if(type==='media')root.innerHTML=`<div class="media-grid">${rows.slice(0,4).map(a=>`<a class="media-card" href="${url(a)}">${img(a)}<div class="story-body">${basic(a)}</div></a>`).join('')}</div>`;
 if(type==='editorial')root.innerHTML=`<div class="editorial-grid">${rows.slice(0,4).map(a=>`<a class="editorial-card" href="${url(a)}">${basic(a)}</a>`).join('')}</div>`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
