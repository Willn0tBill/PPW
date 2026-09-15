(()=>{
'use strict';
const SUPABASE_URL='https://qyipadinsphoyxotrceo.supabase.co';
const SUPABASE_KEY='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
const root=document.getElementById('articleContent');
const slug=new URLSearchParams(window.location.search).get('slug');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const paragraphs=v=>String(v||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(x=>`<p>${esc(x).replace(/\n/g,'<br>')}</p>`).join('');
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
  const cover=article.image_url?`<img class="article-hero-image" src="${esc(article.image_url)}" alt="${esc(article.title)}">`:'';
  root.innerHTML=`<span class="category">${esc(article.category||'PPW').toUpperCase()}</span><h1>${esc(article.title)}</h1><div class="article-byline">By ${esc(article.author||'PPW Staff')}${date?` · ${esc(date)}`:''}</div>${cover}<div class="article-body">${paragraphs(article.content)}</div><div class="ppw-article-nav"><a href="index.html#latest">← Latest stories</a><a href="index.html">Home</a></div>`;
 }catch(err){console.error('PPW article loader failed:',err);fail("We couldn't load this article",'Please refresh the page. If the problem continues, the newsroom database may be temporarily unavailable.')}
}
getArticle();
})();
