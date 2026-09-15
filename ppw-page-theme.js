(function(){
  const KEY='ppw-theme';
  const TRANSITION_MS=650;

  function getTheme(){
    try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return 'light'}
  }

  function apply(theme,animate){
    const dark=theme==='dark';
    const root=document.documentElement;
    const body=document.body;
    if(animate && root){
      root.classList.remove('theme-transition-dark','theme-transition-light');
      void root.offsetWidth;
      root.classList.add(dark?'theme-transition-dark':'theme-transition-light');
      window.setTimeout(()=>root.classList.remove('theme-transition-dark','theme-transition-light'),TRANSITION_MS);
    }
    root.classList.toggle('dark-mode',dark);
    root.classList.toggle('light-mode',!dark);
    if(body){body.classList.toggle('dark-mode',dark);body.classList.toggle('light-mode',!dark)}
    const btn=document.getElementById('ppwPageThemeToggle');
    if(btn){
      btn.textContent=dark?'☀ Light Mode':'☾ Dark Mode';
      btn.setAttribute('aria-pressed',dark?'true':'false');
      btn.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
    }
  }

  function init(){
    const saved=getTheme();
    apply(saved,false);
    let btn=document.getElementById('ppwPageThemeToggle');
    if(!btn){
      btn=document.createElement('button');
      btn.id='ppwPageThemeToggle';
      btn.className='ppw-page-theme-toggle';
      btn.type='button';
      document.body.appendChild(btn);
    }
    btn.onclick=function(){
      const next=document.documentElement.classList.contains('dark-mode')?'light':'dark';
      try{localStorage.setItem(KEY,next)}catch(e){}
      apply(next,true);
    };
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
