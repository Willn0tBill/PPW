(()=>{
"use strict";

const WORDS=["APPLE","BEACH","BRAIN","BRAVE","CAMPUS","CANDY","CHAIR","CLASS","CLOUD","DANCE","DREAM","EAGLE","EARTH","FIELD","FLAME","FRESH","FRUIT","GIANT","GRAPE","GREEN","HAPPY","HEART","HOUSE","LIGHT","MANGO","MUSIC","NORTH","OCEAN","PAPER","PEACE","PHONE","PIANO","PLANT","PRIDE","QUICK","RADIO","RIVER","ROBOT","SCHOOL","SHARE","SMILE","SPORT","STORY","STUDY","TIGER","TODAY","TRAIN","TRAIL","TRUST","VOICE","WATER","WORLD","WRITE","YOUTH"];
const valid=new Set(WORDS);
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const today=todayKey();
const day=Math.floor((Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())-Date.UTC(2026,0,1))/86400000);
const answer=WORDS[((day%WORDS.length)+WORDS.length)%WORDS.length];
const safeGet=(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:v}catch(e){return f}};
const safeSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const safeRemove=k=>{try{localStorage.removeItem(k)}catch(e){}};
const parse=(k,f)=>{try{return JSON.parse(safeGet(k,JSON.stringify(f)))}catch(e){return f}};

const statKey="ppw-game-stats-v4";
let stats=parse(statKey,{played:0,streak:0,lastDay:"",bestMemory:null,weekDays:[]});
if(!Array.isArray(stats.weekDays))stats.weekDays=[];
function saveStats(){safeSet(statKey,JSON.stringify(stats));renderStats()}
function renderStats(){
  const a=document.getElementById("gamesStreak"),b=document.getElementById("gamesPlayed"),c=document.getElementById("gamesBest"),d=document.getElementById("challengeDays");
  if(a)a.textContent=stats.streak||0;
  if(b)b.textContent=stats.played||0;
  if(c)c.textContent=stats.bestMemory?`${(stats.bestMemory/1000).toFixed(1)}s`:"—";
  if(d)d.textContent=Math.min(7,stats.weekDays.length);
}
function markPlayed(){
  if(stats.lastDay===today)return;
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
  const y=yesterday.getFullYear()+"-"+String(yesterday.getMonth()+1).padStart(2,"0")+"-"+String(yesterday.getDate()).padStart(2,"0");
  stats.played=(stats.played||0)+1;
  stats.streak=stats.lastDay===y?(stats.streak||0)+1:1;
  stats.lastDay=today;
  if(!stats.weekDays.includes(today))stats.weekDays.push(today);
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-6);
  stats.weekDays=stats.weekDays.filter(x=>new Date(x+"T12:00:00")>=cutoff).slice(-7);
  saveStats();
}
renderStats();

/* PawWord */
const board=document.getElementById("wordBoard"),msg=document.getElementById("wordMessage"),keyboard=document.getElementById("keyboard"),reset=document.getElementById("wordReset"),date=document.getElementById("wordDate");
if(board&&msg&&keyboard){
  const wordKey=`ppw-pawword-${today}`;
  let guesses=parse(wordKey,[]);if(!Array.isArray(guesses))guesses=[];
  let finished=safeGet(wordKey+"-finished","")==="1",current="";
  if(date)date.textContent=new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"}).toUpperCase();
  const keyRows=["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"],keys={};
  function buildBoard(){board.innerHTML="";for(let r=0;r<6;r++)for(let c=0;c<5;c++){const x=document.createElement("div");x.className="word-cell";x.dataset.row=r;x.dataset.col=c;board.appendChild(x)}}
  function buildKeys(){
    keyboard.innerHTML="";
    keyRows.forEach((letters,i)=>{
      const row=document.createElement("div");row.className="key-row";
      if(i===2){const b=document.createElement("button");b.type="button";b.className="key wide action-key";b.textContent="ENTER";b.addEventListener("click",submit);row.appendChild(b)}
      [...letters].forEach(l=>{const b=document.createElement("button");b.type="button";b.className="key";b.textContent=l;b.setAttribute("aria-label",`Letter ${l}`);b.addEventListener("click",()=>add(l));keys[l]=b;row.appendChild(b)});
      if(i===2){const b=document.createElement("button");b.type="button";b.className="key wide action-key";b.textContent="⌫";b.setAttribute("aria-label","Backspace");b.addEventListener("click",back);row.appendChild(b)}
      keyboard.appendChild(row);
    });
  }
  function say(t,c=""){msg.textContent=t;msg.className=`game-message ${c}`}
  function paint(){
    board.querySelectorAll(".word-cell").forEach(x=>{x.textContent="";x.className="word-cell"});
    guesses.forEach((g,r)=>[...g].forEach((l,c)=>{const x=board.querySelector(`[data-row="${r}"][data-col="${c}"]`);if(x){x.textContent=l;x.classList.add("filled",l===answer[c]?"correct":answer.includes(l)?"present":"absent")}}));
    if(current&&!finished&&guesses.length<6)[...current].forEach((l,c)=>{const x=board.querySelector(`[data-row="${guesses.length}"][data-col="${c}"]`);if(x){x.textContent=l;x.classList.add("filled","pop")}});
  }
  function add(l){if(finished||current.length>=5)return;current+=l;paint()}
  function back(){if(finished)return;current=current.slice(0,-1);paint()}
  function updateKeys(){
    const seen={};guesses.forEach(g=>[...g].forEach((l,i)=>{const rank=l===answer[i]?3:answer.includes(l)?2:1;seen[l]=Math.max(seen[l]||0,rank)}));
    Object.entries(seen).forEach(([l,rank])=>{if(keys[l])keys[l].className=`key ${rank===3?"correct":rank===2?"present":"absent"}`});
  }
  function submit(){
    if(finished)return;
    if(current.length<5){say("You need five letters.","error");return}
    if(!valid.has(current)){say("That word isn't in today's list.","error");return}
    guesses.push(current);safeSet(wordKey,JSON.stringify(guesses));markPlayed();
    if(current===answer){finished=true;safeSet(wordKey+"-finished","1");say(`You got it in ${guesses.length} ${guesses.length===1?"guess":"guesses"}! Come back tomorrow.","win");if(reset)reset.classList.remove("hidden")}
    else if(guesses.length===6){finished=true;safeSet(wordKey+"-finished","1");say(`Today's word was ${answer}. Come back tomorrow!`);if(reset)reset.classList.remove("hidden")}
    else say(`${6-guesses.length} guesses left.`);
    current="";paint();updateKeys();
  }
  document.addEventListener("keydown",e=>{if(!document.body.contains(board))return;if(/^[a-z]$/i.test(e.key))add(e.key.toUpperCase());else if(e.key==="Backspace")back();else if(e.key==="Enter")submit()});
  if(reset)reset.addEventListener("click",()=>{guesses=[];finished=false;current="";safeRemove(wordKey);safeRemove(wordKey+"-finished");reset.classList.add("hidden");say("Type a five-letter word.");buildBoard();buildKeys();paint()});
  buildBoard();buildKeys();paint();updateKeys();
  if(finished){const solved=guesses.length&&guesses[guesses.length-1]===answer;say(solved?`You already solved today's PawWord in ${guesses.length} ${guesses.length===1?"guess":"guesses"}.`:`Today's word was ${answer}. Come back tomorrow!`,solved?"win":"");if(reset)reset.classList.remove("hidden")}
}

/* Compact, valid crossword: two connected mini sections with matching across/down answers. */
const cw=document.getElementById("crosswordGrid"),ac=document.getElementById("acrossClues"),dc=document.getElementById("downClues"),check=document.getElementById("checkCrossword"),clear=document.getElementById("clearCrossword"),cm=document.getElementById("crosswordMessage");
if(cw){
  const rows=["CAT#DOG","ARE#OWL","RED#SUN","#######","PEN#MAP","EAR#AIR","NET#ART"];
  const across=["1. Feline pet","2. Verb: to exist","3. Color of a stop sign","4. Four-legged animal that barks","5. Bird that hoots","6. Bright star in our sky","7. Something you write with","8. What you use to find a place","9. Body part used to hear","10. What you breathe","11. Fishing tool or sports goal","12. Creative work"];
  const down=["1. Vehicle with four wheels","2. A word meaning ‘to be’","3. Past tense of read","4. Nocturnal bird","5. Our planet’s star","6. School writing tool","7. A route or path","8. Creative work"];
  const inputs=[];cw.innerHTML="";
  rows.forEach((row,r)=>[...row].forEach((ch,c)=>{const cell=document.createElement("div");cell.className="cw-cell";if(ch==="#"){cell.classList.add("block")}else{const n=document.createElement("span");n.className="cw-number";n.textContent=r*7+c+1;cell.appendChild(n);const i=document.createElement("input");i.className="cw-input";i.maxLength=1;i.dataset.answer=ch;i.autocomplete="off";i.autocapitalize="characters";i.spellcheck=false;i.inputMode="text";i.setAttribute("aria-label",`Crossword square ${r*7+c+1}`);i.addEventListener("input",()=>{i.value=i.value.replace(/[^a-z]/gi,"").toUpperCase().slice(-1);if(i.value){const p=inputs.indexOf(i);inputs[p+1]?.focus()}});i.addEventListener("keydown",e=>{if(e.key==="Backspace"&&!i.value){const p=inputs.indexOf(i);inputs[p-1]?.focus()}});cell.appendChild(i);inputs.push(i)}cw.appendChild(cell)}));
  function fill(list,items){if(!list)return;list.innerHTML="";items.forEach(x=>{const li=document.createElement("li");li.textContent=x;list.appendChild(li)})}fill(ac,across);fill(dc,down);
  if(check)check.addEventListener("click",()=>{let ok=true,n=0;inputs.forEach(i=>{i.classList.remove("correct","wrong");if(i.value===i.dataset.answer){i.classList.add("correct");n++}else{ok=false;if(i.value)i.classList.add("wrong")}});markPlayed();if(cm){cm.textContent=ok?"Nice! You solved the mini crossword.":`${n} of ${inputs.length} squares are correct.`;cm.className=`game-message ${ok?"win":""}`}});
  if(clear)clear.addEventListener("click",()=>{inputs.forEach(i=>{i.value="";i.classList.remove("correct","wrong")});if(cm){cm.textContent="Fill the grid, then check your answers.";cm.className="game-message"}inputs[0]?.focus()});
}

/* Paw Match */
const memory=document.getElementById("memoryGrid");
if(memory){
  const symbols=["🐯","★","✦","●","◆","▲","✿","☀"],moveEl=document.getElementById("memoryMoves"),message=document.getElementById("memoryMessage");
  let cards=[],open=[],matched=0,moves=0,locked=false,start=0;
  function setup(){memory.innerHTML="";cards=[...symbols,...symbols].sort(()=>Math.random()-.5);open=[];matched=0;moves=0;locked=false;start=performance.now();if(moveEl)moveEl.textContent="0";if(message){message.textContent="Find all eight pairs.";message.className="game-message"}cards.forEach((s,i)=>{const b=document.createElement("button");b.type="button";b.className="memory-card";b.setAttribute("aria-label","Hidden memory card");b.innerHTML=`<span class="memory-back">?</span><span class="memory-face" aria-hidden="true">${s}</span>`;b.addEventListener("click",()=>flip(b,i,s));memory.appendChild(b)})}
  function flip(b,i,s){if(locked||b.classList.contains("flipped")||b.classList.contains("matched"))return;b.classList.add("flipped");open.push({b,i,s});if(open.length<2)return;moves++;if(moveEl)moveEl.textContent=moves;if(open[0].s===open[1].s){open.forEach(x=>x.b.classList.add("matched"));matched+=2;open=[];if(matched===cards.length){const time=performance.now()-start;if(!stats.bestMemory||time<stats.bestMemory){stats.bestMemory=time;saveStats()}markPlayed();if(message){message.textContent=`You matched them all in ${moves} moves and ${(time/1000).toFixed(1)} seconds!`;message.className="game-message win"}}}else{locked=true;setTimeout(()=>{open.forEach(x=>x.b.classList.remove("flipped"));open=[];locked=false},550)}}
  document.getElementById("memoryRestart")?.addEventListener("click",setup);setup();
}
})();
