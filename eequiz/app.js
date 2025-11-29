// EEQuiz app
const studentsPath = 'students_hashed.json';
const profsPath = 'professors.json';

let students = [];
let profs = []; // [{name, groups}]

const nameInput = document.getElementById('nameInput');
const addBtn = document.getElementById('addBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const studentsBtn = document.getElementById('studentsBtn');
const profsBtn = document.getElementById('profsBtn');
// no datalist/suggestions: pure memory gameplay
const answers = document.getElementById('answers');
const summary = document.getElementById('summary');
const groupStats = document.getElementById('groupStats');

let mode = 'students';

// entered: Map displayName -> digest (hex string) ; digest may be null until computed
let entered = new Map();

// For professors analytics
let profMap = new Map(); // name -> groups[]
let groupToProfessors = new Map(); // group -> Set of professor names

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
  const sResp = await fetch(studentsPath);
  students = await sResp.json();
  const pResp = await fetch(profsPath);
  profs = await pResp.json();

  // build profMap and group indices
  profMap = new Map();
  groupToProfessors = new Map();
  for(const item of profs){
    const [name, groups] = item;
    profMap.set(name, groups);
    for(const g of groups){
      if(!groupToProfessors.has(g)) groupToProfessors.set(g, new Set());
      groupToProfessors.get(g).add(name);
    }
  }

  populateDatalist();
  // restore saved answers (if any) and then update UI
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const obj = JSON.parse(raw);
      if(obj.mode) mode = obj.mode;
      const arr = mode === 'students' ? (obj.students || []) : (obj.profs || []);
      entered.clear();
      for(const n of arr) entered.set(n, null);
      // compute digests for any restored student entries (async)
      await computeDigestsForEntered();
    }
  }catch(e){ console.warn('load state failed', e); }

  updateUI();
}

function populateDatalist(){
  // intentionally empty: we do not show suggestions/autocomplete.
  return;
}

function saveState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : { students: [], profs: [], mode };
    if(mode === 'students'){
      obj.students = Array.from(entered.keys());
    } else {
      obj.profs = Array.from(entered.keys());
    }
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
      const arr = mode === 'students' ? (obj.students || []) : (obj.profs || []);
      entered.clear();
      for(const n of arr) entered.set(n, null);
      // kick off digest computation (async) and update UI when done
      computeDigestsForEntered().then(updateUI).catch(e=>console.warn('digest compute failed', e));
    } else {
      entered.clear();
    }
  }catch(e){ console.warn('restore on switch failed', e); entered.clear(); }

  document.querySelectorAll('.mode-switch button').forEach(b=>b.classList.remove('active'));
  if(m==='students') studentsBtn.classList.add('active'); else profsBtn.classList.add('active');
  nameInput.placeholder = m==='students' ? '輸入學生名字後按 Enter 或按下 +（純記憶，不顯示建議）' : '輸入教授名字後按 Enter 或按下 +（純記憶，不顯示建議）';
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

    if(mode === 'students'){
      // compute digest of normalized name and check against students digests
      const digest = await hashString(norm);
      const valid = students.includes(digest);
      if(!valid){
        nameInput.classList.add('input-error');
        setTimeout(()=> nameInput.classList.remove('input-error'), 700);
        nameInput.value = '';
        return;
      }
      // canonical name: keep the user's raw input for display
      const canonical = raw;
      entered.set(canonical, digest);
    } else {
      // professor mode: same as before, match names
      const valid = Array.from(profMap.keys()).some(p => normalizeName(p) === norm);
      if(!valid){
        nameInput.classList.add('input-error');
        setTimeout(()=> nameInput.classList.remove('input-error'), 700);
        nameInput.value = '';
        return;
      }
      const canonical = Array.from(profMap.keys()).find(p => normalizeName(p)===norm) || raw;
      entered.set(canonical, null);
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
    if(mode==='students'){
      valid = !!digest && students.includes(digest);
    } else {
      valid = Array.from(profMap.keys()).some(p => normalizeName(p)===normalizeName(name));
    }
    li.textContent = name;
    li.title = valid ? 'valid' : 'invalid';
    if(valid) li.classList.add('correct'); else li.classList.add('invalid');
    answers.appendChild(li);
  }

  // summary
  if(mode==='students'){
    const correct = Array.from(entered.values()).filter(d => d && students.includes(d)).length;
    summary.innerHTML = `<div>Unique entries: ${entered.size} • Correct students: ${correct}</div>`;
    groupStats.innerHTML = `<div style="color:var(--muted)">Students mode — no group stats.</div>`;
  } else {
    // professor mode: compute per-group coverage
    const covered = new Set();
    for(const name of entered){
      // match canonical
      const key = Array.from(profMap.keys()).find(p=>normalizeName(p)===normalizeName(name));
      if(key) covered.add(key);
    }
    summary.innerHTML = `<div>Unique entries: ${entered.size} • Recognized professors: ${covered.size}</div>`;

    // per-group
    groupStats.innerHTML = '';
    const groups = Array.from(groupToProfessors.keys()).sort();
    for(const g of groups){
      const total = groupToProfessors.get(g).size;
      let coveredCount = 0;
      for(const p of groupToProfessors.get(g)) if(covered.has(p)) coveredCount++;
      const pct = Math.round((coveredCount/total)*100);
      const row = document.createElement('div');
      row.className = 'group-row';
      row.innerHTML = `<div>${g}</div><div>${coveredCount}/${total} (${pct}%)</div>`;
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
studentsBtn.addEventListener('click', ()=>switchMode('students'));
profsBtn.addEventListener('click', ()=>switchMode('profs'));

// init
loadData().catch(err=>{
  console.error('Failed to load data', err);
  summary.textContent = 'Failed to load students/professors data. Check console.';
});
