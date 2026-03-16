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

// Calculate binomial coefficient C(n, k)
function binomialCoefficient(n, k) {
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

// Calculate binomial probability mass function P(X = k)
function binomialPMF(n, k, p) {
  const coeff = binomialCoefficient(n, k);
  return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Calculate cumulative binomial probability P(X >= k)
function binomialCDF(n, k, p) {
  let probability = 0;
  for (let i = k; i <= n; i++) {
    probability += binomialPMF(n, i, p);
  }
  return probability;
}

// Initialize quiz with quiz data
function initializeQuiz(quizData) {
  const g = window.quizGlobal;
  
  // Select 10 random questions
  const allQuestions = quizData.questions;
  g.questions = [];
  const indices = new Set();
  while (g.questions.length < 10 && g.questions.length < allQuestions.length) {
    const idx = Math.floor(Math.random() * allQuestions.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      g.questions.push(allQuestions[idx]);
    }
  }

  g.LANGS = quizData.languages;
  g.KEYS = g.LANGS.map((_, i) => String.fromCharCode(65 + i));

  g.langScores = {};
  g.langCounts = {};
  g.LANGS.forEach(lang => {
    g.langScores[lang] = 0;
    g.langCounts[lang] = 0;
  });

  g.current = 0;
  g.score = 0;
  g.answered = false;

  // Render language tags
  const tagsContainer = document.getElementById('langTags');
  tagsContainer.innerHTML = '';
  g.LANGS.forEach((lang, idx) => {
    const tag = document.createElement('span');
    const abbrev = LANGUAGE_ABBREV[lang] || lang.substring(0, 2).toLowerCase();
    tag.className = 'tag tag-' + abbrev;
    tag.textContent = lang;
    tagsContainer.appendChild(tag);
  });

  // Shuffle and load
  g.shuffledQuestions = shuffle(g.questions);
  loadQuestion(g);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadQuestion(g) {
  g.answered = false;
  const q = g.shuffledQuestions[g.current];
  g.langCounts[q.lang]++;

  document.getElementById('questionNum').textContent = `Question ${String(g.current + 1).padStart(2, '0')}`;
  document.getElementById('questionText').textContent = q.text;
  document.getElementById('progressLabel').textContent = `${g.current + 1} / ${g.questions.length}`;
  document.getElementById('progressFill').style.width = `${(g.current / g.questions.length) * 100}%`;

  const fb = document.getElementById('feedback');
  fb.className = 'feedback';
  fb.textContent = '';

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.className = 'next-btn';
  nextBtn.textContent = g.current === g.questions.length - 1 ? 'See Results →' : 'Next Question →';

  const optDiv = document.getElementById('options');
  optDiv.innerHTML = '';

  const correctAnswer = q.answer;
  const otherLanguages = g.LANGS.filter(lang => lang !== correctAnswer);

  let selectedOptions = [correctAnswer];
  if (otherLanguages.length > 3) {
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
    selectedOptions = selectedOptions.concat(otherLanguages);
  }

  const opts = shuffle(selectedOptions);
  opts.forEach((lang, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-key">${g.KEYS[i]}</span><span>${lang}</span>`;
    btn.onclick = () => selectAnswer(lang, btn, opts, q, g);
    optDiv.appendChild(btn);
  });
}

function selectAnswer(selected, btn, opts, q, g) {
  if (g.answered) return;
  g.answered = true;

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
    g.score++;
    g.langScores[q.lang]++;
    fb.className = 'feedback correct-fb show';
    fb.textContent = `✓ Correct! ${q.explanation}`;
  } else {
    fb.className = 'feedback wrong-fb show';
    fb.textContent = `✗ That's ${q.answer}. ${q.explanation}`;
  }

  document.getElementById('nextBtn').classList.add('visible');
}

// Display results (called from app.js)
function displayResults(score, total, quizData, breakdown) {
  const pct = score / total;
  const percentage = Math.round((score / total) * 100);

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
  document.getElementById('quizNameSubtitle').textContent = quizData.name;
  document.getElementById('scorePercentage').textContent = percentage + '%';
  document.getElementById('scoreRatio').textContent = `${score} / ${total}`;

  // High score comparison
  const currentHighScore = app.getHighScore(app.currentQuizId);
  let highScoreText = '';
  if (score === currentHighScore && score > 0) {
    highScoreText = `🏆 New personal best: ${score}/${total}`;
  } else if (currentHighScore && currentHighScore > score) {
    highScoreText = `Your high score: ${currentHighScore}/${total}`;
  }
  if (highScoreText) {
    document.getElementById('highScoreText').textContent = highScoreText;
  }

  // Calculate binomial probability
  const numOptions = Math.min(4, quizData.languages.length);
  const pGuess = 1 / numOptions;
  const randomProbability = binomialCDF(total, score, pGuess);

  let probabilityText = '';
  if (randomProbability < 0.0001) {
    probabilityText = '<0.01%';
  } else if (randomProbability < 0.01) {
    probabilityText = (randomProbability * 100).toFixed(3) + '%';
  } else {
    probabilityText = (randomProbability * 100).toFixed(2) + '%';
  }

  const resultsMessage = document.getElementById('resultsMessage');
  resultsMessage.innerHTML = msg + `<br><br><em>Probability of this score by random guessing: ${probabilityText}</em>`;

  // Breakdown
  const bd = document.getElementById('breakdown');
  bd.innerHTML = quizData.languages.map(l => {
    const abbrev = LANGUAGE_ABBREV[l] || l.substring(0, 2).toLowerCase();
    const data = breakdown[l] || { correct: 0, total: 0 };
    return `
      <div class="breakdown-item">
        <div class="breakdown-count ${abbrev}">${data.correct} / ${data.total}</div>
        <div class="breakdown-label">${l}</div>
      </div>
    `;
  }).join('');
}
