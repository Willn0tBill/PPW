// PPW Supabase client compatibility fix.
// The published admin.js contains an older, mistyped publishable key.
// Correct the key before admin.js creates its Supabase client.
(()=>{
  if(!window.supabase || typeof window.supabase.createClient !== 'function') return;
  const originalCreateClient=window.supabase.createClient.bind(window.supabase);
  const correctKey='sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt';
  window.supabase.createClient=(url,key,options)=>{
    if(typeof key==='string' && key.includes('S73dZK9ro03lWDbHFzZhw_5t5pDtGt')) key=correctKey;
    return originalCreateClient(url,key,options);
  };
})();
