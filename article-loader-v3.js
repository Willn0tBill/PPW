(()=>{
'use strict';
const SUPABASE_URL='https://qyipadinsphoyxotrceo.supabase.co';
const SUPABASE_KEY='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
const root=document.getElementById('articleContent');
const slug=new URLSearchParams(window.location.search).get('slug');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fail=(title,msg)=>{if(root)root.innerHTML=`<div class="article-error"><h1>${esc(title)}</h1><p>${esc(msg)}</p><p><a class="article-back" href="index.html">Return to Paw Prints Weekly</a></p></div>`};
function textHtml(v){
 const text=String(v||'').replace(/\r\n?/g,'\n');
 return text.split(/\n\s*\n/).map(block=>{
  const trimmed=block.trim();if(!trimmed)return '';
  if(/^\[\[\s*spacer\s*\]\]$/i.test(trimmed)||/^\[\s*spacer\s*\]$/i.test(trimmed)||/^<!--\s*spacer\s*-->$/i.test(trimmed))return '<div class="article-spacer" aria-hidden="true"></div>';
  return `<p>${esc(trimmed).replace(/\n/g,'<br>')}</p>`;
 }).join('');
}
function creditHtml(value){const c=String(value||'').trim();return c?`<figcaption class="article-photo-credit">Photo credit: ${esc(c)}</figcaption>`:''}
function inlineFigure(item,articleTitle,marker){if(!item?.image_url)return '';return `<figure class="article-inline-image" data-photo-marker="${marker}"><img src="${esc(item.image_url)}" alt="${esc(item.alt_text||`${articleTitle} photo ${marker}`)}" loading="lazy">${creditHtml(item.credit)}</figure>`}
function renderBody(content,gallery,articleTitle){
 const used=new Set(),byMarker=new Map(gallery.map(x=>[Number(x.sort_order)+1,x]));
 const text=String(content||'').replace(/\r\n?/g,'\n');
 const re=/\[\[\s*image\s*:\s*(\d+)\s*\]\]/gi;
 let html='',last=0,m;
 while((m=re.exec(text))){
  html+=textHtml(text.slice(last,m.index));
  const marker=Number(m[1]),item=byMarker.get(marker);
  if(item){used.add(marker);html+=inlineFigure(item,articleTitle,marker)}
  else html+=`<div class="article-missing-photo" aria-label="Missing article photo">Article photo ${marker} is unavailable.</div>`;
  last=re.lastIndex;
 }
 html+=textHtml(text.slice(last));
 return {html,used};
}
async function getArticle(){
 if(!root)return;if(!slug){fail('Article not found','No article was selected.');return}
 try{
  const params=new URLSearchParams({select:'id,title,slug,excerpt,content,category,author,image_url,image_credit,published_at,status',slug:`eq.${slug}`,status:'eq.published',limit:'1'});
  const r=await fetch(`${SUPABASE_URL}/rest/v1/articles?${params}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,Accept:'application/json'}});
  if(!r.ok)throw new Error(`Articles request failed: ${r.status}`);
  const rows=await r.json(),article=Array.isArray(rows)?rows[0]:null;
  if(!article){fail('Article not found','This article may have been removed or is not published.');return}
  document.title=`${article.title} | Paw Prints Weekly`;
  const date=article.published_at?new Date(article.published_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'';
  const time=article.published_at?new Date(article.published_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'';
  let gallery=[];
  try{
   const gp=new URLSearchParams({select:'id,image_url,sort_order,alt_text,credit',article_id:`eq.${article.id}`,order:'sort_order.asc'});
   const gr=await fetch(`${SUPABASE_URL}/rest/v1/article_images?${gp}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,Accept:'application/json'}});
   if(gr.ok)gallery=await gr.json();
  }catch(e){console.warn('PPW gallery load failed:',e)}
  const cover=article.image_url?`<figure class="article-hero-wrap"><img class="article-hero-image" src="${esc(article.image_url)}" alt="${esc(article.title)}">${creditHtml(article.image_credit)}</figure>`:'';
  const body=renderBody(article.content,gallery,article.title);
  const unused=gallery.filter(x=>x?.image_url&&!body.used.has(Number(x.sort_order)+1));
  const galleryHtml=unused.map(x=>{const marker=Number(x.sort_order)+1;return `<figure class="article-gallery-item"><img src="${esc(x.image_url)}" alt="${esc(x.alt_text||`${article.title} photo ${marker}`)}" loading="lazy">${creditHtml(x.credit)||`<figcaption>Photo ${marker}</figcaption>`}</figure>`}).join('');
  root.innerHTML=`${cover}<div class="article-header"><span class="category">${esc(article.category||'PPW').toUpperCase()}</span><h1>${esc(article.title)}</h1><div class="article-byline"><span>By ${esc(article.author||'PPW Staff')}</span>${date?`<span>${esc(date)}</span>`:''}${time?`<span>${esc(time)}</span>`:''}</div></div><div class="article-body">${body.html}</div>${galleryHtml?`<div class="article-gallery" aria-label="Additional article photos">${galleryHtml}</div>`:''}<div class="ppw-article-nav"><a href="index.html#latest">← Latest stories</a><a href="index.html">Home</a></div>`;
 }catch(err){console.error('PPW article loader failed:',err);fail("We couldn't load this article",'Please refresh the page. If the problem continues, the newsroom database may be temporarily unavailable.')}
}
getArticle();
})();
