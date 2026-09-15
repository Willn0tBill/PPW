(function(){
  const KEY='ppw-theme';
  function apply(theme){
    const dark=theme==='dark';
    document.documentElement.classList.toggle('dark-mode',dark);
    if(document.body) document.body.classList.toggle('dark-mode',dark);
    const btn=document.getElementById('ppwPageThemeToggle');
    if(btn){btn.textContent=dark?'☀ Light Mode':'☾ Dark Mode';btn.setAttribute('aria-pressed',dark?'true':'false');}
  }
  function init(){
    const saved=localStorage.getItem(KEY);
    apply(saved==='dark'?'dark':'light');
    let btn=document.getElementById('ppwPageThemeToggle');
    if(!btn){
      btn=document.createElement('button');
      btn.id='ppwPageThemeToggle';
      btn.className='ppw-page-theme-toggle';
      btn.type='button';
      btn.setAttribute('aria-label','Toggle dark mode');
      document.body.appendChild(btn);
    }
    btn.onclick=function(){
      const next=document.documentElement.classList.contains('dark-mode')?'light':'dark';
      localStorage.setItem(KEY,next);
      apply(next);
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
