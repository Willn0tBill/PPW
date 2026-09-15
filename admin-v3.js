(()=>{
'use strict';

const SUPABASE_URL='https://qyipadinsphoyxotrceo.supabase.co';
const SUPABASE_KEY='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const message=(id,text,type='')=>{const e=$(id);if(e){e.textContent=text;e.className='message '+type}};

let session=null,role=null,editing=null,busy=false;

function slugify(value){return String(value||'').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,90)}
function localDate(value){if(!value)return '';const d=new Date(value);const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,16)}
function timeout(p,ms=10000){return Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error('The request timed out. Please check your connection and try again.')),ms))])}

function setView(loggedIn){$('loginView')?.classList.toggle('hidden',loggedIn);$('adminView')?.classList.toggle('hidden',!loggedIn)}

function setupFields(){
 const grid=document.querySelector('#articleForm .form-grid');
 if(!grid)return;
 if(!$('ppwTags')){const l=document.createElement('label');l.className='full';l.innerHTML='Topics / Tags<input id="ppwTags" maxlength="250" placeholder="sports, student life, campus"><span class="help">Separate tags with commas.</span>';grid.append(l)}
 if(!$('ppwSchedule')){const l=document.createElement('label');l.className='full';l.innerHTML='Schedule publication<input id="ppwSchedule" type="datetime-local"><span class="help">Leave blank to publish immediately.</span>';grid.append(l)}
 if(!$('ppwEditorTools')){const d=document.createElement('div');d.id='ppwEditorTools';d.className='ppw-admin-tools';d.innerHTML='<button id="ppwPreview" class="secondary-btn" type="button">Preview</button><span>Autosave is on</span>';document.querySelector('#articleForm .form-actions')?.before(d);$('ppwPreview').addEventListener('click',preview)}
}
function getTags(){return String($('ppwTags')?.value||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).slice(0,12)}
function resetForm(){
 $('articleForm')?.reset();editing=null;$('articleId').value='';$('author').value='PPW Staff';$('publishNow').checked=true;$('editorHeading').textContent='Create Article';$('cancelEditBtn').classList.add('hidden');$('currentImageWrap').classList.add('hidden');$('currentGalleryWrap').classList.add('hidden');$('currentGallery').innerHTML='';$('imagePreviewGrid').innerHTML='';if($('ppwTags'))$('ppwTags').value='';if($('ppwSchedule'))$('ppwSchedule').value='';message('articleMessage','')
}

async function getRole(s){
 if(!s?.user?.id)return null;
 const r=await timeout(db.from('admin_roles').select('role').eq('user_id',s.user.id).maybeSingle());
 if(r.error)throw r.error;
 return r.data?.role||null;
}

async function enter(s){
 session=s||null;role=null;
 if(!s){setView(false);return false}
 try{
  const r=await getRole(s);
  if(!r)throw new Error('This account is not assigned to the PPW newsroom.');
  role=r;setView(true);setupFields();
  $('roleBadge').innerHTML=`<span>${role==='owner'?'OWNER':'PUBLISHER'}</span><small>${esc(s.user.email||'')}</small>`;
  $('permissionNotice').textContent=role==='owner'?'Owner access: full newsroom control.':'Publisher access: create articles and edit only your own articles.';
  await loadArticles();
  return true;
 }catch(e){console.error('PPW admin access check failed:',e);session=null;role=null;setView(false);message('loginMessage',e.message||'Your account could not be verified.','error');return false}
}

async function restoreSession(){
 try{const r=await timeout(db.auth.getSession());if(r.error)throw r.error;await enter(r.data.session)}
 catch(e){console.error(e);setView(false);message('loginMessage',e.message||'Could not restore your session.','error')}
}

db.auth.onAuthStateChange((event,s)=>{
 if(event==='SIGNED_OUT'){session=null;role=null;setTimeout(()=>setView(false),0)}
});

$('loginForm')?.addEventListener('submit',async e=>{
 e.preventDefault();
 if(busy)return;
 busy=true;
 const button=e.submitter||$('loginForm').querySelector('button[type="submit"]');if(button)button.disabled=true;
 message('loginMessage','Signing in...');
 try{
  const email=$('loginEmail').value.trim().toLowerCase();const password=$('loginPassword').value;
  if(!email||!password)throw new Error('Please enter your email and password.');
  const r=await timeout(db.auth.signInWithPassword({email,password}),15000);
  if(r.error)throw r.error;
  if(!r.data?.session)throw new Error('Sign-in succeeded, but Supabase did not return a session.');
  if(await enter(r.data.session))$('loginForm').reset();
 }catch(e){console.error('PPW sign-in failed:',e);message('loginMessage',e.message||'Unable to sign in.','error')}
 finally{busy=false;if(button)button.disabled=false}
});

$('logoutBtn')?.addEventListener('click',async()=>{if(busy)return;try{await db.auth.signOut();resetForm()}catch(e){message('articleMessage',e.message||'Could not log out.','error')}});
$('cancelEditBtn')?.addEventListener('click',resetForm);
$('refreshBtn')?.addEventListener('click',()=>loadArticles());

$('togglePassword')?.addEventListener('click',()=>{const input=$('loginPassword');const button=$('togglePassword');const show=input.type==='password';input.type=show?'text':'password';button.classList.toggle('is-visible',show);button.setAttribute('aria-label',show?'Hide password':'Show password');button.setAttribute('aria-pressed',String(show))});

$('imageFile')?.addEventListener('change',()=>{
 const files=[...$('imageFile').files];
 $('imagePreviewGrid').innerHTML=files.map((f,i)=>`<div class="image-preview-card"><img src="${URL.createObjectURL(f)}" alt="Selected photo ${i+1}"><span>${i?'Gallery photo '+(i+1):'Cover photo'}</span></div>`).join('');
 if(files.length)message('articleMessage',`${files.length} photo${files.length===1?'':'s'} selected. The first is the cover.`)
});

async function upload(file){
 if(file.size>6*1024*1024)throw new Error(`${file.name} is larger than 6 MB.`);
 if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error(`${file.name} is not a supported image type.`);
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
 const path=`articles/${crypto.randomUUID?.()||Date.now()+Math.random().toString(36).slice(2)}.${['jpg','jpeg','png','webp','gif'].includes(ext)?ext:'jpg'}`;
 const r=await timeout(db.storage.from('article-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type}),15000);
 if(r.error)throw r.error;
 return db.storage.from('article-images').getPublicUrl(r.data.path).data.publicUrl;
}
async function gallery(id){const r=await timeout(db.from('article_images').select('*').eq('article_id',id).order('sort_order'));if(r.error)throw r.error;return r.data||[]}

async function loadArticles(){
 const list=$('articleList');if(!list||!session||!role)return;
 list.innerHTML='<div class="empty-state">Loading articles...</div>';
 try{
  const r=await timeout(db.from('articles').select('id,title,slug,category,author,published_at,created_at,status,featured,author_user_id,scheduled_at,image_url').order('created_at',{ascending:false}),12000);
  if(r.error)throw r.error;
  const visible=(r.data||[]).filter(a=>role==='owner'||a.author_user_id===session.user.id);
  list.innerHTML=visible.length?visible.map(a=>`<article class="article-item"><div class="article-item-content"><div class="article-item-top"><div><h3>${esc(a.title)}</h3><p>${esc(a.category)} · ${esc(a.author)} · ${a.status==='scheduled'?`Publishes ${new Date(a.scheduled_at).toLocaleString()}`:new Date(a.published_at||a.created_at).toLocaleString()}</p></div><div class="badges"><span class="badge ${esc(a.status)}">${esc(a.status).toUpperCase()}</span>${a.featured?'<span class="badge published">LEAD</span>':''}</div></div><div class="article-actions"><button class="small-btn" data-action="edit" data-id="${a.id}">Edit</button>${a.status==='published'?`<a class="small-btn" target="_blank" href="../article.html?slug=${encodeURIComponent(a.slug)}">View</a>`:''}${role==='owner'?`<button class="small-btn danger" data-action="delete" data-id="${a.id}">Delete</button>`:''}</div></div></article>`).join(''):'<div class="empty-state">No articles found.</div>';
 }catch(e){console.error(e);list.innerHTML=`<div class="empty-state">Unable to load articles.<br><small>${esc(e.message||'Please refresh and try again.')}</small></div>`}
}

$('articleList')?.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b)return;const id=Number(b.dataset.id);
 if(b.dataset.action==='edit')return editArticle(id);
 if(b.dataset.action==='delete'&&role==='owner'&&confirm('Delete this article?')){const r=await timeout(db.from('articles').delete().eq('id',id));if(r.error)message('articleMessage',r.error.message,'error');else await loadArticles()}
});

async function editArticle(id){
 try{
  const r=await timeout(db.from('articles').select('*').eq('id',id).single());if(r.error)throw r.error;
  const a=r.data;if(role!=='owner'&&a.author_user_id!==session?.user?.id)throw new Error('You can only edit your own articles.');
  editing=a;$('articleId').value=a.id;$('title').value=a.title||'';$('category').value=a.category||'School News';$('author').value=a.author||'PPW Staff';$('excerpt').value=a.excerpt||'';$('content').value=a.content||'';$('publishedAt').value=localDate(a.published_at);if($('ppwTags'))$('ppwTags').value=(a.tags||[]).join(', ');if($('ppwSchedule'))$('ppwSchedule').value=localDate(a.scheduled_at);$('editorHeading').textContent='Edit Article';$('cancelEditBtn').classList.remove('hidden');
  if(a.image_url){$('currentImage').src=a.image_url;$('currentImageWrap').classList.remove('hidden')}
  const g=await gallery(id);$('currentGallery').innerHTML=g.map((x,i)=>`<div class="image-preview-card"><img src="${esc(x.image_url)}" alt="${esc(x.alt_text||a.title)}"><span>Gallery photo ${i+1}</span><button type="button" class="small-btn danger" data-gallery-delete="${x.id}">Remove</button></div>`).join('');$('currentGalleryWrap').classList.toggle('hidden',!g.length);window.scrollTo({top:0,behavior:'smooth'});
 }catch(e){message('articleMessage',e.message||'Could not open that article.','error')}
}

$('currentGallery')?.addEventListener('click',async e=>{const b=e.target.closest('[data-gallery-delete]');if(!b||!editing)return;if(!confirm('Remove this gallery photo?'))return;const r=await timeout(db.from('article_images').delete().eq('id',Number(b.dataset.galleryDelete)));if(r.error)message('articleMessage',r.error.message,'error');else editArticle(editing.id)});

async function saveArticle(status){
 if(busy)throw new Error('Please wait for the current save to finish.');busy=true;
 try{
  const title=$('title').value.trim(),content=$('content').value.trim();if(!title||!content)throw new Error('Please enter both a headline and the article text.');
  const raw=$('ppwSchedule')?.value||'',schedule=raw?new Date(raw):null;if(schedule&&schedule<=new Date())throw new Error('Scheduled publication must be in the future.');
  const files=[...$('imageFile').files];let image=editing?.image_url||null;if(files[0])image=await upload(files[0]);
  const actual=schedule?'scheduled':status;
  const data={title,slug:editing&&editing.title===title?editing.slug:slugify(title),excerpt:$('excerpt').value.trim(),content,category:$('category').value,author:$('author').value.trim()||'PPW Staff',author_user_id:editing?.author_user_id||session.user.id,image_url:image,published_at:actual==='published'?($('publishedAt').value?new Date($('publishedAt').value).toISOString():new Date().toISOString()):null,scheduled_at:actual==='scheduled'?schedule.toISOString():null,status:actual,tags:getTags(),updated_at:new Date().toISOString()};
  const r=editing?await timeout(db.from('articles').update(data).eq('id',editing.id)):await timeout(db.from('articles').insert(data).select('id').single());if(r.error)throw r.error;const id=editing?editing.id:r.data.id;
  if(files.length>1){const old=await gallery(id);const rows=[];for(let i=1;i<files.length;i++)rows.push({article_id:id,image_url:await upload(files[i]),sort_order:old.length+i-1,alt_text:title});const g=await timeout(db.from('article_images').insert(rows));if(g.error)throw g.error}
  if(actual==='published'&&role==='owner'){await timeout(db.from('articles').update({featured:false}).neq('id',id));await timeout(db.from('articles').update({featured:true}).eq('id',id))}
  localStorage.removeItem('ppw-admin-draft-v4');return actual;
 }finally{busy=false}
}

$('articleForm')?.addEventListener('submit',async e=>{e.preventDefault();try{message('articleMessage','Saving...');const s=await saveArticle('published');resetForm();await loadArticles();message('articleMessage',s==='scheduled'?'Story scheduled successfully.':'Article published successfully.','success')}catch(e){console.error(e);message('articleMessage',e.message||'Could not save article.','error')}});
$('saveDraftBtn')?.addEventListener('click',async()=>{try{message('articleMessage','Saving draft...');await saveArticle('draft');resetForm();await loadArticles();message('articleMessage','Draft saved successfully.','success')}catch(e){message('articleMessage',e.message||'Could not save draft.','error')}});

function preview(){const w=window.open('','_blank');if(!w)return;w.document.write(`<title>${esc($('title').value||'PPW Preview')}</title><style>body{max-width:850px;margin:40px auto;padding:24px;font:18px/1.75 Georgia;color:#222}h1{font:900 46px Arial}</style><h1>${esc($('title').value||'Untitled')}</h1><p>By ${esc($('author').value||'PPW Staff')}</p><p>${esc($('excerpt').value)}</p><hr><div>${esc($('content').value).replace(/\n/g,'<br>')}</div>`);w.document.close()}

function autosave(){if(editing)return;const d={title:$('title').value,category:$('category').value,author:$('author').value,excerpt:$('excerpt').value,content:$('content').value,tags:$('ppwTags')?.value||'',schedule:$('ppwSchedule')?.value||'',savedAt:Date.now()};if(d.title||d.content)localStorage.setItem('ppw-admin-draft-v4',JSON.stringify(d))}
function restoreDraft(){try{const d=JSON.parse(localStorage.getItem('ppw-admin-draft-v4')||'null');if(!d||Date.now()-d.savedAt>604800000)return;$('title').value=d.title||'';$('category').value=d.category||'School News';$('author').value=d.author||'PPW Staff';$('excerpt').value=d.excerpt||'';$('content').value=d.content||'';if($('ppwTags'))$('ppwTags').value=d.tags||'';if($('ppwSchedule'))$('ppwSchedule').value=d.schedule||'';message('articleMessage','Recovered an unsaved local draft.','success')}catch{}}

function finishLoader(){const loader=$('ppwLoader');if(!loader)return;loader.classList.add('is-hidden');document.documentElement.classList.remove('ppw-loader-active');document.body.classList.remove('ppw-loading');document.body.classList.add('ppw-intro-done');setTimeout(()=>loader.remove(),700)}

document.addEventListener('DOMContentLoaded',()=>{setupFields();setInterval(autosave,5000);setTimeout(restoreDraft,500);setTimeout(finishLoader,2600);restoreSession()});
})();