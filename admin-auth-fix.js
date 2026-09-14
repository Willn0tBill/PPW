(()=>{
'use strict';
const URL='https://qyipadinsphoyxotrceo.supabase.co';
const KEY='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
const authDb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
let working=false;

function setLogin(text='',type=''){
  const e=$('loginMessage');
  if(e){e.textContent=text;e.className='message '+type;}
}
function showAdmin(session,role){
  if(!session?.user)return false;
  $('loginView')?.classList.add('hidden');
  $('adminView')?.classList.remove('hidden');
  const badge=$('roleBadge');
  if(badge)badge.innerHTML=`<span>${role==='owner'?'OWNER':'PUBLISHER'}</span><small>${String(session.user.email||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]) )}</small>`;
  const notice=$('permissionNotice');
  if(notice)notice.textContent=role==='owner'?'Owner access: full newsroom control.':'Publisher access: you can create articles and edit only your own articles.';
  return true;
}
async function openForSession(s){
  if(!s?.user){$('loginView')?.classList.remove('hidden');$('adminView')?.classList.add('hidden');return false;}
  let role='publisher';
  try{
    const r=await authDb.from('admin_roles').select('role').eq('user_id',s.user.id).maybeSingle();
    if(r.error)throw r.error;
    if(r.data?.role)role=r.data.role;
  }catch(e){
    console.error('PPW auth-role check:',e);
    setLogin('You signed in, but PPW could not verify your newsroom role.','error');
    $('loginView')?.classList.remove('hidden');$('adminView')?.classList.add('hidden');
    return false;
  }
  showAdmin(s,role);
  setLogin('');
  try{ if(typeof window.setupFields==='function') window.setupFields(); }catch{}
  return true;
}

async function handleLogin(e){
  if(working)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const form=$('loginForm'),button=e.submitter||form?.querySelector('button[type="submit"]');
  working=true;if(button)button.disabled=true;setLogin('Signing in...');
  try{
    const email=$('loginEmail')?.value.trim().toLowerCase()||'';
    const password=$('loginPassword')?.value||'';
    const {data,error}=await authDb.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(!data?.session?.user)throw new Error('Supabase accepted the login but did not return a usable session.');
    await openForSession(data.session);
    form?.reset();
  }catch(err){
    console.error('PPW isolated sign-in failed:',err);
    setLogin(err?.message||'Unable to sign in.','error');
  }finally{working=false;if(button)button.disabled=false;}
}

const form=$('loginForm');
form?.addEventListener('submit',handleLogin,true);

authDb.auth.getSession().then(({data,error})=>{
  if(error){console.error('PPW isolated session check:',error);return;}
  if(data?.session)openForSession(data.session);
});

authDb.auth.onAuthStateChange((event,s)=>{
  if(event==='SIGNED_IN'&&s) setTimeout(()=>openForSession(s),50);
  if(event==='SIGNED_OUT'){
    $('loginView')?.classList.remove('hidden');
    $('adminView')?.classList.add('hidden');
  }
});
})();
