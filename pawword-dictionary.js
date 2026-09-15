(()=>{
'use strict';

// PawWord's large guess dictionary. The actual words live in pawword-words.txt
// so the main game script stays small and easy to maintain.
const WORDS_URL='pawword-words.txt?v=2';
const originalHas=Set.prototype.has;

fetch(WORDS_URL,{cache:'no-store'})
  .then(r=>{
    if(!r.ok) throw new Error(`Dictionary request failed: ${r.status}`);
    return r.text();
  })
  .then(text=>{
    const dictionary=new Set(
      text.split(/\s+/)
        .map(word=>word.trim().toUpperCase().replace(/^\\/,''))
        .filter(word=>/^[A-Z]{5}$/.test(word))
    );

    // Keep this common word available even if the pasted source contains
    // a stray escape character before it.
    dictionary.add('EATER');

    // games-v3.js keeps PawWord's valid guesses in a local Set.
    // Extend only that kind of Set, without affecting the dictionary Set itself.
    Set.prototype.has=function(value){
      if(
        typeof value==='string' &&
        value.length===5 &&
        this.size>=100 && this.size<=500 &&
        originalHas.call(this,'APPLE') &&
        originalHas.call(this,'MONEY') &&
        originalHas.call(dictionary,value.toUpperCase())
      ) return true;
      return originalHas.call(this,value);
    };

    window.__pawwordDictionaryReady=true;
    window.__pawwordDictionarySize=dictionary.size;
  })
  .catch(error=>{
    console.warn('PawWord dictionary could not be loaded. Using built-in words.',error);
    window.__pawwordDictionaryReady=false;
  });
})();
