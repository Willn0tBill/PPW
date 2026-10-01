(()=>{
'use strict';
const $=id=>document.getElementById(id);
const get=(k,f)=>{try{const v=localStorage.getItem(k);return v===null?f:v}catch{return f}};
const put=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const day=today();
const statsKey='ppw-games-v10-stats';
let stats=(()=>{try{return JSON.parse(get(statsKey,'{}'))}catch{return {}}})();
stats.played=Number(stats.played)||0;
stats.streak=Number(stats.streak)||0;
stats.lastDay=stats.lastDay||'';
stats.best=Number(stats.best)||0;
stats.weekDays=Array.isArray(stats.weekDays)?stats.weekDays:[];
function renderStats(){
 $('gamesStreak')&&($('gamesStreak').textContent=stats.streak);
 $('gamesPlayed')&&($('gamesPlayed').textContent=stats.played);
 $('gamesBest')&&($('gamesBest').textContent=stats.best?`${(stats.best/1000).toFixed(1)}s`:'—');
 $('challengeDays')&&($('challengeDays').textContent=Math.min(7,stats.weekDays.length));
}
function played(game){
 const k=`ppw-games-v10-done-${game}-${day}`;
 if(get(k,'')==='1')return;
 put(k,'1');
 const d=new Date();d.setDate(d.getDate()-1);
 const yd=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 stats.streak=stats.lastDay===day?stats.streak:stats.lastDay===yd?stats.streak+1:1;
 stats.lastDay=day;stats.played++;
 if(!stats.weekDays.includes(day))stats.weekDays.push(day);
 stats.weekDays=stats.weekDays.slice(-7);
 put(statsKey,JSON.stringify(stats));renderStats();
}
function celebrate(el){
 if(!el||matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 for(let n=0;n<20;n++){
  const p=document.createElement('i');p.className='game-confetti';p.style.left=`${40+Math.random()*20}%`;p.style.top='48%';
  p.style.setProperty('--dx',`${(Math.random()-.5)*260}px`);p.style.setProperty('--dy',`${100+Math.random()*180}px`);
  el.appendChild(p);setTimeout(()=>p.remove(),900);
 }
}
renderStats();

/* ---------- PAWWORD ---------- */
const wordBoard=$('wordBoard'),wordMsg=$('wordMessage'),keyboard=$('keyboard'),wordReset=$('wordReset');
if(wordBoard&&wordMsg&&keyboard){
 const answers=['APPLE','BEACH','BRAIN','BRAVE','CANDY','CHAIR','CLASS','CLOUD','DANCE','DREAM','EAGLE','EARTH','FIELD','FLAME','FRESH','FRUIT','GIANT','GRAPE','GREEN','HAPPY','HEART','HOUSE','LIGHT','MANGO','MUSIC','OCEAN','PAPER','PEACE','PHONE','PIANO','PLANT','PRIDE','RADIO','RIVER','ROBOT','SCHOOL','SHARE','SMILE','SPORT','STORY','STUDY','TIGER','TODAY','TRAIN','TRAIL','TRUST','VOICE','WATER','WORLD','WRITE','YOUTH'];
 const extra='ABOUT ABOVE AFTER AGAIN ALONE ANGEL ANGRY ARISE AUDIO AWARE BASIC BIRTH BLACK BREAD BREAK BRING BROKE BUILD BUYER CARRY CAUSE CHASE CHEER CHEST CHILD CHOSE CLEAN CLEAR CLOSE COACH COAST COLOR COMET COUNT COVER CRAFT CRASH CREAM CROSS CROWD CROWN CURVE DAILY DRINK DRIVE EARLY EMPTY ENJOY ENTER EVENT EVERY EXTRA FAITH FAVOR FEAST FINAL FIRST FLOOR FOCUS FORCE FOUND FRAME FRONT FUNNY GIVEN GLOBE GOING GREAT GROUP GUESS GUIDE HEAVY HELLO HUMAN IDEAL IMAGE ISSUE JOINT JUDGE KNOWN LABEL LARGE LATER LEARN LEAST LEAVE LEVEL LOCAL LUNCH MAGIC MAJOR MATCH MAYBE METAL MIGHT MODEL MONEY MONTH MOUSE MOVIE NEVER NIGHT NOISE NOVEL OFFER ORDER OTHER PAINT PANEL PARTY PASTA PITCH PLACE PLANE PLATE POINT POWER PRESS PRICE PRIME PRINT PROUD PROVE QUEEN RAISE REACH READY REALM RELAX RIGHT ROUGH ROUND ROUTE RULES SCORE SCENE SCOUT SEVEN SHAPE SHEET SHIFT SHORT SHOUT SIGHT SINCE SKILL SLEEP SMALL SMART SOUND SOUTH SPACE SPEAK SPEED SPEND SPLIT SPOKE STACK STAGE STAND START STATE STEAM STEEL STILL STONE STORE STORM STRONG STUDENT STYLE SUGAR SUPER TABLE TEACH TEAM TITLE TOPIC TOUCH TOWER TRACK TRADE TREAT TREND TRIAL TRIBE TRICK TRIED TROOP TRUCK TRULY TWICE UNDER UNION UNTIL VALUE VIDEO VISIT WASTE WATCH WHILE WHITE WHOLE WHOSE WOMAN WORLD WORRY WRITE WRONG YOUNG'.split(' ');
 const valid=new Set([...answers,...extra]);
 const index=Math.floor((Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())-Date.UTC(2026,0,1))/86400000)%answers.length;
 const answer=answers[(index+7)%answers.length],key=`ppw-pawword-v10-${day}`;
 let guesses=(()=>{try{return JSON.parse(get(key,'[]'))}catch{return[]}})();
 let current='';let finished=get(key+'-done','')==='1';const keys={};
 const say=(t,c='')=>{wordMsg.textContent=t;wordMsg.className=`game-message ${c}`};
 function button(text,fn,extraClass=''){const b=document.createElement('button');b.type='button';b.className=`key ${extraClass}`;b.textContent=text;b.addEventListener('click',fn);return b}
 function build(){
  wordBoard.innerHTML='';
  for(let r=0;r<6;r++)for(let c=0;c<5;c++){const e=document.createElement('div');e.className='word-cell';e.dataset.r=r;e.dataset.c=c;wordBoard.appendChild(e)}
  keyboard.innerHTML='';
  ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].forEach((letters,rowIndex)=>{const row=document.createElement('div');row.className='key-row';if(rowIndex===2)row.append(button('ENTER',submit,'wide'));for(const l of letters){const b=button(l,()=>add(l));keys[l]=b;row.appendChild(b)}if(rowIndex===2)row.append(button('⌫',back,'wide'));keyboard.appendChild(row)});
 }
 function evaluateGuess(guess){
  const result=Array(5).fill('absent'),remaining={};
  [...answer].forEach(l=>remaining[l]=(remaining[l]||0)+1);
  for(let i=0;i<5;i++)if(guess[i]===answer[i]){result[i]='correct';remaining[guess[i]]--}
  for(let i=0;i<5;i++){if(result[i]==='correct')continue;const l=guess[i];if(remaining[l]>0){result[i]='present';remaining[l]--}}
  return result;
 }
 function paint(){
  wordBoard.querySelectorAll('.word-cell').forEach(e=>{e.textContent='';e.className='word-cell'});
  guesses.forEach((g,r)=>{const result=evaluateGuess(g);[...g].forEach((l,c)=>{const e=wordBoard.querySelector(`[data-r="${r}"][data-c="${c}"]`);e.textContent=l;e.classList.add('filled',result[c])})});
  if(current&&!finished)[...current].forEach((l,c)=>{const e=wordBoard.querySelector(`[data-r="${guesses.length}"][data-c="${c}"]`);e.textContent=l;e.classList.add('filled','pop')});
 }
 function add(l){if(finished||guesses.length>=6||current.length>=5)return;current+=l;paint();say('Keep going.')}
 function back(){if(finished)return;current=current.slice(0,-1);paint();say(current?'Keep going.':'Type a five-letter word.')}
 function keyColors(){const rank={};guesses.forEach(g=>evaluateGuess(g).forEach((state,i)=>{const l=g[i],n=state==='correct'?3:state==='present'?2:1;rank[l]=Math.max(rank[l]||0,n)}));Object.entries(rank).forEach(([l,n])=>{keys[l].className=`key ${n===3?'correct':n===2?'present':'absent'}`})}
 function submit(){
  if(finished)return;
  if(current.length!==5)return say('You need five letters.','error');
  if(!valid.has(current))return say('That word is not in the game list.','error');
  guesses.push(current);put(key,JSON.stringify(guesses));const win=current===answer;current='';paint();keyColors();
  if(win||guesses.length===6){finished=true;put(key+'-done','1');played('pawword');say(win?`Solved in ${guesses.length} ${guesses.length===1?'guess':'guesses'}! Come back tomorrow.`:`The word was ${answer}. Come back tomorrow!`,win?'win':'');if(win)celebrate(wordBoard);wordReset?.classList.remove('hidden')}
  else say(`${6-guesses.length} guesses left.`);
 }
 wordReset?.addEventListener('click',()=>{localStorage.removeItem(key);localStorage.removeItem(key+'-done');guesses=[];current='';finished=false;wordReset.classList.add('hidden');say('Type a five-letter word.');build();paint();keyColors()});
 document.addEventListener('keydown',e=>{if(finished||document.activeElement?.matches('input,textarea'))return;if(/^[a-z]$/i.test(e.key))add(e.key.toUpperCase());else if(e.key==='Backspace')back();else if(e.key==='Enter')submit()});
 build();paint();keyColors();
 if(finished){const win=guesses.at(-1)===answer;say(win?'You already solved today’s PawWord.':`Today’s word was ${answer}. Come back tomorrow!`,win?'win':'');wordReset?.classList.remove('hidden')}
}

/* ---------- REAL MINI CROSSWORD ---------- */
const grid=$('crosswordGrid'),across=$('acrossClues'),down=$('downClues'),check=$('checkCrossword'),clear=$('clearCrossword'),crossMsg=$('crosswordMessage');
if(grid&&across&&down){
 const puzzles=[
  {
   rows:['HEART','EMBER','ABUSE','RESIN','TREND'],
   across:['The organ that pumps blood.','A glowing piece of a dying fire.','To treat someone badly.','A sticky substance from some plants.','A general direction or pattern of change.'],
   down:['Something at the center of a feeling or matter.','A small glowing coal.','Misuse or mistreatment.','A substance used in some varnishes and adhesives.','A developing tendency.']
  },
  {
   rows:['PANSY','ALOHA','GATOR','AMEND','NODES'],
   across:['A colorful garden flower.','A Hawaiian hello or goodbye.','Short for alligator.','To revise or improve a document.','Connection points in a network.'],
   down:['A follower of a traditional polytheistic religion.','A historic mission and fort in San Antonio.','Well-known or written down.','Gave off light.','Units equal to three feet.']
  },
  {
   rows:['LACK','IRON','MERE','BAKE'],
   across:['To be without something.','A common metal.','Only; nothing more than.','To cook using dry heat in an oven.'],
   down:['An arm or a leg.','A region or amount of space.','Material often used for bottle stoppers.','The joint between the thigh and lower leg.']
  }
 ];
 const week=Math.floor((Date.now()-Date.UTC(2026,0,1))/(7*86400000));
 const puzzle=puzzles[((week%puzzles.length)+puzzles.length)%puzzles.length];
 const size=puzzle.rows.length;
 const solution=puzzle.rows.map(r=>[...r]);
 const downWords=Array.from({length:size},(_,c)=>solution.map(row=>row[c]).join(''));
 const key=`ppw-crossword-v10-${week}-${size}`;
 let saved=(()=>{try{const x=JSON.parse(get(key,'[]'));return Array.isArray(x)?x:[]}catch{return[]}})();
 const inputs=[];
 const cells=[];
 let number=0;
 const acrossNumbers=[],downNumbers=[];
 grid.innerHTML='';
 grid.style.setProperty('grid-template-columns',`repeat(${size},minmax(0,1fr))`,'important');
 for(let r=0;r<size;r++){
  acrossNumbers[r]=0;
  for(let c=0;c<size;c++){
   const startsAcross=c===0,startsDown=r===0;
   if(startsAcross||startsDown)number++;
   if(startsAcross)acrossNumbers[r]=number;
   if(startsDown)downNumbers[c]=number;
   const cell=document.createElement('div');cell.className='cw-cell';cell.dataset.r=r;cell.dataset.c=c;
   if(startsAcross||startsDown){const num=document.createElement('span');num.className='cw-number';num.textContent=number;cell.appendChild(num)}
   const input=document.createElement('input');input.className='cw-input';input.maxLength=1;input.autocomplete='off';input.inputMode='text';input.dataset.answer=solution[r][c];input.dataset.r=r;input.dataset.c=c;input.value=saved[r*size+c]||'';input.setAttribute('aria-label',`Crossword row ${r+1}, column ${c+1}`);
   input.addEventListener('focus',()=>highlight(r,c));
   input.addEventListener('input',()=>{input.value=input.value.replace(/[^a-z]/gi,'').toUpperCase().slice(-1);input.classList.remove('correct','wrong');save();if(input.value)focusNext(r,c,1)});
   input.addEventListener('keydown',e=>{
    if(e.key==='Backspace'&&!input.value){e.preventDefault();focusNext(r,c,-1)}
    else if(e.key==='ArrowLeft'){e.preventDefault();focusCell(r,c-1)}
    else if(e.key==='ArrowRight'){e.preventDefault();focusCell(r,c+1)}
    else if(e.key==='ArrowUp'){e.preventDefault();focusCell(r-1,c)}
    else if(e.key==='ArrowDown'){e.preventDefault();focusCell(r+1,c)}
   });
   cell.appendChild(input);grid.appendChild(cell);inputs.push(input);cells.push(cell);
  }
 }
 function cellInput(r,c){if(r<0||c<0||r>=size||c>=size)return null;return inputs[r*size+c]||null}
 function focusCell(r,c){cellInput(r,c)?.focus()}
 function focusNext(r,c,delta){
  const i=r*size+c+delta;
  inputs[i]?.focus();
 }
 function highlight(r,c){cells.forEach(x=>x.classList.remove('cw-active-row','cw-active-col'));for(let x=0;x<size;x++){cells[r*size+x]?.classList.add('cw-active-row');cells[x*size+c]?.classList.add('cw-active-col')}}
 function save(){put(key,JSON.stringify(inputs.map(i=>i.value)))}
 across.innerHTML=puzzle.across.map((clue,i)=>`<li><b>${acrossNumbers[i]}.</b> ${clue}</li>`).join('');
 down.innerHTML=puzzle.down.map((clue,i)=>`<li><b>${downNumbers[i]}.</b> ${clue}</li>`).join('');
 check?.addEventListener('click',()=>{
  let right=0;
  inputs.forEach(i=>{i.classList.remove('correct','wrong');if(i.value===i.dataset.answer){right++;i.classList.add('correct')}else if(i.value)i.classList.add('wrong')});
  const done=right===inputs.length;
  crossMsg.textContent=done?'Puzzle solved! Every Across and Down answer crosses correctly.':`${right}/${inputs.length} squares correct. Keep going.`;
  crossMsg.className=`game-message ${done?'win':''}`;
  if(done){played('crossword');celebrate(grid)}
 });
 clear?.addEventListener('click',()=>{inputs.forEach(i=>{i.value='';i.classList.remove('correct','wrong')});save();cells.forEach(x=>x.classList.remove('cw-active-row','cw-active-col'));crossMsg.textContent='Grid cleared.';crossMsg.className='game-message';inputs[0]?.focus()});
 if(saved.some(Boolean))crossMsg.textContent='Your saved crossword is ready. Fill every Across and Down answer.';
 else crossMsg.textContent='Fill the grid so every Across and Down clue is correct.';
 if(downWords.some(w=>w.length!==size))console.warn('PPW crossword configuration is invalid.');
}

/* ---------- PAW MATCH ---------- */
const memory=$('memoryGrid'),movesEl=$('memoryMoves'),memoryMsg=$('memoryMessage'),restart=$('memoryRestart');
if(memory){
 const symbols=[
  ['Paw','images/memory/paw.svg'],['Star','images/memory/star.svg'],['Book','images/memory/book.svg'],['Pencil','images/memory/pencil.svg'],
  ['Globe','images/memory/globe.svg'],['Camera','images/memory/camera.svg'],['School','images/memory/school.svg'],['Trophy','images/memory/trophy.svg']
 ];
 let cards=[],open=[],matches=0,moves=0,locked=false,start=0;
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function setup(){memory.innerHTML='';open=[];matches=0;moves=0;locked=false;start=performance.now();movesEl&&(movesEl.textContent='0');memoryMsg&&(memoryMsg.textContent='Find all eight pairs.',memoryMsg.className='game-message');cards=shuffle([...symbols,...symbols]);cards.forEach((item,index)=>{const b=document.createElement('button');b.type='button';b.className='memory-card';b.innerHTML=`<span class="memory-back">?</span><span class="memory-face" aria-hidden="true"><img src="${item[1]}" alt="${item[0]}"></span>`;b.setAttribute('aria-label','Hidden card');b.addEventListener('click',()=>flip(b,item,index));memory.appendChild(b)})}
 function flip(card,item,index){
  if(locked||card.classList.contains('flipped')||card.classList.contains('matched'))return;
  card.classList.add('flipped');open.push({card,item,index});if(open.length<2)return;
  moves++;movesEl&&(movesEl.textContent=moves);
  if(open[0].item[0]===open[1].item[0]){open.forEach(x=>x.card.classList.add('matched'));matches+=2;open=[];if(matches===cards.length){const time=performance.now()-start;if(!stats.best||time<stats.best){stats.best=time;put(statsKey,JSON.stringify(stats));renderStats()}played('memory');memoryMsg.textContent=`Perfect! ${moves} moves in ${(time/1000).toFixed(1)} seconds.`;memoryMsg.className='game-message win';celebrate(memory)}}
  else{locked=true;memory.classList.add('memory-miss');setTimeout(()=>{open.forEach(x=>x.card.classList.remove('flipped'));open=[];locked=false;memory.classList.remove('memory-miss')},1200)}
 }
 restart?.addEventListener('click',setup);setup();
}

/* ---------- MOBILE / CROSSWORD POLISH ---------- */
const mobileStyle=document.createElement('style');
mobileStyle.textContent=`
.crossword-grid .cw-cell.cw-active-row,.crossword-grid .cw-cell.cw-active-col{background:#fff8dc!important}
.crossword-grid .cw-cell.cw-active-row.cw-active-col{background:#ffe7a3!important}
.dark-mode .crossword-grid .cw-cell.cw-active-row,.dark-mode .crossword-grid .cw-cell.cw-active-col{background:#fff3cb!important}
@media(max-width:760px){
 .games-page{width:100%!important;padding:12px 8px 42px!important}.game-panel{padding:18px 9px!important;border-radius:18px!important}.game-heading{margin-bottom:14px!important}.game-heading h2{font-size:clamp(1.7rem,9vw,2.5rem)!important}.game-heading p{font-size:.86rem!important;line-height:1.45!important}.word-board{width:min(330px,90vw)!important;gap:5px!important}.word-cell{font-size:clamp(1.15rem,7vw,1.65rem)!important;font-weight:900!important}.keyboard{width:100%!important;max-width:390px!important;gap:5px!important}.key-row{gap:3px!important}.key{height:48px!important;min-width:0!important;width:0!important;padding:0 1px!important;font-size:clamp(.56rem,2.6vw,.72rem)!important}.key.wide{flex:1.45!important}.crossword-wrap{grid-template-columns:1fr!important;gap:18px!important}.crossword-grid{width:min(360px,94vw)!important}.crossword-clues{grid-template-columns:1fr!important;gap:14px!important}.memory-grid{width:min(420px,94vw)!important;gap:6px!important}
}
`;
document.head.appendChild(mobileStyle);
})();
