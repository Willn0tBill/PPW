(()=>{
'use strict';
const URL='https://qyipadinsphoyxotrceo.supabase.co';
const KEY='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const form=document.getElementById('loginForm');
if(!form)return;
let busy=false;
form.addEventListener('submit',async e=>{
  if(busy)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();busy=true;
  const button=form.querySelector('button[type="submit"]'),message=document.getElementById('loginMessage');
  if(button)button.disabled=true;
  if(message){message.textContent='Signing in...';message.className='message'}
  try{
    const email=(document.getElementById('loginEmail')?.value||'').trim().toLowerCase();
    const password=document.getElementById('loginPassword')?.value||'';
    const {data,error}=await db.auth.signInWithPassword({email,password});
    if(error)throw error;
    const session=data?.session;
    if(!session?.user)throw new Error('Sign-in succeeded, but no session was returned.');
    const roleResult=await db.from('admin_roles').select('role').eq('user_id',session.user.id).maybeSingle();
    if(roleResult.error)throw roleResult.error;
    if(!roleResult.data?.role)throw new Error('This account is not assigned to the PPW newsroom.');
    const login=document.getElementById('loginView'),admin=document.getElementById('adminView');
    login?.classList.add('hidden');admin?.classList.remove('hidden');
    const badge=document.getElementById('roleBadge');if(badge)badge.innerHTML=`<span>${roleResult.data.role==='owner'?'OWNER':'PUBLISHER'}</span><small>${String(session.user.email||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}</small>`;
    const notice=document.getElementById('permissionNotice');if(notice)notice.textContent=roleResult.data.role==='owner'?'Owner access: full newsroom control.':'Publisher access: you can create articles and edit only your own articles.';
    document.getElementById('refreshBtn')?.click();
  }catch(err){console.error('PPW login fix:',err);if(message){message.textContent=err?.message||'Unable to sign in.';message.className='message error'}}
  finally{busy=false;if(button)button.disabled=false}
},true);
})();