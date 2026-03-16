// App state and routing
const app = {
  currentQuizId: null,
  currentQuiz: null,
  quizData: null,

  // Initialize the app
  async init() {
    this.loadQuizzesIndex();
    await this.handleRouting();
    this.renderLandingPage();
  },

  // Load quiz list
  loadQuizzesIndex() {
    // QUIZ_LIST is loaded from quizzes/index.js
    if (typeof QUIZ_LIST === 'undefined') {
      console.error('Quiz list not loaded');
      return;
    }
  },

  // Handle routing based on URL
  async handleRouting() {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');
    const scoreParam = params.get('score');

    if (gameId && scoreParam !== null) {
      // Results page
      await this.showResults(gameId, params);
    } else if (gameId) {
      // Game page
      await this.showGamePage(gameId);
    } else {
      // Landing page (default)
      this.showLandingPage();
    }
  },

  // Show landing page with quiz selection
  showLandingPage() {
    this.currentQuizId = null;
    this.hidePage('gamePage');
    this.hidePage('resultsPage');
    this.showPage('landingPage');
    this.renderLandingPage();
  },

  // Render landing page with quizzes
  renderLandingPage() {
    const grid = document.getElementById('quizGrid');
    grid.innerHTML = '';

    QUIZ_LIST.forEach(quiz => {
      const highScore = this.getHighScore(quiz.id);
      const card = document.createElement('div');
      card.className = 'quiz-card';
      
      let highScoreBadge = '';
      if (highScore !== null) {
        highScoreBadge = `<div class="high-score-badge">${Math.round((highScore / 10) * 100)}%</div>`;
      }
      
      card.innerHTML = `
        ${highScoreBadge}
        <p class="quiz-name">${quiz.name}</p>
        <p class="quiz-desc">${quiz.description}</p>
      `;
      card.onclick = () => this.navigateToGame(quiz.id);
      grid.appendChild(card);
    });
  },

  // Navigate to game
  async navigateToGame(quizId) {
    history.pushState({ page: 'game', quizId }, '', `?id=${quizId}`);
    await this.showGamePage(quizId);
  },

  // Show game page
  async showGamePage(quizId) {
    const quizInfo = QUIZ_LIST.find(q => q.id === quizId);
    if (!quizInfo) {
      console.error('Quiz not found');
      return;
    }

    this.currentQuizId = quizId;

    // Load quiz data
    try {
      const response = await fetch(`quizzes/${quizInfo.file}`);
      this.quizData = await response.json();
      this.currentQuiz = {
        ...this.quizData,
        name: quizInfo.name
      };
    } catch (error) {
      console.error('Error loading quiz:', error);
      return;
    }

    // Initialize quiz state in quiz.js
    window.quizGlobal = {
      questions: [],
      LANGS: [],
      KEYS: [],
      score: 0,
      langScores: {},
      langCounts: {},
      current: 0,
      answered: false,
      shuffledQuestions: []
    };

    // Show game page
    this.hidePage('landingPage');
    this.hidePage('resultsPage');
    this.showPage('gamePage');

    // Start the quiz
    initializeQuiz(this.quizData);
  },

  // Show results page
  async showResults(quizId, params) {
    const quizInfo = QUIZ_LIST.find(q => q.id === quizId);
    if (!quizInfo) {
      this.showLandingPage();
      return;
    }

    this.currentQuizId = quizId;

    // Load quiz for language breakdown
    try {
      const response = await fetch(`quizzes/${quizInfo.file}`);
      const quizData = await response.json();
      this.currentQuiz = { ...quizData, name: quizInfo.name };
    } catch (error) {
      console.error('Error loading quiz:', error);
      return;
    }

    // Parse result data from URL
    const score = parseInt(params.get('score')) || 0;
    const total = parseInt(params.get('total')) || 10;
    
    // Parse breakdown data
    const breakdown = {};
    const languages = this.currentQuiz.languages;
    languages.forEach(lang => {
      const langKey = lang.toLowerCase().replace(/\s+/g, '_');
      breakdown[lang] = {
        correct: parseInt(params.get(`${langKey}_correct`)) || 0,
        total: parseInt(params.get(`${langKey}_total`)) || 0
      };
    });

    // Save high score if applicable
    const currentHighScore = this.getHighScore(quizId);
    if (score > (currentHighScore || 0)) {
      this.setHighScore(quizId, score);
    }

    // Display results
    this.hidePage('landingPage');
    this.hidePage('gamePage');
    this.showPage('resultsPage');
    displayResults(score, total, this.currentQuiz, breakdown);

    // Generate share link
    this.generateShareLink(quizId, score, total, breakdown);
  },

  // Retake quiz
  async retakeQuiz() {
    if (!this.currentQuizId) return;
    await this.showGamePage(this.currentQuizId);
  },

  // Back to home
  backToHome() {
    history.pushState({ page: 'home' }, '', '?');
    this.showLandingPage();
  },

  // Next question
  nextQuestion() {
    window.quizGlobal.current++;
    if (window.quizGlobal.current >= window.quizGlobal.questions.length) {
      this.finishQuiz();
    } else {
      loadQuestion(window.quizGlobal);
    }
  },

  // Finish quiz and go to results
  finishQuiz() {
    const score = window.quizGlobal.score;
    const total = window.quizGlobal.questions.length;
    const breakdown = {};

    window.quizGlobal.LANGS.forEach(lang => {
      breakdown[lang] = {
        correct: window.quizGlobal.langScores[lang] || 0,
        total: window.quizGlobal.langCounts[lang] || 0
      };
    });

    const params = new URLSearchParams({
      id: this.currentQuizId,
      score,
      total,
      ...this.buildBreakdownParams(breakdown)
    });

    history.pushState({ page: 'results', quizId: this.currentQuizId }, '', `?${params.toString()}`);
    this.showResults(this.currentQuizId, params);
  },

  // Build URL parameters from breakdown
  buildBreakdownParams(breakdown) {
    const params = {};
    for (const lang in breakdown) {
      const langKey = lang.toLowerCase().replace(/\s+/g, '_');
      params[`${langKey}_correct`] = breakdown[lang].correct;
      params[`${langKey}_total`] = breakdown[lang].total;
    }
    return params;
  },

  // Generate share link
  generateShareLink(quizId, score, total, breakdown) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      id: quizId,
      score,
      total,
      ...this.buildBreakdownParams(breakdown)
    });

    const shareUrl = `${baseUrl}?${params.toString()}`;
    document.getElementById('shareLink').value = shareUrl;
  },

  // Copy share link to clipboard
  copyShareLink() {
    const input = document.getElementById('shareLink');
    input.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  },

  // LocalStorage functions
  getHighScore(quizId) {
    const scores = JSON.parse(localStorage.getItem('linguist_highscores') || '{}');
    return scores[quizId] || null;
  },

  setHighScore(quizId, score) {
    const scores = JSON.parse(localStorage.getItem('linguist_highscores') || '{}');
    scores[quizId] = score;
    localStorage.setItem('linguist_highscores', JSON.stringify(scores));
  },

  // Page visibility helpers
  showPage(pageId) {
    const page = document.getElementById(pageId);
    if (page) page.style.display = 'block';
  },

  hidePage(pageId) {
    const page = document.getElementById(pageId);
    if (page) page.style.display = 'none';
  }
};

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
  app.handleRouting();
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
