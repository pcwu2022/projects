// EEQuiz app
const studentsPath = 'students_hashed.json';
const profsPath = 'professors.json';
const buildingsPath = 'buildings.json';
const coursesPath = 'courses.json';

// Generic mode configuration: add new modes here to extend the app
const MODES = [
  { id: 'profs', label: '電機系教授', path: profsPath, type: 'pairs', placeholder: '輸入教授名字後按 Enter 或按下 +', showGroups: true },
  { id: 'buildings', label: '台大建築物', path: buildingsPath, type: 'pairs', placeholder: '輸入建築名稱後按 Enter 或按下 +', showGroups: true },
  { id: 'courses', label: '電資院課程', path: coursesPath, type: 'pairs', placeholder: '輸入課程名稱後按 Enter 或按下 +', showGroups: true },
  { id: 'students', label: 'B11 同學', path: studentsPath, type: 'hashlist', placeholder: '輸入學生名字後按 Enter 或按下 +', showGroups: false }
];

let students = [];
let profs = []; // [{name, groups}]

const nameInput = document.getElementById('nameInput');
const addBtn = document.getElementById('addBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
// Mode buttons will be generated dynamically for scalability
const modeSwitchEl = document.querySelector('.mode-switch');
// no datalist/suggestions: pure memory gameplay
const answers = document.getElementById('answers');
const summary = document.getElementById('summary');
const groupStats = document.getElementById('groupStats');

let mode = 'students';

// entered: Map displayName -> digest (hex string) ; digest may be null until computed
let entered = new Map();

// Data stores and fast-lookup maps per mode
const dataStore = new Map(); // modeId -> array (raw data)
const nameMap = new Map(); // modeId -> Map(name -> groups[])
const groupIndex = new Map(); // modeId -> Map(group -> Set(names))
const modeButtons = new Map(); // modeId -> button element

const STORAGE_KEY = 'eequiz-state-v1';

function normalizeName(s){
  if(!s) return '';
  return s.normalize('NFKC').replace(/\s+/g,'').toLowerCase();
}

// compute SHA-256 hex digest for a string using Web Crypto API
async function hashString(s){
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(s));
  const bytes = new Uint8Array(buf);
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ensure any entries in `entered` have their digest computed (if missing)
async function computeDigestsForEntered(){
  const promises = [];
  for(const [name, digest] of entered){
    if(!digest){
      const norm = normalizeName(name);
      const p = hashString(norm).then(d => { entered.set(name, d); });
      promises.push(p);
    }
  }
  await Promise.all(promises);
}

async function loadData(){
  // load all configured modes' data
  for(const m of MODES){
    try{
      const resp = await fetch(m.path);
      const data = await resp.json();
      dataStore.set(m.id, data);
    }catch(e){
      console.error('Failed to load', m.path, e);
      dataStore.set(m.id, []);
    }
  }

  // build name maps and group indices for non-hashlist modes
  for(const m of MODES){
    if(m.type === 'pairs'){
      const arr = dataStore.get(m.id) || [];
      const nm = new Map();
      const gi = new Map();
      for(const item of arr){
        const [name, groups] = item;
        nm.set(name, groups);
        for(const g of groups){
          if(!gi.has(g)) gi.set(g, new Set());
          gi.get(g).add(name);
        }
      }
      nameMap.set(m.id, nm);
      groupIndex.set(m.id, gi);
    }
  }

  populateDatalist();
  // generate mode buttons dynamically
  modeSwitchEl.innerHTML = '';
  for(const m of MODES){
    const b = document.createElement('button');
    b.type = 'button';
    b.id = `${m.id}Btn`;
    b.textContent = m.label;
    b.setAttribute('aria-pressed', 'false');
    if(m.id === mode) b.classList.add('active');
    b.addEventListener('click', ()=>switchMode(m.id));
    modeSwitchEl.appendChild(b);
    modeButtons.set(m.id, b);
  }
  // restore saved answers (if any) and then update UI
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const obj = JSON.parse(raw);
      if(obj.mode) mode = obj.mode;
      // restore entries for the active mode (generic)
      const arr = obj[mode] || [];
      entered.clear();
      for(const n of arr) entered.set(n, null);
      // compute digests for any restored student entries (async)
      await computeDigestsForEntered();
    }
  }catch(e){ console.warn('load state failed', e); }

  // make sure UI (buttons/placeholder) reflects restored mode
  // update active state for dynamic buttons
  modeButtons.forEach((btn, id) => {
    btn.classList.toggle('active', id === mode);
    btn.setAttribute('aria-pressed', id === mode);
  });
  const modeCfg = MODES.find(m=>m.id===mode) || MODES[0];
  nameInput.placeholder = modeCfg.placeholder;

  updateUI();
}

function populateDatalist(){
  // intentionally empty: we do not show suggestions/autocomplete.
  return;
}

function saveState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : { mode };
    // save entries under the active mode key
    obj[mode] = Array.from(entered.keys());
    obj.mode = mode;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }catch(e){ console.warn('saveState failed', e); }
}

function switchMode(m){
  // save current mode entries before switching
  saveState();
  mode = m;
  // restore entries for new mode from storage (if any)
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const obj = JSON.parse(raw);
      const arr = obj[mode] || [];
      entered.clear();
      for(const n of arr) entered.set(n, null);
      // kick off digest computation (async) and update UI when done
      computeDigestsForEntered().then(updateUI).catch(e=>console.warn('digest compute failed', e));
    } else {
      entered.clear();
    }
  }catch(e){ console.warn('restore on switch failed', e); entered.clear(); }
  // update active state for dynamic buttons and placeholder
  modeButtons.forEach((btn, id) => {
    btn.classList.toggle('active', id === mode);
    btn.setAttribute('aria-pressed', id === mode);
  });
  const modeCfg = MODES.find(x=>x.id===mode);
  if(modeCfg) nameInput.placeholder = modeCfg.placeholder;
  populateDatalist();
  updateUI();
}

function addEntry(){
  (async ()=>{
    const raw = nameInput.value.trim();
    if(!raw) return;
    const norm = normalizeName(raw);
    // check duplicates by normalized form
    for(const existing of entered.keys()){
      if(normalizeName(existing)===norm){
        nameInput.value = '';
        return; // already added
      }
    }

    // generic validation by mode
    const cfg = MODES.find(x=>x.id===mode);
    if(!cfg){ nameInput.value = ''; return; }
    if(cfg.type === 'hashlist'){
      const digest = await hashString(norm);
      const valid = (dataStore.get(mode) || []).includes(digest);
      if(!valid){
        nameInput.classList.add('input-error');
        setTimeout(()=> nameInput.classList.remove('input-error'), 700);
        nameInput.value = '';
        return;
      }
      entered.set(raw, digest);
    } else if(cfg.type === 'pairs'){
      const nm = nameMap.get(mode) || new Map();
      const keys = Array.from(nm.keys());
      const match = keys.find(k => normalizeName(k) === norm);
      if(!match){
        nameInput.classList.add('input-error');
        setTimeout(()=> nameInput.classList.remove('input-error'), 700);
        nameInput.value = '';
        return;
      }
      entered.set(match, null);
    }

    nameInput.value = '';
    updateUI();
    saveState();
  })();
}

function updateUI(){
  // answers
  answers.innerHTML = '';
  for(const [name, digest] of entered){
    const li = document.createElement('li');
    li.className = 'answer-item';
    let valid = false;
    const cfg = MODES.find(x=>x.id===mode);
    if(cfg){
      if(cfg.type === 'hashlist'){
        valid = !!digest && (dataStore.get(mode) || []).includes(digest);
      } else if(cfg.type === 'pairs'){
        const nm = nameMap.get(mode) || new Map();
        valid = Array.from(nm.keys()).some(p => normalizeName(p) === normalizeName(name));
      }
    }
    li.textContent = name;
    li.title = valid ? 'valid' : 'invalid';
    if(valid) li.classList.add('correct'); else li.classList.add('invalid');
    answers.appendChild(li);
  }

  // summary
  // Generic summary & group stats
  const cfg = MODES.find(x=>x.id===mode) || MODES[0];
  if(cfg.type === 'hashlist'){
    const correct = Array.from(entered.values()).filter(d => d && (dataStore.get(mode) || []).includes(d)).length;
    summary.innerHTML = `<div>Unique entries: ${entered.size} • Correct ${cfg.label.toLowerCase()}: ${correct}</div>`;
    groupStats.innerHTML = `<div style="color:var(--muted)">${cfg.label} mode — no group stats.</div>`;
  } else if(cfg.type === 'pairs'){
    const covered = new Set();
    const nm = nameMap.get(mode) || new Map();
    for(const name of entered.keys()){
      const key = Array.from(nm.keys()).find(p=>normalizeName(p)===normalizeName(name));
      if(key) covered.add(key);
    }
    summary.innerHTML = `<div>Unique entries: ${entered.size} • Recognized ${cfg.label.toLowerCase()}: ${covered.size}</div>`;

    // per-group
    groupStats.innerHTML = '';
    const gi = groupIndex.get(mode) || new Map();
    // compute stats for each group, sort by answered percentage (desc), then name
    const groups = Array.from(gi.keys());
    const stats = groups.map(g => {
      const total = gi.get(g).size;
      let coveredCount = 0;
      for(const name of gi.get(g)) if(covered.has(name)) coveredCount++;
      const pct = total ? Math.round((coveredCount/total)*100) : 0;
      return { g, total, coveredCount, pct };
    });
    stats.sort((a,b) => {
      if(b.pct !== a.pct) return b.pct - a.pct;
      return a.g.localeCompare(b.g);
    });
    for(const s of stats){
      const row = document.createElement('div');
      row.className = 'group-row';
      row.innerHTML = `<div>${s.g}</div><div>${s.coveredCount}/${s.total} (${s.pct}%)</div>`;
      groupStats.appendChild(row);
    }
  }
}

function resetAll(){
  entered.clear();
  updateUI();
  saveState();
}

function exportList(){
  const arr = Array.from(entered.keys());
  const blob = new Blob([JSON.stringify({mode, entries: arr}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `eequiz-${mode}-answers.json`;
  a.click(); URL.revokeObjectURL(url);
}

// event wiring
addBtn.addEventListener('click', addEntry);
nameInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ addEntry(); } });
resetBtn.addEventListener('click', resetAll);
exportBtn.addEventListener('click', exportList);
// mode buttons wired when created in loadData()

// init
loadData().catch(err=>{
  console.error('Failed to load data', err);
  summary.textContent = 'Failed to load students/professors data. Check console.';
});
