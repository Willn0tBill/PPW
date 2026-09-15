(()=>{
'use strict';
const SUPABASE_URL='https://qyipadinsphoyxotrceo.supabase.co';
const SUPABASE_KEY='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
const root=document.getElementById('articleContent');
const slug=new URLSearchParams(window.location.search).get('slug');
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
function paragraphs(v){
  const text=String(v||'').replace(/\r\n?/g,'\n');
  return text.split(/\n\s*\n/).map(block=>{
    const trimmed=block.trim();
    if(!trimmed)return '';
    if(/^\[\[\s*spacer\s*\]\]$/i.test(trimmed)||/^\[\s*spacer\s*\]$/i.test(trimmed)||/^<!--\s*spacer\s*-->$/i.test(trimmed))return '<div class="article-spacer" aria-hidden="true"></div>';
    return `<p>${esc(trimmed).replace(/\n/g,'<br>')}</p>`;
  }).join('');
}
const fail=(title,msg)=>{if(root)root.innerHTML=`<div class="article-error"><h1>${esc(title)}</h1><p>${esc(msg)}</p><p><a class="article-back" href="index.html">Return to Paw Prints Weekly</a></p></div>`};
async function getArticle(){
 if(!root)return;
 if(!slug){fail('Article not found','No article was selected.');return}
 try{
  const params=new URLSearchParams({select:'id,title,slug,excerpt,content,category,author,image_url,published_at,status',slug:`eq.${slug}`,status:'eq.published',limit:'1'});
  const r=await fetch(`${SUPABASE_URL}/rest/v1/articles?${params}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,Accept:'application/json'}});
  if(!r.ok)throw new Error(`Articles request failed: ${r.status}`);
  const rows=await r.json();
  const article=Array.isArray(rows)?rows[0]:null;
  if(!article){fail('Article not found','This article may have been removed or is not published.');return}
  document.title=`${article.title} | Paw Prints Weekly`;
  const date=article.published_at?new Date(article.published_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'';
  const time=article.published_at?new Date(article.published_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'';
  const cover=article.image_url?`<div class="article-hero-wrap"><img class="article-hero-image" src="${esc(article.image_url)}" alt="${esc(article.title)}"></div>`:'';
  let gallery=[];
  try{
    const gp=new URLSearchParams({select:'image_url,sort_order,alt_text',article_id:`eq.${article.id}`,order:'sort_order.asc'});
    const gr=await fetch(`${SUPABASE_URL}/rest/v1/article_images?${gp}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,Accept:'application/json'}});
    if(gr.ok)gallery=await gr.json();
  }catch(e){console.warn('PPW gallery load failed:',e)}
  const galleryHtml=gallery.filter(x=>x?.image_url).map((x,i)=>`<figure class="article-gallery-item"><img src="${esc(x.image_url)}" alt="${esc(x.alt_text||`${article.title} photo ${i+2}`)}"><figcaption>${gallery.length>1?`Photo ${i+2}`:''}</figcaption></figure>`).join('');
  root.innerHTML=`<span class="category">${esc(article.category||'PPW').toUpperCase()}</span><h1>${esc(article.title)}</h1><div class="article-byline"><span>By ${esc(article.author||'PPW Staff')}</span>${date?`<span>${esc(date)}</span>`:''}${time?`<span>${esc(time)}</span>`:''}</div>${cover}<div class="article-body">${paragraphs(article.content)}</div>${galleryHtml?`<div class="article-gallery" aria-label="Article photos">${galleryHtml}</div>`:''}<div class="ppw-article-nav"><a href="index.html#latest">← Latest stories</a><a href="index.html">Home</a></div>`;
 }catch(err){console.error('PPW article loader failed:',err);fail("We couldn't load this article",'Please refresh the page. If the problem continues, the newsroom database may be temporarily unavailable.')}
}
getArticle();
})();
