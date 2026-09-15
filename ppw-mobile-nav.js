(function(){
  'use strict';
  function init(){
    const header=document.querySelector('.site-header')||document.querySelector('.games-header');
    const button=document.querySelector('#menuToggle')||document.querySelector('.games-menu-toggle')||document.querySelector('.ppw-mobile-menu-toggle');
    const nav=document.querySelector('#mainNav')||header?.querySelector('nav');
    if(!header||!button||!nav)return;
    nav.id=nav.id||'ppw-mobile-navigation';
    button.setAttribute('aria-controls',nav.id);
    button.setAttribute('aria-expanded','false');
    function close(){header.classList.remove('ppw-mobile-nav-open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open navigation');}
    function toggle(){const open=!header.classList.contains('ppw-mobile-nav-open');header.classList.toggle('ppw-mobile-nav-open',open);button.setAttribute('aria-expanded',open?'true':'false');button.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
    if(button.dataset.ppwMobileBound==='1')return;
    button.dataset.ppwMobileBound='1';
    button.addEventListener('click',toggle);
    nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    window.addEventListener('resize',()=>{if(window.innerWidth>760)close()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
