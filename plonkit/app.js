// Simple country guessing game using plonkit_db.json
const DB_PATH = 'plonkit_db.json';
const MATCHES = 10;
const PER_GAME_MAX = 1500; // user requested per-game max
const PER_MATCH_MAX = Math.round(PER_GAME_MAX / MATCHES);
const WRONG_GUESS_PENALTY = 50; // points lost per wrong guess (adjustable)
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
      // time's up: auto reveal
      feedback.textContent = 'Time expired — showing answer';
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
  const cluePenalty = 5 * Math.max(0, revealedClues - 1);
  // score cannot be negative
  let score = Math.max(0, base - cluePenalty);
  return score;
}

function endRound(revealedAll=false){
  stopTimer();
  const score = computeMatchScore();
  gameState.totalScore += score;
  scoreInfo.textContent = `Score: ${gameState.totalScore}`;
  moreBtn.disabled = true; giveupBtn.disabled = true;
  // keep guessBtn enabled because it will be reused as Next
  return score;
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
  guessBtn.textContent = 'Next';
  guessBtn.classList.add('secondary');
  updateStatus();
  // ensure all clue text elements are visible after reveal
  try{ document.querySelectorAll('#clues .clue-text').forEach(el=>{ el.style.display = 'block'; }); }catch(e){console.warn('unhide failed',e)}
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

function onGuess(){
  const val = guessInput.value.trim().toLowerCase(); if(!val) return;
  const cur = gameState.current;
  // compare against display name and slug
  const targetSlug = cur.key.toLowerCase();
  const targets = [toDisplayName(targetSlug).toLowerCase(), targetSlug];
  if(targets.includes(val) || val === targetSlug || val === toDisplayName(targetSlug).toLowerCase().replace(/\s+/g,' ')){
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
    // act as Next
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
    // game over
    cluesEl.innerHTML = `<div class="clue-card"><strong>Game over</strong><br>Your final score: ${gameState.totalScore} / ${PER_GAME_MAX}</div>`;
    matchInfo.textContent = `Match ${MATCHES} / ${MATCHES}`;
    timerEl.textContent = '00:00'; hintsEl.textContent='Hints: 0';
    moreBtn.disabled=true; guessBtn.disabled=true; giveupBtn.disabled=true;
    feedback.innerHTML = `<div class="small">Refresh to play again.</div>`;
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
  guessBtn.disabled=false; moreBtn.disabled=false; giveupBtn.disabled=false;
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
    const opt = document.createElement('option'); opt.value = toDisplayName(k); countriesList.appendChild(opt);
  });
  // start game
  gameState.rounds = pickRandomCountries(MATCHES);
  startGame();
}

init();
