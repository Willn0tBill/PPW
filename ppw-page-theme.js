(function(){
  'use strict';

  const STORAGE_KEY = 'ppw-theme';
  const TRANSITION_TIME = 700;
  const BUTTON_SELECTOR = '[data-theme-toggle], #darkModeToggle, .dark-mode-toggle, .ppw-dark-toggle, #ppwPageThemeToggle';

  function readTheme(){
    try {
      return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch(e) {
      return 'light';
    }
  }

  function writeTheme(theme){
    try { localStorage.setItem(STORAGE_KEY, theme); } catch(e) {}
  }

  function updateButtons(theme){
    const dark = theme === 'dark';
    document.querySelectorAll(BUTTON_SELECTOR).forEach(function(button){
      button.textContent = dark ? '☀ Light Mode' : '☾ Dark Mode';
      button.setAttribute('aria-pressed', dark ? 'true' : 'false');
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
      button.dataset.ppwThemeBound = '1';
    });
  }

  function applyTheme(theme, animate, event){
    const root = document.documentElement;
    const body = document.body;
    const dark = theme === 'dark';

    if(!root) return;

    if(animate && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
      let x = '50%';
      let y = '50%';

      if(event && typeof event.clientX === 'number'){
        x = event.clientX + 'px';
        y = event.clientY + 'px';
      } else if(event && event.currentTarget?.getBoundingClientRect){
        const rect = event.currentTarget.getBoundingClientRect();
        x = (rect.left + rect.width / 2) + 'px';
        y = (rect.top + rect.height / 2) + 'px';
      }

      root.style.setProperty('--ppw-theme-x', x);
      root.style.setProperty('--ppw-theme-y', y);
      root.classList.remove('ppw-theme-going-dark', 'ppw-theme-going-light');
      void root.offsetWidth;
      root.classList.add(dark ? 'ppw-theme-going-dark' : 'ppw-theme-going-light');

      window.clearTimeout(window.__ppwThemeTimer);
      window.__ppwThemeTimer = window.setTimeout(function(){
        root.classList.remove('ppw-theme-going-dark', 'ppw-theme-going-light');
      }, TRANSITION_TIME + 50);
    }

    // This is the actual theme switch. The animation is only the visual transition.
    root.classList.toggle('dark-mode', dark);
    root.classList.toggle('light-mode', !dark);
    if(body){
      body.classList.toggle('dark-mode', dark);
      body.classList.toggle('light-mode', !dark);
    }

    updateButtons(theme);
  }

  function createButton(){
    if(document.querySelector(BUTTON_SELECTOR)) return;
    const button = document.createElement('button');
    button.id = 'ppwPageThemeToggle';
    button.className = 'ppw-page-theme-toggle';
    button.type = 'button';
    document.body.appendChild(button);
  }

  function bindButtons(){
    document.querySelectorAll(BUTTON_SELECTOR).forEach(function(button){
      if(button.dataset.ppwThemeClickBound === '1') return;
      button.dataset.ppwThemeClickBound = '1';
      button.addEventListener('click', function(event){
        const next = document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark';
        writeTheme(next);
        applyTheme(next, true, event);
      });
    });
  }

  function init(){
    applyTheme(readTheme(), false);
    createButton();
    bindButtons();
    updateButtons(readTheme());
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
