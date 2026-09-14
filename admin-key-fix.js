// PPW Supabase client compatibility fix.
// Force the verified publishable key for the PPW project before admin.js creates its client.
(()=>{
  const projectUrl='https://qyipadinsphoyxotrceo.supabase.co';
  const correctKey='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
  const patch=()=>{
    if(!window.supabase || typeof window.supabase.createClient!=='function') return false;
    if(window.supabase.__ppwKeyFixV2) return true;
    const original=window.supabase.createClient.bind(window.supabase);
    window.supabase.createClient=(url,key,options)=>{
      if(String(url||'').replace(/\/$/,'')===projectUrl) key=correctKey;
      return original(url,key,options);
    };
    window.supabase.__ppwKeyFixV2=true;
    return true;
  };
  if(!patch()){
    let tries=0;
    const timer=setInterval(()=>{
      if(patch()||++tries>100) clearInterval(timer);
    },25);
  }
})();
