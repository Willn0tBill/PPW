(()=>{
'use strict';
const U='https://qyipadinsphoyxotrceo.supabase.co',K='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
const db=supabase.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const msg=(t,type='')=>{const e=$('articleMessage');if(e){e.textContent=t;e.className='message '+type}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let saving=false,currentGallery=[];
function slugify(v){return String(v||'').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,90)}
function marker(sort){return Number(sort)+1}
function nextSort(rows){return rows.length?Math.max(...rows.map(x=>Number(x.sort_order)||0))+1:0}
async function gallery(id){const r=await db.from('article_images').select('*').eq('article_id',id).order('sort_order');if(r.error)throw r.error;return r.data||[]}
async function upload(file){
 if(file.size>6*1024*1024)throw new Error(`${file.name} is larger than 6 MB.`);
 if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error(`${file.name} is not a supported image type.`);
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase(),safe=['jpg','jpeg','png','webp','gif'].includes(ext)?ext:'jpg';
 const path=`articles/${crypto.randomUUID?.()||Date.now()+Math.random().toString(36).slice(2)}.${safe}`;
 const r=await db.storage.from('article-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(r.error)throw r.error;
 return db.storage.from('article-images').getPublicUrl(r.data.path).data.publicUrl;
}
function ensureCoverCredit(){
 if($('coverCredit'))return;
 const photos=$('imageFile')?.closest('label');if(!photos)return;
 const label=document.createElement('label');label.className='full';label.innerHTML='Cover Photo Credit<input id="coverCredit" type="text" maxlength="180" placeholder="Photo by Jane Smith / AP / School yearbook"><span class="help">Optional. This appears directly under the cover photo.</span>';
 photos.after(label);
}
function insertMarker(n){
 const a=$('content');if(!a)return;const token=`[[image:${n}]]`,before=a.value.slice(0,a.selectionStart),after=a.value.slice(a.selectionEnd),p=before&&!before.endsWith('\n\n')?(before.endsWith('\n')?'\n':'\n\n'):'',s=after&&!after.startsWith('\n\n')?(after.startsWith('\n')?'\n':'\n\n'):'';
 a.value=before+p+token+s+after;const pos=(before+p+token+s).length;a.focus();a.setSelectionRange(pos,pos);a.dispatchEvent(new Event('input',{bubbles:true}));msg(`Inserted article photo ${n} at the cursor.`,'success');
}
function enhanceSelected(){
 const files=[...($('imageFile')?.files||[])],root=$('imagePreviewGrid');if(!root||!files.length)return;
 const base=nextSort(currentGallery),cards=[...root.querySelectorAll('.image-preview-card')];
 cards.forEach((card,i)=>{if(i===0){if(!card.querySelector('small'))card.insertAdjacentHTML('beforeend','<small>Cover photo · use the Cover Photo Credit field below.</small>');return}const n=marker(base+i-1);card.classList.add('ppw-media-card');if(!card.querySelector('[data-insert-marker]'))card.insertAdjacentHTML('beforeend',`<button type="button" class="small-btn" data-insert-marker="${n}">Insert in article</button><label class="photo-credit-label">Photo credit<input type="text" maxlength="180" data-new-credit="${i}" placeholder="Photo by..."></label><small>Inserts [[image:${n}]] where your cursor is.</small>`)});
}
function renderCurrentGallery(title){
 const root=$('currentGallery');if(!root)return;
 root.innerHTML=currentGallery.map(x=>{const n=marker(x.sort_order);return `<div class="image-preview-card ppw-media-card"><img src="${esc(x.image_url)}" alt="${esc(x.alt_text||title||'Article photo')}"><span>Article photo ${n}</span><button type="button" class="small-btn" data-insert-marker="${n}">Insert in article</button><label class="photo-credit-label">Photo credit<input type="text" maxlength="180" value="${esc(x.credit||'')}" data-gallery-credit="${x.id}"></label><button type="button" class="small-btn danger" data-gallery-delete-x="${x.id}" data-marker="${n}">Remove</button></div>`}).join('');
 $('currentGalleryWrap')?.classList.toggle('hidden',!currentGallery.length);
}
async function syncEditMedia(expectedId=0){
 let id=0;
 for(let attempt=0;attempt<25;attempt++){
  id=Number($('articleId')?.value||0);
  if(id&&(!expectedId||id===expectedId))break;
  await wait(100);
 }
 if(!id||expectedId&&id!==expectedId)return;
 const a=await db.from('articles').select('title,image_credit').eq('id',id).single();if(!a.error&&$('coverCredit'))$('coverCredit').value=a.data?.image_credit||'';
 try{currentGallery=await gallery(id);renderCurrentGallery(a.data?.title||'')}catch(e){console.warn('PPW media gallery load failed',e)}
}
function clearForm(){
 $('articleForm')?.reset();if($('articleId'))$('articleId').value='';if($('author'))$('author').value='PPW Staff';if($('publishNow'))$('publishNow').checked=true;if($('coverCredit'))$('coverCredit').value='';if($('currentGallery'))$('currentGallery').innerHTML='';$('currentGalleryWrap')?.classList.add('hidden');if($('imagePreviewGrid'))$('imagePreviewGrid').innerHTML='';currentGallery=[];
}
async function save(status){
 if(saving)return;saving=true;msg('Saving...');
 try{
  const s=await db.auth.getSession();const session=s.data?.session;if(!session)throw new Error('Please sign in again.');
  const roleResult=await db.from('admin_roles').select('role').eq('user_id',session.user.id).maybeSingle();const role=roleResult.data?.role;if(!role)throw new Error('Your newsroom access could not be verified.');
  const id=Number($('articleId')?.value||0);let old=null;if(id){const q=await db.from('articles').select('*').eq('id',id).single();if(q.error)throw q.error;old=q.data;if(role!=='owner'&&old.author_user_id!==session.user.id)throw new Error('You can only edit your own articles.')}
  const title=$('title').value.trim(),content=$('content').value.trim();if(!title||!content)throw new Error('Please enter both a headline and the article text.');
  const raw=$('ppwSchedule')?.value||'',schedule=raw?new Date(raw):null;if(schedule&&schedule<=new Date())throw new Error('Scheduled publication must be in the future.');
  const files=[...($('imageFile')?.files||[])];let cover=old?.image_url||null;if(files[0])cover=await upload(files[0]);
  const actual=schedule?'scheduled':status,tags=String($('ppwTags')?.value||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).slice(0,12);
  const data={title,slug:old&&old.title===title?old.slug:slugify(title),excerpt:$('excerpt').value.trim(),content,category:$('category').value,author:$('author').value.trim()||'PPW Staff',author_user_id:old?.author_user_id||session.user.id,image_url:cover,image_credit:$('coverCredit')?.value.trim()||null,published_at:actual==='published'?($('publishedAt').value?new Date($('publishedAt').value).toISOString():new Date().toISOString()):null,scheduled_at:actual==='scheduled'?schedule.toISOString():null,status:actual,tags,updated_at:new Date().toISOString()};
  const q=id?await db.from('articles').update(data).eq('id',id):await db.from('articles').insert(data).select('id').single();if(q.error)throw q.error;const articleId=id||q.data.id;
  const oldGallery=id?await gallery(articleId):[],base=nextSort(oldGallery),rows=[];
  for(let i=1;i<files.length;i++)rows.push({article_id:articleId,image_url:await upload(files[i]),sort_order:base+i-1,alt_text:title,credit:document.querySelector(`[data-new-credit="${i}"]`)?.value.trim()||null});
  if(rows.length){const g=await db.from('article_images').insert(rows);if(g.error)throw g.error}
  if(actual==='published'&&role==='owner'){await db.from('articles').update({featured:false}).neq('id',articleId);await db.from('articles').update({featured:true}).eq('id',articleId)}
  localStorage.removeItem('ppw-admin-draft-v4');clearForm();$('cancelEditBtn')?.classList.add('hidden');if($('editorHeading'))$('editorHeading').textContent='Create Article';$('refreshBtn')?.click();msg(actual==='scheduled'?'Story scheduled successfully.':actual==='draft'?'Draft saved successfully.':'Article published successfully.','success');
 }catch(e){console.error('PPW media save failed',e);msg(e.message||'Could not save article.','error')}finally{saving=false}
}
function init(){
 ensureCoverCredit();
 const form=$('articleForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();save($('publishNow')?.checked?'published':'draft')},true);
 document.addEventListener('click',e=>{
  const draft=e.target.closest('#saveDraftBtn');if(draft){e.preventDefault();e.stopImmediatePropagation();save('draft');return}
  const ins=e.target.closest('[data-insert-marker]');if(ins){e.preventDefault();insertMarker(Number(ins.dataset.insertMarker));return}
  const edit=e.target.closest('[data-action="edit"]');if(edit)syncEditMedia(Number(edit.dataset.id));
  const del=e.target.closest('[data-gallery-delete-x]');if(del){e.preventDefault();e.stopImmediatePropagation();(async()=>{if(!confirm('Remove this article photo?'))return;const n=Number(del.dataset.marker),r=await db.from('article_images').delete().eq('id',Number(del.dataset.galleryDeleteX));if(r.error)return msg(r.error.message,'error');const a=$('content');if(a)a.value=a.value.replace(new RegExp(`\\n{0,2}\\[\\[\\s*image\\s*:\\s*${n}\\s*\\]\\]\\n{0,2}`,'ig'),'\n\n').replace(/\n{3,}/g,'\n\n').trim();currentGallery=currentGallery.filter(x=>x.id!==Number(del.dataset.galleryDeleteX));renderCurrentGallery($('title')?.value||'');enhanceSelected();msg(`Article photo ${n} removed.`,'success')})()}
 },true);
 $('imageFile')?.addEventListener('change',()=>setTimeout(enhanceSelected,0));
 $('currentGallery')?.addEventListener('change',async e=>{const x=e.target.closest('[data-gallery-credit]');if(!x)return;const r=await db.from('article_images').update({credit:x.value.trim()||null}).eq('id',Number(x.dataset.galleryCredit));msg(r.error?r.error.message:'Photo credit saved.',r.error?'error':'success')});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
