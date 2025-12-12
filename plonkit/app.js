// Simple country guessing game using plonkit_db.json
const DB_PATH = 'plonkit_db.json';
const MATCHES = 5;
const PER_GAME_MAX = 5000; // user requested per-game max
const PER_MATCH_MAX = Math.round(PER_GAME_MAX / MATCHES);
const WRONG_GUESS_PENALTY = 100; // points lost per wrong guess (adjustable)
const CLUE_PENALTY = 50; // points lost per extra clue beyond first (adjustable)
const MAX_WRONG_GUESSES = 5; // maximum wrong guesses per round
const LATEST_TOP_COUNT = 1; // number of latest clues (from DB end) to place at top

let db = {};
let countries = [];
let gameState = {
  matchIndex: 0,
  rounds: [],
  totalScore: 0,
  current: null,
  mode: 'idle', // 'playing' or 'revealed'
};

// per-game results (filled during play)
gameState.results = [];

// valid country inputs (display names and slugs) used to prevent accidental submits
// map of accepted input (lowercase) -> canonical slug present in DB
let inputMap = new Map();

// UI elements
const cluesEl = document.getElementById('clues');
const guessInput = document.getElementById('guess-input');
const countriesList = document.getElementById('countries-list');
const guessBtn = document.getElementById('guess-btn');
const moreBtn = document.getElementById('more-btn');
const giveupBtn = document.getElementById('giveup-btn');
// next button removed; guessBtn will be reused as Next
const feedback = document.getElementById('feedback');
const timerEl = document.getElementById('timer');
const hintsEl = document.getElementById('hints');
const matchInfo = document.getElementById('match-info');
const scoreInfo = document.getElementById('score-info');

function toDisplayName(slug){
  return slug.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' ');
}

function getCluesFor(countryKey){
  const raw = db[countryKey] || [];
  // expected format: [[clue_image, text], [clue_image, text], ...]
  // normalize into objects: {img, text}
  const clues = raw.map(item => {
    if(Array.isArray(item)){
      const img = typeof item[0] === 'string' && item[0].match(/https?:\/\/.+\.(?:png|jpg|jpeg|webp|gif|svg)(?:\?.*)?$/i) ? item[0] : null;
      const text = typeof item[1] === 'string' ? item[1] : (typeof item[0] === 'string' ? item[0] : '');
      return { img, text };
    }
    // fallback: single string entry
    if(typeof item === 'string') return { img: null, text: item };
    return { img: null, text: '' };
  }).filter(c => c && (c.text || c.img));
  return clues;
}

function pickRandomCountries(n){
  const keys = Object.keys(db).filter(k=>Array.isArray(db[k]) && db[k].length>0);
  // shuffle
  for(let i=keys.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1)); [keys[i],keys[j]]=[keys[j],keys[i]];
  }
  return keys.slice(0,n);
}

function shuffleArray(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function startGame(){
  gameState.matchIndex = 0; gameState.totalScore = 0; gameState.rounds = pickRandomCountries(MATCHES);
  gameState.results = [];
  scoreInfo.textContent = `Score: ${gameState.totalScore}`;
  nextMatch();
}

function renderClueCard(clue, showText, idx){
  const card = document.createElement('div'); card.className='clue-card';
  // add an order badge for debugging/render-order visibility
  if(typeof idx === 'number'){
    const b = document.createElement('div'); b.className = 'clue-badge'; b.textContent = `#${idx+1}`;
    card.appendChild(b);
  }
  // mark card with class when supporting text should be shown
  if(showText) card.classList.add('has-text');
  if(clue.img){
    const img = document.createElement('img'); img.src = clue.img; card.appendChild(img);
  }
  // create the text element for the clue; hide it if showText is false
  const p = document.createElement('div'); p.className = 'clue-text'; p.textContent = clue.text || '';
  if(!showText) p.style.display = 'none';
  card.appendChild(p);
  return card;
}

function showCurrentClues(){
  cluesEl.innerHTML='';
  const showText = !!(gameState.current && gameState.current.showText);
  gameState.current.revealed.forEach(idx => {
    const clue = gameState.current.clues[idx];
    cluesEl.prepend(renderClueCard(clue, showText, idx));
  });
}

let timerInterval = null;

function startTimer(){
  // countdown timer: 2 minutes per match
  stopTimer();
  const cur = gameState.current;
  cur.remaining = 120; // seconds
  timerEl.textContent = formatTime(cur.remaining);
  timerInterval = setInterval(()=>{
    cur.remaining -= 1;
    if(cur.remaining < 0){
      clearInterval(timerInterval); timerInterval = null;
      // time's up: mark as give-up so the round scores zero, then reveal
      cur.gaveUp = true;
      feedback.textContent = 'Time expired — round ends with 0 points.';
      revealAnswer();
      return;
    }
    timerEl.textContent = formatTime(cur.remaining);
    updateStatus();
  },1000);
}

function updateStatus(){
  const cur = gameState.current;
  if(!cur) return;
  const hints = Math.max(0, (cur.revealed ? cur.revealed.length - 1 : 0));
  const remaining = Math.max(0, MAX_WRONG_GUESSES - (cur.wrongGuesses || 0));
  hintsEl.textContent = `Hints: ${hints} | Guesses left: ${remaining}`;
}

function stopTimer(){ if(timerInterval){ clearInterval(timerInterval); timerInterval=null; }}

function formatTime(s){ const mm = String(Math.floor(s/60)).padStart(2,'0'); const ss=String(s%60).padStart(2,'0'); return `${mm}:${ss}`; }

function revealNext(){
  const cur = gameState.current;
  if(cur.revealedIndex+1 >= cur.clues.length) return false;
  cur.revealedIndex++;
  cur.revealed.push(cur.revealedIndex);
  showCurrentClues();
  updateStatus();
  return true;
}

function computeMatchScore(){
  // New scoring per request:
  // - If player gave up or reached max wrong guesses, score = 0
  // - Base per match = PER_MATCH_MAX
  // - Each extra clue beyond the first reduces points by 50
  const cur = gameState.current;
  if(!cur) return 0;
  if(cur.gaveUp) return 0;
  const base = PER_MATCH_MAX;
  const revealedClues = cur.revealed ? cur.revealed.length : 1; // number of clues shown
  const cluePenalty = CLUE_PENALTY * Math.max(0, revealedClues - 1);
  // score cannot be negative
  let score = Math.max(0, base - cluePenalty);
  return score;
}

function endRound(revealedAll=false){
  stopTimer();
  const score = computeMatchScore();
  // record result for this round
  const cur = gameState.current;
  const roundInfo = {
    country: cur.key,
    score,
    revealedCount: cur.revealed ? cur.revealed.length : 0,
    wrongGuesses: cur.wrongGuesses || 0,
    gaveUp: !!cur.gaveUp,
  };
  gameState.results.push(roundInfo);
  gameState.totalScore += score;
  scoreInfo.textContent = `Score: ${gameState.totalScore}`;
  // hide hint and give-up controls when round ends / answer revealed
  moreBtn.style.display = 'none'; giveupBtn.style.display = 'none';
  return score;
}

function finishGame(){
  // compute previous high, update localStorage if needed, then redirect to end.html
  const prevHighRaw = localStorage.getItem('plonkit_highscore');
  const prevHigh = prevHighRaw ? parseInt(prevHighRaw,10) : 0;
  const total = gameState.totalScore || 0;
  let newHigh = prevHigh;
  if(total > prevHigh){
    localStorage.setItem('plonkit_highscore', String(total));
    newHigh = total;
  }
  const payload = {
    rounds: gameState.results,
    total,
    prevHigh,
    newHigh,
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  // redirect to end screen with data in query
  window.location.href = `end.html?data=${encoded}`;
}

function revealAnswer(){
  const cur = gameState.current;
  if(!cur) return;
  // Only reveal supporting text for the clues already displayed (do NOT reveal unseen images)
  cur.showText = true;
  cur.answered = true;
  showCurrentClues();
  gameState.mode = 'revealed';
  const displayName = toDisplayName(cur.key);
  feedback.innerHTML = `<strong>Answer:</strong> ${displayName}`;
  // compute score and show it as a banner at the top of clues
  const gained = endRound();
  const banner = document.createElement('div'); banner.className = 'score-banner';
  banner.textContent = `Round score: ${gained} points`;
  // insert banner at top
  if(cluesEl.firstChild) cluesEl.insertBefore(banner, cluesEl.firstChild);
  else cluesEl.appendChild(banner);
  // update Guess button to act as Next
  // if this was the final match (matchIndex points to next), offer Results Breakdown
  if(gameState.matchIndex >= MATCHES){
    guessBtn.textContent = 'Results Breakdown';
  } else {
    guessBtn.textContent = 'Next';
  }
  guessBtn.classList.add('secondary');
  updateStatus();
  // ensure all clue text elements are visible after reveal
  try{ document.querySelectorAll('#clues .clue-text').forEach(el=>{ el.style.display = 'block'; }); }catch(e){console.warn('unhide failed',e)}
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

function onGuess(){
  const val = guessInput.value.trim().toLowerCase(); if(!val) return;
  // if the entered value doesn't correspond to any known country or alias, don't treat it as a submission
  if(!inputMap.has(val)){
    feedback.textContent = 'Please choose a country from the suggestions before submitting.';
    return;
  }
  const cur = gameState.current;
  // map the entered value to a canonical slug and compare
  const mapped = inputMap.get(val);
  const targetSlug = cur.key;
  if(mapped === targetSlug){
    feedback.textContent = 'Correct!';
    revealAnswer();
  } else {
    // count wrong guess and show feedback + guesses remaining
    cur.wrongGuesses = (cur.wrongGuesses || 0) + 1;
    const remaining = Math.max(0, MAX_WRONG_GUESSES - cur.wrongGuesses);
    feedback.textContent = `Not correct — try again. Wrong guesses: ${cur.wrongGuesses} — Guesses left: ${remaining}`;
    updateStatus();
    // if max wrong guesses reached, end round with 0
    if(cur.wrongGuesses >= MAX_WRONG_GUESSES){
      feedback.textContent = `Maximum wrong guesses reached — round ends with 0 points.`;
      cur.gaveUp = true;
      revealAnswer();
      return;
    }
  }
}

function guessOrNext(){
  console.debug('guessOrNext()', {mode: gameState.mode});
  if(gameState.mode === 'revealed'){
    // act as Next (or Results Breakdown when final match)
    // If we've finished all matches, show the breakdown (finishGame handles redirect)
    if(gameState.matchIndex >= MATCHES){
      finishGame();
      return;
    }
    // otherwise continue to next match
    guessBtn.textContent = 'Guess';
    guessBtn.classList.remove('secondary');
    feedback.textContent = '';
    gameState.mode = 'playing';
    nextMatch();
    return;
  }
  // otherwise behave as guess
  onGuess();
}

function setupEventListeners(){
  guessBtn.addEventListener('click', guessOrNext);
  guessInput.addEventListener('keydown', e=>{ if(e.key==='Enter') guessOrNext(); });
  moreBtn.addEventListener('click', ()=>{
    const ok = revealNext();
    if(!ok){ moreBtn.disabled=true; }
  });
  giveupBtn.addEventListener('click', ()=>{
    feedback.textContent = 'Revealed by giving up.';
    // mark gaveUp so score becomes 0
    if(gameState.current) gameState.current.gaveUp = true;
    revealAnswer();
  });
}

function nextMatch(){
  if(gameState.matchIndex >= MATCHES){
    // game over: finish and redirect to end screen
    finishGame();
    return;
  }
  const key = gameState.rounds[gameState.matchIndex];
  const clues = getCluesFor(key);
  // Move the latest clues (last items in DB order) to the top, then shuffle the rest
  const latest = clues.splice(-LATEST_TOP_COUNT);
  shuffleArray(clues);
  // put latest clues at the front with newest-first order
  if(latest.length) clues.unshift(...latest.reverse());
  if(!clues.length){
    // skip empty and move on
    gameState.matchIndex++; nextMatch(); return;
  }
  gameState.current = { key, clues, revealed:[0], revealedIndex:0, startTime:0, elapsed:0, wrongGuesses:0 };
  matchInfo.textContent = `Match ${gameState.matchIndex+1} / ${MATCHES}`;
  // show first clue only
  showCurrentClues();
  guessBtn.disabled=false; 
  // ensure hint/giveup controls are visible for new round
  moreBtn.style.display = ''; moreBtn.disabled = false;
  giveupBtn.style.display = ''; giveupBtn.disabled = false;
  feedback.textContent = '';
  // reset input
  guessInput.value='';
  // reset reveal state and show hint count and start timer
  gameState.current.showText = false;
  gameState.current.answered = false;
  gameState.mode = 'playing';
  updateStatus();
  timerEl.textContent = '02:00';
  startTimer();
  gameState.matchIndex++;
}

async function init(){
  setupEventListeners();
  try{
    const res = await fetch(DB_PATH);
    db = await res.json();
  }catch(e){
    cluesEl.innerHTML = `<div class="clue-card">Failed to load plonkit_db.json — open locally or serve over HTTP.</div>`; return;
  }
  // populate datalist
  const keys = Object.keys(db).filter(k=>Array.isArray(db[k]) && db[k].length>0).sort();
  keys.forEach(k=>{
    const display = toDisplayName(k);
    const opt = document.createElement('option'); opt.value = display; countriesList.appendChild(opt);
    inputMap.set(display.toLowerCase(), k);
    inputMap.set(k.toLowerCase(), k);
  });

  // common alias candidates mapped to arrays of possible canonical slugs (try to resolve against DB)
  const aliasCandidates = {
    'us': ['united-states','united-states-of-america','america'],
    'usa': ['united-states','united-states-of-america'],
    'u.s.': ['united-states','united-states-of-america'],
    'america': ['united-states','united-states-of-america'],
    'uk': ['united-kingdom','great-britain'],
    'gb': ['united-kingdom','great-britain'],
    'britain': ['united-kingdom','great-britain'],
    'england': ['united-kingdom','england'],
    'uae': ['united-arab-emirates','uae'],
    'south korea': ['south-korea','korea-republic','korea, south','republic-of-korea'],
    'north korea': ['north-korea','korea-dpr','democratic-peoples-republic-of-korea'],
    'russia': ['russia','russian-federation'],
    'prc': ['china','peoples-republic-of-china'],
    'china': ['china','peoples-republic-of-china'],
    'de': ['germany','deutschland'],
    'holland': ['netherlands'],
    'south africa': ['south-africa'],
    'sa': ['south-africa'],
    'nigeria': ['nigeria'],
    'ivory coast': ['cote-ivoire','cote-d-ivoire'],
    'czechia': ['czech-republic','czechia'],
    'slovakia': ['slovakia','slovak-republic'],
    'north macedonia': ['north-macedonia','macedonia'],
    'vietnam': ['vietnam','viet-nam'],
    'taiwan': ['taiwan','taiwan-province-of-china'],
    'ua': ['ukraine'],
    'ireland': ['ireland'],
    'nz': ['new-zealand'],
    'australia': ['australia'],
    'ca': ['canada'],
    'canada': ['canada']
  };

  // resolve aliases to existing DB slugs and add them to inputMap and datalist
  Object.keys(aliasCandidates).forEach(alias => {
    const choices = aliasCandidates[alias];
    for(const c of choices){
      if(keys.includes(c)){
        inputMap.set(alias.toLowerCase(), c);
        break;
      }
    }
  });
  
  // create a small suggestion overlay that appears when the user types a known alias
  const suggestionEl = document.createElement('div');
  suggestionEl.id = 'alias-suggestion';
  suggestionEl.style.position = 'absolute';
  suggestionEl.style.background = 'var(--card)';
  suggestionEl.style.border = '1px solid rgba(255,255,255,0.04)';
  suggestionEl.style.color = 'inherit';
  suggestionEl.style.padding = '8px 10px';
  suggestionEl.style.borderRadius = '8px';
  suggestionEl.style.boxShadow = '0 6px 20px rgba(2,6,23,0.6)';
  suggestionEl.style.cursor = 'pointer';
  suggestionEl.style.zIndex = '100000';
  suggestionEl.style.display = 'none';
  document.body.appendChild(suggestionEl);

  let suggestionVisibleFor = null;
  function showAliasSuggestion(alias, slug){
    const display = toDisplayName(slug);
    suggestionEl.textContent = display;
    const rect = guessInput.getBoundingClientRect();
    suggestionEl.style.left = `${rect.left + window.scrollX}px`;
    suggestionEl.style.top = `${rect.bottom + window.scrollY + 6}px`;
    suggestionEl.style.minWidth = `${rect.width}px`;
    suggestionEl.style.display = 'block';
    suggestionVisibleFor = alias;
  }
  function hideAliasSuggestion(){ suggestionEl.style.display='none'; suggestionVisibleFor = null; }

  // clicking the suggestion fills the input with the formal display name
  suggestionEl.addEventListener('click', ()=>{
    if(!suggestionVisibleFor) return; const slug = inputMap.get(suggestionVisibleFor); if(!slug) return; guessInput.value = toDisplayName(slug); hideAliasSuggestion(); guessInput.focus();
  });

  // show suggestion when typing an alias
  guessInput.addEventListener('input', ()=>{
    const v = guessInput.value.trim().toLowerCase();
    if(!v){ hideAliasSuggestion(); return; }
    if(inputMap.has(v)){
      const mapped = inputMap.get(v);
      // if the mapping is a different slug (i.e., alias), suggest the formal display name
      if(mapped && mapped !== v){ showAliasSuggestion(v, mapped); return; }
    }
    hideAliasSuggestion();
  });

  // hide suggestion on outside click or blur
  document.addEventListener('click', (e)=>{ if(!suggestionEl.contains(e.target) && e.target !== guessInput) hideAliasSuggestion(); });
  // start game
  gameState.rounds = pickRandomCountries(MATCHES);
  startGame();
}

init();
