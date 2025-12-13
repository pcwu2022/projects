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

const labels = ["Languages","Poles","Bollards","Guardrails","Signs","Chevrons","Road Lines","Vehicles","Camera","License Plates","Architecture","Landscapes","Brands","Materials","Miscellaneous"];

// Selected labels (array of label names) — loaded from localStorage by init()
let selectedLabels = null; // null or [] means include all (Complete Mode)

function loadSelectedLabels(){
  try{
    const raw = localStorage.getItem('plonkit_selected_labels');
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)) return null;
    // empty array means user explicitly chose none — treat as allow none (no clues)
    return parsed;
  }catch(e){ return null; }
}

const ALL_MARKER = '__PLONKIT_ALL__';
function parseLabelsFromURL(){
  try{
    const params = new URLSearchParams(window.location.search);
    if(!params.has('labels')) return undefined; // no explicit param
    const raw = params.get('labels');
    if(!raw) return undefined;
    if(raw === 'all') return ALL_MARKER; // explicit all
    if(raw === 'none') return []; // explicit none
    const dec = decodeURIComponent(raw);
    const arr = dec.split(',').map(s=>s.trim()).filter(Boolean);
    return normalizeLabels(arr);
  }catch(e){ return undefined; }
}

function normalizeLabels(arr){
  if(!Array.isArray(arr)) return null;
  // map incoming labels to canonical labels (case-insensitive)
  const canon = labels.slice();
  const lowerMap = new Map(canon.map(l=>[l.toLowerCase(), l]));
  const out = [];
  arr.forEach(a=>{
    const low = a.toLowerCase();
    if(lowerMap.has(low)) out.push(lowerMap.get(low));
    else {
      // try fuzzy matching by substring
      for(const c of canon){ if(c.toLowerCase().includes(low) || low.includes(c.toLowerCase())){ out.push(c); break; } }
    }
  });
  // dedupe, preserve order
  return Array.from(new Set(out));
}

// Simple URI-safe compression helpers using base64 of UTF-8 to shorten long JSON in URLs.
function compressToEncodedURIComponent(input){
  if(input == null) return '';
  try{
    const utf8 = unescape(encodeURIComponent(input));
    const b64 = btoa(utf8);
    return encodeURIComponent(b64);
  }catch(e){ return encodeURIComponent(input); }
}

function decompressFromEncodedURIComponent(input){
  if(input == null) return null;
  try{
    const b64 = decodeURIComponent(input);
    const utf8 = atob(b64);
    return decodeURIComponent(escape(utf8));
  }catch(e){ try{ return decodeURIComponent(input); }catch(e2){ return input; } }
}

function clueFilename(url){
  if(!url) return '';
  try{ return url.split('/').pop().split('?')[0].toLowerCase(); }catch(e){return ''}
}

function isClueMatchLabel(clue, label){
  if(!clue) return false;
  const l = label.toLowerCase();
  const txt = (clue.text||'').toLowerCase();
  const fn = clueFilename(clue.img);
  // direct word match
  if(txt.includes(l)) return true;
  if(fn.includes(l.replace(/\s+/g,''))) return true;
  // some label-specific heuristics
  if(l === 'road lines' && /line|lane|crosswalk|zebra/.test(txt)) return true;
  if(l === 'chevrons' && /chevron/.test(txt)) return true;
  if(l === 'license plates' && /plate|licen|licen[c,s]e|registration/.test(txt)) return true;
  if(l === 'vehicles' && /car|truck|van|bus|motorbike|motorcycle|vehicle|uber|taxi/.test(txt)) return true;
  if(l === 'camera' && /camera|gen3|gen4|surveil|cctv|dashcam/.test(txt)) return true;
  if(l === 'languages' && /english|中文|汉语|español|fran(c|ç)ais|deutsch|русск|日本語|한국어|arabic|ไทย/.test(txt)) return true;
  if(l === 'bollards' && /bollard|bollards/.test(txt)) return true;
  if(l === 'poles' && /pole|poles/.test(txt)) return true;
  if(l === 'signs' && /sign|signage/.test(txt)) return true;
  // fallback: check label word as substring inside text words
  return txt.indexOf(l) !== -1;
}

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

// Filtered clues by selectedLabels (when set). null => include all; [] => include none
function getFilteredCluesFor(countryKey){
  const clues = getCluesFor(countryKey);
  if(selectedLabels === null) return clues; // complete mode
  if(Array.isArray(selectedLabels) && selectedLabels.length === 0) return [];
  // keep clues that match any selected label
  return clues.filter(c => selectedLabels.some(lbl => isClueMatchLabel(c, lbl)));
}

function pickRandomCountries(n){
  const keys = Object.keys(db).filter(k=>Array.isArray(db[k]) && db[k].length>0);
  // shuffle
  for(let i=keys.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1)); [keys[i],keys[j]]=[keys[j],keys[i]];
  }
  return keys.slice(0,n);
}

function pickRandomCountriesFromList(list, n){
  const keys = list.slice();
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
  gameState.matchIndex = 0; gameState.totalScore = 0;
  // if gameState.rounds already set (by init with filtered keys), respect it; otherwise pick normally
  if(!gameState.rounds || !Array.isArray(gameState.rounds) || gameState.rounds.length === 0){
    gameState.rounds = pickRandomCountries(MATCHES);
  }
  // set how many matches we'll actually play (could be fewer than MATCHES if pool smaller)
  gameState.totalMatches = Math.min(MATCHES, gameState.rounds.length);
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
  const cur = gameState.current;
  if(!cur || !Array.isArray(cur.revealed) || !Array.isArray(cur.clues)) return;
  const showText = !!cur.showText;
  cur.revealed.forEach(idx => {
    const clue = cur.clues[idx];
    cluesEl.prepend(renderClueCard(clue, showText, idx));
  });
  // disable More button if there are no unseen clues
  try{
    if(!cur || !Array.isArray(cur.clues) || cur.clues.length <= ((cur.revealedIndex||0)+1)){
      moreBtn.disabled = true;
    } else {
      moreBtn.disabled = false;
    }
  }catch(e){ if(moreBtn) moreBtn.disabled = true; }
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
  if(!cur || !Array.isArray(cur.clues)) return false;
  const idx = typeof cur.revealedIndex === 'number' ? cur.revealedIndex : 0;
  if(idx+1 >= cur.clues.length) return false;
  cur.revealedIndex = idx + 1;
  if(!Array.isArray(cur.revealed)) cur.revealed = [];
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
  // apply wrong-guess penalty as well
  const wrongs = cur.wrongGuesses || 0;
  const wrongPenalty = WRONG_GUESS_PENALTY * wrongs;
  // score cannot be negative
  let score = Math.max(0, base - cluePenalty - wrongPenalty);
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
  const encoded = compressToEncodedURIComponent(JSON.stringify(payload));
  // redirect to end screen with data in query
  // also include the label selection used for the game so the end screen can show it
  let labelsParam = '';
  try{
    if(selectedLabels === null){ labelsParam = 'all'; }
    else if(Array.isArray(selectedLabels) && selectedLabels.length === 0){ labelsParam = 'none'; }
    else labelsParam = encodeURIComponent(selectedLabels.join(','));
  }catch(e){ labelsParam = '' }
  const labelQuery = labelsParam ? `&labels=${labelsParam}` : '';
  window.location.href = `end.html?data=${encoded}${labelQuery}`;
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
  // compute score and show it as a banner at the top of clues
  const gained = endRound();
  const banner = document.createElement('div'); banner.className = 'score-banner';
  banner.textContent = `Round score: ${gained} points`;
  // insert banner at top
  if(cluesEl.firstChild) cluesEl.insertBefore(banner, cluesEl.firstChild);
  else cluesEl.appendChild(banner);
  // append an answer block directly under the score banner (instead of using the controls feedback)
  try{
    const answerDiv = document.createElement('div'); answerDiv.className = 'answer';
    answerDiv.innerHTML = `<strong>Answer:</strong> ${displayName}`;
    if(banner.nextSibling) cluesEl.insertBefore(answerDiv, banner.nextSibling);
    else cluesEl.appendChild(answerDiv);
  }catch(e){ /* ignore DOM errors */ }
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
  if(gameState.matchIndex >= (gameState.totalMatches||MATCHES)){
    // game over: finish and redirect to end screen
    finishGame();
    return;
  }
  const key = gameState.rounds[gameState.matchIndex];
  const clues = getFilteredCluesFor(key);
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
  // load selected labels from URL first (so start page can pass them), fall back to stored
  const fromURL = parseLabelsFromURL();
  if(fromURL === undefined){
    selectedLabels = loadSelectedLabels();
  } else if(fromURL === ALL_MARKER){
    selectedLabels = null; // explicit all
  } else {
    selectedLabels = fromURL; // could be [] or list
  }

  // compute available keys (countries that have at least one clue after filtering)
  const allKeys = Object.keys(db).filter(k=>Array.isArray(db[k]) && db[k].length>0);
  const availableKeys = allKeys.filter(k => {
    try{ return Array.isArray(getFilteredCluesFor(k)) && getFilteredCluesFor(k).length>0; }catch(e){ return false; }
  }).sort();
  if(availableKeys.length === 0){
    cluesEl.innerHTML = `<div class="clue-card">No clues available for the selected filters. Please go back to the start page and choose other clue types.</div>`;
    return;
  }
  // populate datalist
  const keys = availableKeys;
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
  // start game with a random selection of available keys
  gameState.rounds = pickRandomCountriesFromList(availableKeys, MATCHES);
  startGame();
}

init();
