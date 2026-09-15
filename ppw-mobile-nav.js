(function(){
  'use strict';

  function initMobileNav(){
    const header = document.querySelector('header');
    if(!header) return;

    let nav = header.querySelector('nav');
    if(!nav) return;

    let button = header.querySelector('.ppw-mobile-menu-toggle');
    if(!button){
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'ppw-mobile-menu-toggle';
      button.setAttribute('aria-label','Open navigation menu');
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-controls','ppw-mobile-navigation');
      button.innerHTML = '<span></span><span></span><span></span>';
      const navParent = nav.parentElement;
      navParent.insertBefore(button, nav);
    }

    nav.id = 'ppw-mobile-navigation';

    function closeMenu(){
      header.classList.remove('ppw-mobile-nav-open');
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-label','Open navigation menu');
    }

    function toggleMenu(){
      const open = header.classList.toggle('ppw-mobile-nav-open');
      button.setAttribute('aria-expanded',open ? 'true' : 'false');
      button.setAttribute('aria-label',open ? 'Close navigation menu' : 'Open navigation menu');
    }

    if(button.dataset.bound !== '1'){
      button.dataset.bound = '1';
      button.addEventListener('click',toggleMenu);
      document.addEventListener('keydown',function(event){
        if(event.key === 'Escape') closeMenu();
      });
      nav.addEventListener('click',function(event){
        const link = event.target.closest('a');
        if(link) closeMenu();
      });
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initMobileNav,{once:true});
  else initMobileNav();
})();
