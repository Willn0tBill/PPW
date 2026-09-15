(function(){
  'use strict';
  const KEY='ppw-theme';
  const TRANSITION_MS=700;
  const TOGGLE_SELECTORS='[data-theme-toggle],#darkModeToggle,.dark-mode-toggle,#ppwPageThemeToggle';

  function getTheme(){
    try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return 'light'}
  }

  function setTheme(theme,animate,event){
    const dark=theme==='dark';
    const root=document.documentElement;
    const body=document.body;
    if(!root)return;

    if(animate){
      let x='50%',y='50%';
      if(event && typeof event.clientX==='number' && typeof event.clientY==='number'){
        x=event.clientX+'px'; y=event.clientY+'px';
      }else if(event && event.currentTarget && event.currentTarget.getBoundingClientRect){
        const r=event.currentTarget.getBoundingClientRect();
        x=(r.left+r.width/2)+'px'; y=(r.top+r.height/2)+'px';
      }
      root.style.setProperty('--theme-x',x);
      root.style.setProperty('--theme-y',y);
      root.classList.remove('theme-transition-dark','theme-transition-light');
      void root.offsetWidth;
      root.classList.add(dark?'theme-transition-dark':'theme-transition-light');
      window.setTimeout(function(){root.classList.remove('theme-transition-dark','theme-transition-light')},TRANSITION_MS);
    }

    root.classList.toggle('dark-mode',dark);
    root.classList.toggle('light-mode',!dark);
    if(body){body.classList.toggle('dark-mode',dark);body.classList.toggle('light-mode',!dark)}

    document.querySelectorAll(TOGGLE_SELECTORS).forEach(function(btn){
      btn.textContent=dark?'☀ Light Mode':'☾ Dark Mode';
      btn.setAttribute('aria-pressed',dark?'true':'false');
      btn.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
      btn.title=dark?'Switch to light mode':'Switch to dark mode';
    });
  }

  function bind(btn){
    if(!btn || btn.dataset.ppwThemeBound==='1')return;
    btn.dataset.ppwThemeBound='1';
    btn.addEventListener('click',function(event){
      const next=document.documentElement.classList.contains('dark-mode')?'light':'dark';
      try{localStorage.setItem(KEY,next)}catch(e){}
      setTheme(next,true,event);
    });
  }

  function init(){
    setTheme(getTheme(),false);
    let buttons=[...document.querySelectorAll(TOGGLE_SELECTORS)];
    if(!buttons.length){
      const btn=document.createElement('button');
      btn.id='ppwPageThemeToggle';
      btn.className='ppw-page-theme-toggle';
      btn.type='button';
      btn.setAttribute('aria-pressed','false');
      document.body.appendChild(btn);
      buttons=[btn];
    }
    buttons.forEach(bind);
    setTheme(getTheme(),false);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
