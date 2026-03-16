const LANGUAGE_ABBREV = {
  'Spanish': 'sp',
  'Portuguese': 'pt',
  'Catalan': 'ca',
  'French': 'fr',
  'Italian': 'it',
  'German': 'de',
  'Russian': 'ru',
  'Ukrainian': 'uk',
  'Belarusian': 'be',
  'Swedish': 'sv',
  'Norwegian': 'no',
  'Dutch': 'nl'
};

let allQuizzes = [];
let currentQuiz = null;
let questions = [];
let LANGS = [];
let KEYS = [];

let current = 0;
let score = 0;
let answered = false;
let langScores = {};
let langCounts = {};

// Fetch and initialize quizzes
async function initializeApp() {
  try {
    const response = await fetch('quizzes.json');
    const data = await response.json();
    allQuizzes = data.quizzes;
    showQuizSelector();
  } catch (error) {
    console.error('Error loading quizzes:', error);
  }
}

function showQuizSelector() {
  const selector = document.getElementById('quizSelector');
  const quizWrap = document.getElementById('quizWrap');
  const resultsPage = document.getElementById('resultsPage');
  
  selector.classList.remove('hidden');
  quizWrap.style.display = 'none';
  resultsPage.classList.remove('active');
  
  const grid = document.getElementById('quizGrid');
  grid.innerHTML = '';
  
  allQuizzes.forEach(quiz => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
      <p class="quiz-name">${quiz.name}</p>
      <p class="quiz-desc">${quiz.description}</p>
    `;
    card.onclick = () => startQuiz(quiz.id);
    grid.appendChild(card);
  });
}

function startQuiz(quizId) {
  currentQuiz = allQuizzes.find(q => q.id === quizId);
  if (!currentQuiz) return;
  
  // Select 10 random questions from the quiz
  const allQuestions = currentQuiz.questions;
  questions = [];
  const indices = new Set();
  while (questions.length < 10) {
    const idx = Math.floor(Math.random() * allQuestions.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      questions.push(allQuestions[idx]);
    }
  }
  
  LANGS = currentQuiz.languages;
  KEYS = LANGS.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, D...
  
  langScores = {};
  langCounts = {};
  LANGS.forEach(lang => {
    langScores[lang] = 0;
    langCounts[lang] = 0;
  });
  
  current = 0;
  score = 0;
  answered = false;
  
  // Show quiz UI
  document.getElementById('quizSelector').classList.add('hidden');
  document.getElementById('quizWrap').style.display = 'block';
  document.getElementById('resultsPage').classList.remove('active');
  document.getElementById('quizWrap').querySelector('.card').style.display = 'block';
  
  // Render language tags with proper abbreviation
  const tagsContainer = document.getElementById('langTags');
  tagsContainer.innerHTML = '';
  LANGS.forEach((lang, idx) => {
    const tag = document.createElement('span');
    const abbrev = LANGUAGE_ABBREV[lang] || lang.substring(0, 2).toLowerCase();
    tag.className = 'tag tag-' + abbrev;
    tag.textContent = lang;
    tagsContainer.appendChild(tag);
  });
  
  // Shuffle and load first question
  window.shuffledQuestions = shuffle(questions);
  loadQuestion();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadQuestion() {
  answered = false;
  const q = window.shuffledQuestions[current];
  langCounts[q.lang]++;

  document.getElementById('questionNum').textContent = `Question ${String(current + 1).padStart(2, '0')}`;
  document.getElementById('questionText').textContent = q.text;
  document.getElementById('progressLabel').textContent = `${current + 1} / ${questions.length}`;
  document.getElementById('progressFill').style.width = `${(current / questions.length) * 100}%`;

  const fb = document.getElementById('feedback');
  fb.className = 'feedback';
  fb.textContent = '';

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.className = 'next-btn';
  nextBtn.textContent = current === questions.length - 1 ? 'See Results →' : 'Next Question →';

  const optDiv = document.getElementById('options');
  optDiv.innerHTML = '';

  // Always include the correct answer, pick up to 3 other random options (max 4 total)
  const correctAnswer = q.answer;
  const otherLanguages = LANGS.filter(lang => lang !== correctAnswer);
  
  let selectedOptions = [correctAnswer];
  if (otherLanguages.length > 3) {
    // Pick 3 random from the others
    const randomOthers = [];
    const indices = new Set();
    while (randomOthers.length < 3) {
      const idx = Math.floor(Math.random() * otherLanguages.length);
      if (!indices.has(idx)) {
        indices.add(idx);
        randomOthers.push(otherLanguages[idx]);
      }
    }
    selectedOptions = selectedOptions.concat(randomOthers);
  } else {
    // Include all if 3 or fewer
    selectedOptions = selectedOptions.concat(otherLanguages);
  }
  
  const opts = shuffle(selectedOptions);
  opts.forEach((lang, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-key">${KEYS[i]}</span><span>${lang}</span>`;
    btn.onclick = () => selectAnswer(lang, btn, opts);
    optDiv.appendChild(btn);
  });
}

function selectAnswer(selected, btn, opts) {
  if (answered) return;
  answered = true;

  const q = window.shuffledQuestions[current];
  const correct = selected === q.answer;
  const fb = document.getElementById('feedback');
  const btns = document.querySelectorAll('.option-btn');

  btns.forEach(b => {
    const label = b.querySelector('span:last-child').textContent;
    if (label === q.answer) {
      b.classList.add('correct');
    } else if (b === btn && !correct) {
      b.classList.add('wrong');
    } else {
      b.classList.add('dimmed');
    }
    b.disabled = true;
  });

  if (correct) {
    score++;
    langScores[q.lang]++;
    fb.className = 'feedback correct-fb show';
    fb.textContent = `✓ Correct! ${q.explanation}`;
  } else {
    fb.className = 'feedback wrong-fb show';
    fb.textContent = `✗ That's ${q.answer}. ${q.explanation}`;
  }

  document.getElementById('nextBtn').classList.add('visible');
}

function nextQuestion() {
  current++;
  if (current >= questions.length) {
    showScore();
  } else {
    loadQuestion();
    document.getElementById('quizWrap').querySelector('.card').style.animation = 'none';
    requestAnimationFrame(() => {
      document.getElementById('quizWrap').querySelector('.card').style.animation = 'fadeUp 0.4s ease both';
    });
  }
}

function showScore() {
  // Hide quiz, show results page
  document.getElementById('quizWrap').style.display = 'none';
  const resultsPage = document.getElementById('resultsPage');
  resultsPage.classList.add('active');

  const pct = score / questions.length;
  const percentage = Math.round((score / questions.length) * 100);
  
  let title, msg;
  if (pct === 1) { 
    title = "Perfect!"; 
    msg = "Flawless. You identified all languages without a single mistake. A true polyglot!"; 
  }
  else if (pct >= 0.85) { 
    title = "Excellent"; 
    msg = "Outstanding command. You have a strong intuition for distinguishing these languages. Just a few slipped through."; 
  }
  else if (pct >= 0.65) { 
    title = "Good"; 
    msg = "Nice work! You caught the obvious markers but the subtler patterns still need some study."; 
  }
  else if (pct >= 0.45) { 
    title = "Fair"; 
    msg = "You're getting familiar with these languages, but mix-ups are common at this stage."; 
  }
  else { 
    title = "Keep Practicing"; 
    msg = "These languages are tricky! Review their unique phonetic and lexical markers and try again!"; 
  }

  document.getElementById('resultsTitle').textContent = title;
  document.getElementById('resultsMessage').textContent = msg;
  document.getElementById('scorePercentage').textContent = percentage + '%';
  document.getElementById('scoreRatio').textContent = `${score} / ${questions.length}`;

  const bd = document.getElementById('breakdown');
  bd.innerHTML = LANGS.map(l => {
    const abbrev = LANGUAGE_ABBREV[l] || l.substring(0, 2).toLowerCase();
    return `
      <div class="breakdown-item">
        <div class="breakdown-count ${abbrev}">${langScores[l]} / ${langCounts[l]}</div>
        <div class="breakdown-label">${l}</div>
      </div>
    `;
  }).join('');
}

function restart() {
  current = 0; 
  score = 0; 
  answered = false;
  LANGS.forEach(lang => {
    langScores[lang] = 0;
    langCounts[lang] = 0;
  });

  // Hide results page, show quiz
  document.getElementById('resultsPage').classList.remove('active');
  document.getElementById('quizWrap').style.display = 'block';
  
  window.shuffledQuestions = shuffle(questions);
  loadQuestion();
}

function backToSelector() {
  document.getElementById('quizWrap').style.display = 'none';
  document.getElementById('resultsPage').classList.remove('active');
  showQuizSelector();
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', initializeApp);
