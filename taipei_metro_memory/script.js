// Game State
let gameState = {
  guessedStations: new Set(),
  seconds: 0,
  wrongGuesses: 0,
  timerActive: false,
};

// Constants
const STORAGE_KEY = 'taipei-metro-guessing-v1';
let timerInterval = null;

// Flatten all stations from LINES
let allStations = [];
let stationMap = {}; // For quick lookup

function initializeStations() {
  allStations = [];
  stationMap = {};
  
  LINES.forEach(line => {
    line.stations.forEach(station => {
      if (station.x !== null && station.y !== null) {
        const stationWithLine = {
          ...station,
          line: line.name,
          lineColor: line.color,
        };
        allStations.push(stationWithLine);
        stationMap[station.name.toLowerCase()] = stationWithLine;
      }
    });
  });
  
  // Remove duplicates by ID (keeping the first occurrence)
  const seen = new Set();
  allStations = allStations.filter(st => {
    if (seen.has(st.id)) return false;
    seen.add(st.id);
    return true;
  });
}

// Render SVG Map
function renderMap() {
  const svg = document.getElementById('metro-svg');
  svg.innerHTML = '';

  // Draw lines
  LINES.forEach(line => {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const s1 = line.stations[i];
      const s2 = line.stations[i + 1];
      if (s1.x === null || s1.y === null || s2.x === null || s2.y === null) continue;

      const lineElem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineElem.setAttribute('x1', s1.x);
      lineElem.setAttribute('y1', s1.y);
      lineElem.setAttribute('x2', s2.x);
      lineElem.setAttribute('y2', s2.y);
      lineElem.setAttribute('stroke', line.color);
      lineElem.setAttribute('stroke-width', '7');
      lineElem.setAttribute('stroke-linecap', 'round');
      lineElem.setAttribute('opacity', '0.85');
      lineElem.classList.add('metro-line');
      svg.appendChild(lineElem);
    }
  });

  // Draw stations
  allStations.forEach(station => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', station.x);
    circle.setAttribute('cy', station.y);
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', '#fff');
    circle.setAttribute('data-id', station.id);
    circle.setAttribute('data-name', station.name);
    circle.classList.add('station');

    svg.appendChild(circle);
  });

  updateMapMarkers();
}

// Update Map Markers (highlight guessed stations)
function updateMapMarkers() {
  const svg = document.getElementById('metro-svg');
  const circles = svg.querySelectorAll('.station');
  
  circles.forEach(circle => {
    const stationName = circle.getAttribute('data-name');
    const isGuessed = gameState.guessedStations.has(stationName);
    
    if (isGuessed) {
      circle.setAttribute('fill', '#0078d7');
      circle.setAttribute('r', '10');
      circle.setAttribute('opacity', '0.85');
      circle.classList.add('correct');
    } else {
      circle.setAttribute('fill', '#fff');
      circle.setAttribute('r', '8');
      circle.setAttribute('opacity', '1');
      circle.classList.remove('correct');
    }
  });
}

// Find Station (case-insensitive)
function findStation(name) {
  const normalized = name.trim().toLowerCase();
  return stationMap[normalized];
}

// Handle Guess
function handleGuess() {
  const input = document.getElementById('stationInput');
  const stationName = input.value.trim();

  if (!stationName) {
    return;
  }

  const station = findStation(stationName);

  if (!station) {
    gameState.wrongGuesses++;
    updateWrongCounterDisplay();
    showFeedback(`找不到車站「${stationName}」`, 'wrong');
    input.value = '';
    return;
  }

  if (gameState.guessedStations.has(station.name)) {
    gameState.wrongGuesses++;
    updateWrongCounterDisplay();
    showFeedback(`已經猜過「${station.name}」！`, 'wrong');
    input.value = '';
    return;
  }

  // Correct Guess!
  gameState.guessedStations.add(station.name);
  showFeedback(`✓ 正確！${station.name} (${station.line})`, 'correct');
  input.value = '';

  updateStats();
  updateMapMarkers();
  updateAnalysis();
  updateGuessedList();
  saveProgress();
  input.focus();

  // Check if all stations are found
  if (gameState.guessedStations.size === allStations.length) {
    stopTimer();
    setTimeout(() => {
      showFeedback(`🎉 恭喜完成！共用時 ${getTimerFormatted()} 和 ${gameState.wrongGuesses} 次錯誤`, 'correct');
    }, 500);
  }
}

function getTimerFormatted() {
  const minutes = Math.floor(gameState.seconds / 60);
  const seconds = gameState.seconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Show Feedback
function showFeedback(message, type) {
  const feedbackElem = document.getElementById('feedback') || createFeedbackElement();
  feedbackElem.textContent = message;
  feedbackElem.className = 'feedback ' + type;
  feedbackElem.style.display = 'block';

  setTimeout(() => {
    feedbackElem.className = 'feedback';
    feedbackElem.style.display = 'none';
  }, 2000);
}

function createFeedbackElement() {
  const elem = document.createElement('div');
  elem.id = 'feedback';
  elem.style.display = 'none';
  elem.style.marginTop = '1rem';
  const container = document.querySelector('.game-info');
  const inputSection = document.querySelector('.input-section');
  container.insertBefore(elem, inputSection.nextSibling);
  return elem;
}

// Save Progress
function saveProgress() {
  const saveData = {
    guessedStations: Array.from(gameState.guessedStations),
    seconds: gameState.seconds,
    wrongGuesses: gameState.wrongGuesses,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
}

// Load Progress
function loadProgress() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return false;

  try {
    const saveData = JSON.parse(data);
    gameState.guessedStations = new Set(saveData.guessedStations);
    gameState.seconds = saveData.seconds || 0;
    gameState.wrongGuesses = saveData.wrongGuesses || 0;
    return true;
  } catch (e) {
    console.error('Failed to load progress:', e);
    return false;
  }
}

// Update Stats Display
function updateStats() {
  const found = gameState.guessedStations.size;
  document.getElementById('score-display').textContent = `已找到：${found}`;
  document.getElementById('total-display').textContent = `全部車站：${allStations.length}`;
}

// Update Analysis by Line
function updateAnalysis() {
  const analysisDiv = document.getElementById('analysis');
  analysisDiv.innerHTML = '';

  // Group stations by line
  const lineStats = {};
  LINES.forEach(line => {
    lineStats[line.name] = {
      color: line.color,
      total: 0,
      guessed: 0,
    };
  });

  allStations.forEach(station => {
    lineStats[station.line].total++;
    if (gameState.guessedStations.has(station.name)) {
      lineStats[station.line].guessed++;
    }
  });

  // Sort lines by their order in LINES
  LINES.forEach(line => {
    const stats = lineStats[line.name];
    const percent = stats.total > 0 ? Math.round((stats.guessed / stats.total) * 100) : 0;

    const lineDiv = document.createElement('div');
    lineDiv.className = 'line-stat';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'line-stat-name';
    
    const colorDot = document.createElement('span');
    colorDot.className = 'line-color-dot';
    colorDot.style.backgroundColor = getColorValue(line.color);
    
    nameSpan.appendChild(colorDot);
    nameSpan.appendChild(document.createTextNode(line.name));

    const progressSpan = document.createElement('div');
    progressSpan.className = 'line-stat-progress';
    progressSpan.textContent = `${stats.guessed}/${stats.total} (${percent}%)`;

    lineDiv.appendChild(nameSpan);
    lineDiv.appendChild(progressSpan);
    analysisDiv.appendChild(lineDiv);
  });
}

// Extract actual color value from CSS variable
function getColorValue(colorVar) {
  const map = {
    'var(--red)': '#e3002c',
    'var(--pink)': '#fcbac7',
    'var(--blue)': '#0070bd',
    'var(--green)': '#008659',
    'var(--orange)': '#f8b61c',
    'var(--brown)': '#a05a2c',
    'var(--yellow)': '#fffb00',
    'var(--purple)': '#a554a1',
    'var(--light-green)': '#b7d900',
    'var(--light-brown)': '#dbd0a1',
  };
  return map[colorVar] || '#999';
}

// Update Guessed List
function updateGuessedList() {
  const listElem = document.getElementById('guessedStations');
  listElem.innerHTML = '';

  const sortedGuesses = Array.from(gameState.guessedStations).sort().reverse();
  sortedGuesses.forEach(stationName => {
    const li = document.createElement('li');
    li.textContent = stationName;
    listElem.appendChild(li);
  });
}

// Reset Game
function resetGame() {
  if (confirm('確定要重新開始嗎？所有進度都會被清除。')) {
    gameState.guessedStations.clear();
    gameState.seconds = 0;
    gameState.wrongGuesses = 0;
    gameState.timerActive = false;
    document.getElementById('stationInput').value = '';
    
    // Stop and restart timer
    stopTimer();
    startTimer();
    
    updateStats();
    updateMapMarkers();
    updateAnalysis();
    updateGuessedList();
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Timer Functions
function startTimer() {
  if (gameState.timerActive) return;
  
  gameState.timerActive = true;
  timerInterval = setInterval(() => {
    gameState.seconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  gameState.timerActive = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(gameState.seconds / 60);
  const seconds = gameState.seconds % 60;
  document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateWrongCounterDisplay() {
  document.getElementById('wrong-counter').textContent = gameState.wrongGuesses.toString();
}

// Zoom Controls
let currentScale = 1;
let offsetX = 0;
let offsetY = 0;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

function zoomMap(factor) {
  const svg = document.getElementById('metro-svg');
  
  currentScale *= factor;
  currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentScale));
  
  svg.style.transform = `scale(${currentScale}) translate(${offsetX}px, ${offsetY}px)`;
}

function resetZoom() {
  currentScale = 1;
  offsetX = 0;
  offsetY = 0;
  const svg = document.getElementById('metro-svg');
  svg.style.transform = 'scale(1) translate(0px, 0px)';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize
  initializeStations();
  renderMap();

  // Load saved progress
  if (loadProgress()) {
    updateStats();
    updateAnalysis();
    updateGuessedList();
    updateMapMarkers();
  } else {
    updateStats();
    updateAnalysis();
  }

  // Initialize timer and counters display
  updateTimerDisplay();
  updateWrongCounterDisplay();

  // Start timer only if not all stations have been found
  if (gameState.guessedStations.size < allStations.length) {
    startTimer();
  }

  // Input & Button Events
  const stationInput = document.getElementById('stationInput');
  const guessBtn = document.getElementById('guessBtn');

  guessBtn.addEventListener('click', handleGuess);
  stationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
  });

  document.getElementById('reset-btn').addEventListener('click', resetGame);

  // Zoom Controls
  document.getElementById('zoom-in').addEventListener('click', () => zoomMap(1.2));
  document.getElementById('zoom-out').addEventListener('click', () => zoomMap(0.8));
  document.getElementById('zoom-default').addEventListener('click', resetZoom);

  // Pan and Zoom Support
  let lastX = 0;
  let lastY = 0;
  let isPanning = false;

  const container = document.querySelector('.map-container');
  const svg = document.getElementById('metro-svg');

  // ===== DESKTOP: Mouse Wheel Zoom =====
  container.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom at cursor position
      const oldScale = currentScale;
      currentScale *= zoomFactor;
      currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentScale));

      // Adjust offset to zoom towards cursor position
      const scaleDifference = currentScale - oldScale;
      offsetX -= (mouseX / oldScale) * scaleDifference;
      offsetY -= (mouseY / oldScale) * scaleDifference;

      updateTransform();
    },
    { passive: false }
  );

  // ===== DESKTOP: Mouse Drag Pan =====
  container.addEventListener('mousedown', (e) => {
    // Pan with left-click
    if (e.button === 0) {
      isPanning = true;
      container.style.cursor = 'grabbing';
      lastX = e.clientX;
      lastY = e.clientY;
      e.preventDefault();
    }
  });

  container.addEventListener('mousemove', (e) => {
    if (!isPanning) {
      // Show grab cursor when hovering over zoomed map
      if (currentScale > 1.05) {
        container.style.cursor = 'grab';
      } else {
        container.style.cursor = 'crosshair';
      }
      return;
    }

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    offsetX += dx / currentScale;
    offsetY += dy / currentScale;
    updateTransform();
    lastX = e.clientX;
    lastY = e.clientY;
  });

  container.addEventListener('mouseup', () => {
    isPanning = false;
    container.style.cursor = currentScale > 1.05 ? 'grab' : 'crosshair';
  });

  container.addEventListener('mouseleave', () => {
    isPanning = false;
  });

  // ===== TOUCH: Pinch Zoom & Pan =====
  let touchStartDistance = 0;
  let touchStartScale = 1;
  let lastTouchX = 0;
  let lastTouchY = 0;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistance = Math.sqrt(dx * dx + dy * dy);
      touchStartScale = currentScale;
    } else if (e.touches.length === 1) {
      // Single touch pan
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scale = (currentDistance / touchStartDistance) * touchStartScale;
      currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
      updateTransform();
    } else if (e.touches.length === 1 && currentScale > 1.05) {
      // Single touch pan when zoomed
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      offsetX += dx / currentScale;
      offsetY += dy / currentScale;
      updateTransform();
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  });

  // Helper function to apply transform
  function updateTransform() {
    svg.style.transform = `scale(${currentScale}) translate(${offsetX}px, ${offsetY}px)`;
  }

  // Focus input on load
  stationInput.focus();
});
