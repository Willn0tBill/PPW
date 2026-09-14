(()=>{
const SUPABASE_URL="https://qyipadinsphoyxotrceo.supabase.co";
const SUPABASE_KEY="sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt";
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
const date=v=>v?new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase():"";
function addRevealObserver(){const root=document.querySelector("#featuredArticle, #staffGrid");if(!root)return;const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove("visible");void e.target.offsetWidth;e.target.classList.add("visible")}else e.target.classList.remove("visible")}),{threshold:.08});root.querySelectorAll(".reveal").forEach(el=>observer.observe(el))}
async function renderFeatured(){
 const host=document.getElementById("featuredArticle"); if(!host)return;
 const {data,error}=await db.from("articles").select("id,title,slug,excerpt,category,author,image_url,published_at,featured").eq("status","published").order("published_at",{ascending:false}).limit(12);
 if(error||!data?.length){return}
 const lead=data.find(a=>a.featured)||data[0];
 const second=data.find(a=>a.id!==lead.id)||null;
 const items=[lead,second].filter(Boolean);
 host.classList.add("dual-featured");
 host.innerHTML=items.map((a,i)=>`<article class="featured-card featured-card-${i+1} reveal"><a href="article.html?slug=${encodeURIComponent(a.slug)}">${a.image_url?`<img class="story-image" src="${esc(a.image_url)}" alt="${esc(a.title)}" loading="lazy">`:`<div class="story-placeholder">${esc(a.category).toUpperCase()}</div>`}<div class="story-body"><div class="featured-badge">${i===0?"EDITOR'S LEAD":"ALSO FEATURED"}</div><span class="category-pill">${esc(a.category).toUpperCase()}</span><h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"Read this story from Paw Prints Weekly.")}</p><div class="meta"><span>${esc((a.author||"PPW Staff").toUpperCase())}</span><span>${date(a.published_at)}</span></div></div></a></article>`).join("");
 addRevealObserver();
}
async function renderStaff(){
 const host=document.getElementById("staffGrid"); if(!host)return;
 const {data,error}=await db.from("staff_members").select("id,name,role,bio,sort_order").eq("active",true).order("sort_order",{ascending:true});
 if(error){host.innerHTML='<div class="empty-card">The newsroom staff list is temporarily unavailable.</div>';return}
 if(!data?.length){host.innerHTML='<div class="empty-card">Staff information will appear here soon.</div>';return}
 host.innerHTML=data.map(s=>`<article class="staff-card reveal"><div class="staff-initial">${esc((s.name||"PPW").trim().charAt(0).toUpperCase())}</div><div><span class="staff-role">${esc(s.role||"Staff Member")}</span><h3>${esc(s.name)}</h3>${s.bio?`<p>${esc(s.bio)}</p>`:""}</div></article>`).join("");
 addRevealObserver();
}
function start(){renderFeatured();renderStaff();document.querySelectorAll('a[href="admin.html"]').forEach(a=>a.href="admin/");}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
