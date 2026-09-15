(()=>{
'use strict';
const $=s=>document.querySelector(s);
function favicon(){for(const [rel,href] of [['icon','images/tiger.png'],['apple-touch-icon','images/tiger.png']])if(!document.querySelector(`link[rel="${rel}"]`)){const l=document.createElement('link');l.rel=rel;l.href=href;if(rel==='icon')l.type='image/png';document.head.appendChild(l)}}
function styles(){['ppw-v5.css?v=5','ppw-v2.css?v=6','ppw-repair.css?v=4','ppw-dark-final.css?v=6','ppw-feature-fix.css?v=1'].forEach(h=>{const f=h.split('?')[0];if(!document.querySelector(`link[href^="${f}"]`)){const l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l)}})}
function reveal(){document.querySelectorAll('.reveal').forEach(e=>{if(e.dataset.ppwReveal)return;e.dataset.ppwReveal='1';if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){e.classList.add('visible');return}if(!window.PPWRevealObserver)window.PPWRevealObserver=new IntersectionObserver(es=>es.forEach(x=>x.target.classList.toggle('visible',x.isIntersecting)),{threshold:.08});window.PPWRevealObserver.observe(e)})}
function addGamesNav(){const nav=document.querySelector('#mainNav');if(!nav||nav.querySelector('a[href*="games.html"]'))return;const more=[...nav.querySelectorAll('a')].find(a=>a.textContent.trim().toLowerCase()==='more');const a=document.createElement('a');a.href='games.html';a.textContent='Games';if(more)more.after(a);else nav.appendChild(a)}
function sharedTheme(){
  if(document.querySelector('script[data-ppw-shared-theme]'))return;
  const s=document.createElement('script');
  s.src='ppw-page-theme.js?v=6';
  s.dataset.ppwSharedTheme='1';
  s.onload=()=>window.dispatchEvent(new Event('ppw-theme-ready'));
  document.body.appendChild(s);
}
function start(){favicon();styles();addGamesNav();sharedTheme();reveal()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()})();
